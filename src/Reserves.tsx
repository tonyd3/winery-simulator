import type { ResearchId } from './catalog';
import { blendResearchMissing } from './researchProgression';
import { RESEARCH } from './catalog';
import { ESTATE_LIMITS } from './estates';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Plus, Shuffle, X } from 'lucide-react';
import { generateBlendName } from './blendNames';
import { BlendAnalysis, BlendTasting } from './BlendAnalysis';
import { JudgingStatus } from './WinePromotion';
import { Empty, Icon } from './components';
import { calendar, getVariety } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import {
  assess,
  blendProfile,
  combine,
  DEFAULT_DESIGN,
  LABEL_COLORS,
  liters,
  portion,
  vintage,
  volume,
} from './winemaking';
import type { LabelDesign, Reserve } from './winemaking';
import { Composition, SalesCount, WineBottle } from './WinePresentation';
import { TastingNotes } from './TastingNotes';
import { releaseTasting, tastingProfile } from './wineSensory';

function BottlingForm({
  reserve,
  state,
  dispatch,
  onClose,
}: {
  reserve: Reserve;
  state: GameState;
  dispatch: Dispatch;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    panel.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    panel.current?.querySelector('select')?.focus({ preventScroll: true });
  }, []);
  const [lineId, setLineId] = useState('new');
  const [name, setName] = useState(reserve.name);
  const [design, setDesign] = useState<LabelDesign>({ ...DEFAULT_DESIGN });
  const total = volume(reserve.components);
  const max = Math.floor(total / 750);
  const [count, setCount] = useState(String(Math.min(max, state.kits)));
  const line = state.lines.find((l) => String(l.id) === lineId);
  const activeDesign = line?.design ?? design;
  const q = assess(reserve.components, state.hybrids);
  const bottles = Number(count);
  const previewParts =
    Number.isInteger(bottles) && bottles > 0 && bottles <= max
      ? portion(reserve.components, bottles * 750).filter((p) => p.ml > 0)
      : reserve.components;
  const valid =
    Number.isInteger(bottles) &&
    bottles > 0 &&
    bottles <= max &&
    bottles <= state.kits &&
    (line || (lineId === 'new' && name.trim()));
  return (
    <section
      ref={panel}
      className="bottling-workbench"
      aria-label="Bottle a release"
    >
      <div className="section-line">
        <div>
          <span className="eyebrow">FROM RESERVE TO RELEASE</span>
          <h3>Bottle your wine.</h3>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Cancel bottling"
        >
          <X size={18} />
        </button>
      </div>
      <div className="bottling-layout">
        <div className="bottling-story">
          <div className="bottling-preview">
            <WineBottle
              name={line?.name ?? name}
              estate={state.name}
              design={activeDesign}
              founded={line?.founded ?? calendar(state.week).year}
              year={vintage(reserve.components)}
              release={
                line
                  ? state.wines.filter((w) => w.lineId === line.id).length + 1
                  : 1
              }
              white={
                getVariety(
                  state,
                  blendProfile(previewParts, state.hybrids).dominant!.variety,
                ).wineType === 'White'
              }
            />
            <span className="eyebrow">YOUR NEXT RELEASE</span>
            <p>{vintage(reserve.components)}</p>
          </div>
          <TastingNotes profile={tastingProfile(previewParts, state)} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (
              valid &&
              dispatch({
                type: 'bottle',
                id: reserve.id,
                bottles,
                line: line ? { id: line.id } : { name, design },
              })
            )
              onClose();
          }}
        >
          <label className="field-label" htmlFor="wine-line">
            Wine line
          </label>
          <select
            id="wine-line"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
          >
            <option value="new">Create a new wine line</option>
            {state.lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} · established Year {l.founded}
              </option>
            ))}
          </select>
          {line ? (
            <p className="line-inheritance">
              Release{' '}
              {state.wines.filter((w) => w.lineId === line.id).length + 1} will
              carry this line’s original bottle and label. Earlier releases stay
              in its history.
            </p>
          ) : (
            <>
              <label className="field-label" htmlFor="line-name">
                Name your wine line
              </label>
              <input
                id="line-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                required
              />
              <div className="design-selects">
                <div>
                  <label className="field-label" htmlFor="label-style">
                    Label
                  </label>
                  <select
                    id="label-style"
                    value={design.style}
                    onChange={(e) =>
                      setDesign({
                        ...design,
                        style: e.target.value as LabelDesign['style'],
                      })
                    }
                  >
                    <option value="heritage">Heritage crest</option>
                    <option value="estate">Estate landscape</option>
                    <option value="modern">Modern colorblock</option>
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="bottle-shape">
                    Bottle
                  </label>
                  <select
                    id="bottle-shape"
                    value={design.bottle}
                    onChange={(e) =>
                      setDesign({
                        ...design,
                        bottle: e.target.value as LabelDesign['bottle'],
                      })
                    }
                  >
                    <option value="shouldered">Classic shoulders</option>
                    <option value="rounded">Rounded shoulders</option>
                    <option value="slender">Slender flute</option>
                  </select>
                </div>
              </div>
              <fieldset className="label-swatches">
                <legend>Label color</legend>
                {Object.entries(LABEL_COLORS).map(([id, color]) => (
                  <button
                    type="button"
                    key={id}
                    className={design.color === id ? 'selected' : ''}
                    style={{ background: color }}
                    aria-label={`${id} label`}
                    aria-pressed={design.color === id}
                    onClick={() =>
                      setDesign({
                        ...design,
                        color: id as LabelDesign['color'],
                      })
                    }
                  />
                ))}
              </fieldset>
            </>
          )}
          <div className="bottling-quantity">
            <div>
              <label className="field-label" htmlFor="bottle-count">
                Number of bottles
              </label>
              <input
                id="bottle-count"
                type="number"
                min="1"
                max={Math.min(max, state.kits)}
                step="1"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
              />
            </div>
            <p>
              {state.kits.toLocaleString()} kits available
              <br />
              750 mL per bottle · {max.toLocaleString()} possible
            </p>
          </div>
          <p className="tasting-estimate">
            {reserve.score !== null
              ? `Assessed at ${reserve.score} points. Further bottles keep this score.`
              : `Estimated ${Math.max(0, q.expected - 3)}–${Math.min(100, q.expected + 3)} points. Final tasting revealed when you bottle.`}
          </p>
          <p className="fine-print">
            {valid
              ? `${liters(total - bottles * 750)} L will remain in reserves. `
              : ''}
            One kit per bottle. Your recipe, tasting notes, and label are saved
            with this release.
          </p>
          <button className="button primary wide" disabled={!valid}>
            Bottle & reveal <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

