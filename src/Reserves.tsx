import type { ResearchId } from './catalog';
import { blendResearchMissing } from './researchProgression';
import { RESEARCH } from './catalog';
import { ESTATE_LIMITS } from './estates';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Plus, Shuffle, X } from 'lucide-react';
import { generateBlendName } from './blendNames';
import { BlendAnalysis, BlendTasting } from './BlendAnalysis';
import { Empty, Icon, Modal } from './components';
import { calendar, getVariety } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import {
  assess,
  blendProfile,
  combine,
  DEFAULT_DESIGN,
  LABEL_COLORS,
  isSmallReserve,
  liters,
  portion,
  vintage,
  volume,
} from './winemaking';
import type { LabelDesign, Reserve } from './winemaking';
import { Composition, WineBottle } from './WinePresentation';
import { TastingNotes } from './TastingNotes';
import { tastingProfile } from './wineSensory';
import {
  loadReserveSort,
  RESERVE_SORT_KEY,
  RESERVE_SORT_OPTIONS,
  sortReserves,
} from './reserveSort';
import type { ReserveSort } from './reserveSort';
import { warehouseRoom } from './bottleStorage';

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
  const room = warehouseRoom(state);
  const limit = Math.min(max, state.kits, room);
  const [count, setCount] = useState(String(limit));
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
    bottles <= room &&
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
                  ? state.wines.filter((w) => w.lineId === line.id).length +
                    (line.archive?.releases ?? 0) +
                    1
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
              {state.wines.filter((w) => w.lineId === line.id).length +
                (line.archive?.releases ?? 0) +
                1}{' '}
              will carry this line’s original bottle and label. Earlier releases
              stay in its history.
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
                max={Math.max(1, limit)}
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
          <p className="bottling-storage-note" role="status">
            {room === 0
              ? 'Warehouse full. Sell bottles in the wine shop or add storage above. This wine can stay in reserves.'
              : `${room.toLocaleString()} bottle spaces free in the warehouse. You can bottle up to ${limit.toLocaleString()} with your current wine, kits and space.`}
          </p>
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
  const [sort, setSort] = useState(loadReserveSort);
  useEffect(() => {
    try {
      localStorage.setItem(RESERVE_SORT_KEY, sort);
    } catch {
      // Keep the selected order usable even when it cannot be saved.
    }
  }, [sort]);
  const [blendName, setBlendName] = useState('');
  const [bottling, setBottling] = useState<number | null>(null);
  const [tasting, setTasting] = useState<number | null>(null);
  const [clearing, setClearing] = useState<Reserve[] | null>(null);
  const closeClearing = useCallback(() => setClearing(null), []);
  const reserveHeading = useRef<HTMLHeadingElement>(null);
  const smallReserves = state.reserves.filter(isSmallReserve);
  const smallVolume = smallReserves.reduce(
    (n, r) => n + volume(r.components),
    0,
  );
  const clearingVolume =
    clearing?.reduce((n, r) => n + volume(r.components), 0) ?? 0;
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
          <h2 ref={reserveHeading} tabIndex={-1}>
            Keep a little. Create something new.
          </h2>
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
          {smallReserves.length > 0 && (
            <div className="reserve-leftovers">
              <div>
                <strong>Small leftovers · {liters(smallVolume)} L</strong>
                <p>
                  {smallReserves.length}{' '}
                  {smallReserves.length === 1 ? 'lot holds' : 'lots hold'} less
                  than a 750 mL bottle each. Blend them into another wine, or
                  clear them to free reserve spaces.
                </p>
              </div>
              <div className="reserve-leftover-actions">
                <button
                  className="text-button"
                  onClick={() => {
                    setBottling(null);
                    setAmounts(
                      Object.fromEntries(
                        smallReserves.map((r) => [
                          r.id,
                          String(volume(r.components) / 1000),
                        ]),
                      ),
                    );
                  }}
                >
                  Select for blending
                </button>
                <button
                  className="button secondary"
                  onClick={() => setClearing(smallReserves)}
                >
                  Clear small leftovers
                </button>
              </div>
            </div>
          )}
          <div className="reserve-workspace">
            <div className="reserve-list">
              <label className="reserve-sort">
                Sort by
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as ReserveSort)}
                >
                  {Object.entries(RESERVE_SORT_OPTIONS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              {sortReserves(state.reserves, sort).map((r) => {
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
                          title={
                            total < 750
                              ? 'A bottle needs 750 mL. Blend this lot or clear small leftovers.'
                              : undefined
                          }
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
                maturation happens in the cellar before transfer.
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
      {clearing && (
        <Modal title="Clear small leftovers?" onClose={closeClearing}>
          <div className="reserve-clear-review">
            <p>
              Free {clearing.length} reserve{' '}
              {clearing.length === 1 ? 'space' : 'spaces'} by discarding these
              lots. Each contains less than one 750 mL bottle.
            </p>
            <ul
              className="reserve-clear-lots"
              aria-label="Lots to discard"
              tabIndex={0}
            >
              {clearing.map((r) => (
                <li key={r.id}>
                  <div>
                    <small>
                      Lot {String(r.id).padStart(2, '0')} ·{' '}
                      {vintage(r.components)}
                    </small>
                    <span>{r.name}</span>
                  </div>
                  <strong>{liters(volume(r.components))} L</strong>
                </li>
              ))}
            </ul>
            <p>
              The listed wine will be permanently discarded. No cash or
              knowledge is earned. Cancel to keep it for blending.
            </p>
            <div className="reserve-clear-actions">
              <button className="button secondary" onClick={closeClearing}>
                Cancel
              </button>
              <button
                className="button primary"
                onClick={() => {
                  if (
                    dispatch({
                      type: 'discardSmallReserves',
                      lots: clearing.map((r) => ({
                        id: r.id,
                        ml: volume(r.components),
                      })),
                    })
                  ) {
                    setAmounts((previous) =>
                      Object.fromEntries(
                        Object.entries(previous).filter(
                          ([id]) => !clearing.some((r) => r.id === Number(id)),
                        ),
                      ),
                    );
                    closeClearing();
                    reserveHeading.current?.focus({ preventScroll: true });
                  }
                }}
              >
                Discard {liters(clearingVolume)} L
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