export default function Reserves({
  state,
  dispatch,
  onResearch,
}: {
  state: GameState;
  dispatch: Dispatch;
  onResearch: (id?: ResearchId) => void;
}) {
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [blendName, setBlendName] = useState('');
  const [bottling, setBottling] = useState<number | null>(null);
  const [tasting, setTasting] = useState<number | null>(null);
  const selected = state.reserves.filter((r) => amounts[r.id] !== undefined);
  const portions = selected.map((r) => ({
    id: r.id,
    ml: Math.round(Number(amounts[r.id]) * 1000),
  }));
  const valid =
    selected.length >= 2 &&
    portions.every(
      (p) =>
        Number.isFinite(p.ml) &&
        p.ml > 0 &&
        p.ml <= volume(state.reserves.find((r) => r.id === p.id)!.components),
    );
  const preview = valid
    ? combine(
        selected.flatMap((r, i) =>
          portion(r.components, portions[i].ml).filter((p) => p.ml > 0),
        ),
      )
    : [];
  const missingResearch = blendResearchMissing(state, preview);
  const bottleReserve = state.reserves.find((r) => r.id === bottling);
  const tastingReserve = state.reserves.find((r) => r.id === tasting);
  return (
    <div className="reserves-page">
      <div className="section-intro">
        <div>
          <span className="eyebrow">THE RESERVE COLLECTION</span>
          <h2>Keep a little. Create something new.</h2>
          <p>
            Store finished wine, blend grapes and vintages, or bottle a single
            reserve.
          </p>
        </div>
        <span className="capacity-chip">
          <Icon name="barrel" />
          {liters(
            state.reserves.reduce((n, r) => n + volume(r.components), 0),
          )}{' '}
          L · {state.reserves.length} / {ESTATE_LIMITS.reserves} lots
        </span>
      </div>
      {state.reserves.length === 0 ? (
        <Empty icon="barrel" title="Make room for future vintages.">
          Move a finished fermentation into reserves. Your tank becomes
          available, and the wine keeps until you’re ready to blend or bottle.
        </Empty>
      ) : (
        <>
          <div className="reserve-workspace">
            <div className="reserve-list">
              {state.reserves.map((r) => {
                const total = volume(r.components);
                const checked = amounts[r.id] !== undefined;
                return (
                  <article
                    key={r.id}
                    className={`reserve-row ${checked ? 'selected' : ''}`}
                  >
                    <div className="reserve-heading">
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          aria-label={`Include ${r.name} lot ${r.id}`}
                          onChange={(e) => {
                            setBottling(null);
                            setAmounts((prev) => {
                              const next = { ...prev };
                              if (e.target.checked)
                                next[r.id] = String(total / 1000);
                              else delete next[r.id];
                              return next;
                            });
                          }}
                        />
                        <span>
                          <span className="eyebrow">
                            LOT {String(r.id).padStart(2, '0')} ·{' '}
                            {vintage(r.components)}
                          </span>
                          <h3>{r.name}</h3>
                        </span>
                      </label>
                      <strong>
                        {liters(total)}
                        <small> L</small>
                      </strong>
                    </div>
                    <Composition parts={r.components} state={state} />
                    <div className="reserve-actions">
                      <span>
                        {r.score !== null
                          ? `${r.score} points · assessed`
                          : `${assess(r.components, state.hybrids).expected} potential points`}{' '}
                        · stored {state.week - r.stored}{' '}
                        {state.week - r.stored === 1 ? 'week' : 'weeks'}
                      </span>
                      <button
                        className="text-button"
                        onClick={() => setTasting(r.id)}
                      >
                        <Icon name="glass" size={14} />{' '}
                        {r.score === null ? 'Analyze & score' : 'Tasting notes'}
                      </button>
                      {checked ? (
                        <label className="blend-amount">
                          Use{' '}
                          <input
                            type="number"
                            aria-label={`Liters from lot ${r.id}`}
                            min="0.001"
                            max={total / 1000}
                            step="0.001"
                            value={amounts[r.id]}
                            onChange={(e) =>
                              setAmounts({ ...amounts, [r.id]: e.target.value })
                            }
                          />{' '}
                          L
                        </label>
                      ) : (
                        <button
                          className="text-button"
                          disabled={total < 750}
                          onClick={() => {
                            setAmounts({});
                            setBottling(r.id);
                          }}
                        >
                          Bottle this reserve <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <aside className="blend-bench">
              <span className="eyebrow">THE BLENDING BENCH</span>
              <h3>Your next cuvée.</h3>
              <p>
                Select two or more lots and choose how much to use from each.
              </p>
              {valid ? (
                <>
                  <div className="blend-volume">
                    {liters(volume(preview))}
                    <small> L in your blend</small>
                  </div>
                  <Composition parts={preview} state={state} />
                  <BlendAnalysis parts={preview} state={state} />
                </>
              ) : (
                <div className="blend-placeholder">
                  <Icon name="glass" size={38} />
                  <span>
                    {selected.length
                      ? 'Choose valid amounts from at least two lots.'
                      : 'A little of this. A little of that.'}
                  </span>
                </div>
              )}
              {missingResearch.length > 0 && (
                <div className="blend-research-lock">
                  <p>
                    <b>Research needed</b>
                    <br />
                    {missingResearch.map((id) => RESEARCH[id].name).join(' · ')}
                  </p>
                  <p>
                    You can still analyze a recipe or bottle a single reserve.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => onResearch(missingResearch[0])}
                  >
                    Go to research <ArrowRight size={14} />
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    valid &&
                    !missingResearch.length &&
                    dispatch({ type: 'blend', name: blendName, portions })
                  ) {
                    setAmounts({});
                    setBlendName('');
                    setBottling(null);
                  }
                }}
              >
                <div className="blend-name-heading">
                  <label className="field-label" htmlFor="blend-name">
                    Name this blend
                  </label>
                  <button
                    type="button"
                    className="text-button"
                    aria-label="Generate blend name"
                    title="Suggest a name inspired by your wine region"
                    onClick={() =>
                      setBlendName(generateBlendName(state.region, blendName))
                    }
                  >
                    <Shuffle size={13} /> Generate
                  </button>
                </div>
                <input
                  id="blend-name"
                  maxLength={40}
                  value={blendName}
                  onChange={(e) => setBlendName(e.target.value)}
                  placeholder="e.g. The Founder's Cuvée"
                  required
                />
                <button
                  className="button primary wide"
                  disabled={
                    !valid || !blendName.trim() || missingResearch.length > 0
                  }
                >
                  <Plus size={16} /> Create blend in reserves
                </button>
              </form>
              <p className="fine-print">
                Unselected wine stays in storage. Reserves keep indefinitely;
                aging happens in your fermentation tanks.
              </p>
            </aside>
          </div>
          {bottleReserve && (
            <BottlingForm
              key={bottleReserve.id}
              reserve={bottleReserve}
              state={state}
              dispatch={dispatch}
              onClose={() => setBottling(null)}
            />
          )}
          {tastingReserve && (
            <BlendTasting
              reserve={tastingReserve}
              state={state}
              dispatch={dispatch}
              onClose={() => setTasting(null)}
              onBottle={() => {
                setAmounts({});
                setTasting(null);
                setBottling(tastingReserve.id);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export function WineLines({
  state,
  history = false,
}: {
  state: GameState;
  history?: boolean;
}) {
  return (
    <section className="wine-lines">
      <div className="section-intro">
        <div>
          <span className="eyebrow">
            {history ? 'THE ESTATE ARCHIVE' : 'AN ESTATE IN THE MAKING'}
          </span>
          <h2>
            {history ? 'Every vintage lives on.' : 'Labels with a history.'}
          </h2>
          <p>
            Every release, including sold-out wines. Follow its grapes,
            vintages, tasting score, and bottles sold through the shop or
            wholesale.
          </p>
        </div>
      </div>
      {history && (
        <dl className="history-totals">
          <div>
            <dt>Releases in the archive</dt>
            <dd>{state.wines.length.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Bottles sold · all time</dt>
            <dd>{state.stats.sold.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Bottles in stock</dt>
            <dd>
              {state.wines.reduce((n, w) => n + w.bottles, 0).toLocaleString()}
            </dd>
          </div>
        </dl>
      )}
      {state.wines.some((w) => w.produced === null) && (
        <p className="history-note">
          Older releases have incomplete production and sales records. A + marks
          sales tracked since this update; earlier sales are included only in
          the estate’s all-time total.
        </p>
      )}
      {state.lines.length === 0 ? (
        <Empty icon="glass" title="Your first house label starts here.">
          Bottle a reserve to create a wine line. Choose its name, bottle shape,
          and label, then return to it with future vintages.
        </Empty>
      ) : (
        state.lines.map((line) => {
          const releases = state.wines.filter((w) => w.lineId === line.id);
          const latest = releases.at(-1)!;
          return (
            <article className="line-archive" key={line.id}>
              <div className="line-identity">
                <WineBottle
                  name={line.name}
                  estate={latest?.estate ?? state.name}
                  design={line.design}
                  founded={line.founded}
                  year={
                    latest ? vintage(latest.components) : `Year ${line.founded}`
                  }
                  release={releases.length}
                  white={
                    latest &&
                    getVariety(state, latest.variety).wineType === 'White'
                  }
                />
                <div>
                  <span className="eyebrow">
                    ESTABLISHED YEAR {line.founded} · {line.design.style} LABEL
                  </span>
                  <h3>{line.name}</h3>
                  <p>
                    {releases.length}{' '}
                    {releases.length === 1 ? 'release' : 'releases'} ·{' '}
                    {releases
                      .reduce((n, w) => n + w.bottles, 0)
                      .toLocaleString()}{' '}
                    bottles in stock
                  </p>
                  <p className="line-sales">
                    <strong>
                      <SalesCount wines={releases} />
                    </strong>{' '}
                    bottles sold
                  </p>
                </div>
              </div>
              <div className="release-history">
                {[...releases].reverse().map((w) => (
                  <details key={w.id}>
                    <summary>
                      <span className="release-number">
                        No. {String(w.release).padStart(2, '0')}
                      </span>
                      <span>
                        <span className="release-label">{w.label}</span>
                        <small>
                          {vintage(w.components)}
                          {w.bottles === 0 ? ' · Sold out' : ''}
                        </small>
                        <JudgingStatus wine={w} />
                        <span className="release-stock">
                          <span>
                            <strong>
                              {w.produced === null
                                ? 'Unrecorded'
                                : w.produced.toLocaleString()}
                            </strong>
                            <small>Produced</small>
                          </span>
                          <span>
                            <strong>
                              <SalesCount wines={[w]} />
                            </strong>
                            <small>Sold</small>
                          </span>
                          <span>
                            <strong>{w.bottles.toLocaleString()}</strong>
                            <small>Remaining</small>
                          </span>
                        </span>
                      </span>
                      <b>
                        {w.quality}
                        <small>POINTS</small>
                      </b>
                    </summary>
                    <Composition parts={w.components} state={state} />
                    <TastingNotes profile={releaseTasting(w, state)} />
                    <p className="fine-print">
                      Bottled by {w.estate}
                      {w.produced !== null &&
                        ` · Year ${calendar(w.bottled).year}, week ${calendar(w.bottled).week}`}
                    </p>
                  </details>
                ))}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
