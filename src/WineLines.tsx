import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Empty } from './components';
import { calendar, getVariety, releaseCount } from './game';
import type { GameState, Wine } from './game';
import { matchesSearch } from './search';
import { vintage } from './winemaking';
import { Composition, SalesCount, WineBottle } from './WinePresentation';
import { JudgingStatus } from './WinePromotion';
import { TastingNotes } from './TastingNotes';
import { releaseTasting } from './wineSensory';
import { privateStock } from './bottleStorage';
import { releaseFacts, wineLineResult } from './finance';
import { recordedMoney, ReleaseFacts } from './ReleaseFacts';

const RELEASES_PER_PAGE = 5;

function ReleaseHistory({
  releases,
  state,
}: {
  releases: Wine[];
  state: GameState;
}) {
  const [visibleCount, setVisibleCount] = useState(RELEASES_PER_PAGE);
  const remaining = releases.length - visibleCount;
  const firstRelease = useRef<HTMLElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const previousCount = useRef(visibleCount);
  useEffect(() => {
    if (visibleCount > previousCount.current) {
      history.current
        ?.querySelectorAll('summary')
        [previousCount.current]?.focus({ preventScroll: true });
    }
    previousCount.current = visibleCount;
  }, [visibleCount]);
  return (
    <div className="release-history" ref={history}>
      <p className="release-history-caption" aria-live="polite">
        {Math.min(visibleCount, releases.length)} of {releases.length} releases
        {' · Newest first'}
      </p>
      {releases.slice(0, visibleCount).map((wine, index) => {
        const { soldPercent } = releaseFacts(wine);
        return (
          <details key={wine.id}>
            <summary ref={index === 0 ? firstRelease : undefined}>
              <span className="release-number">
                No. {String(wine.release).padStart(2, '0')}
              </span>
              <span>
                <span className="release-label">{wine.label}</span>
                <small>
                  {vintage(wine.components)} ·{' '}
                  {wine.bottles === 0
                    ? 'Sold out'
                    : `${wine.bottles.toLocaleString()} bottles in stock`}
                </small>
              </span>
              <b>
                {wine.quality}
                <small>POINTS</small>
              </b>
            </summary>
            <div className="release-details">
              <JudgingStatus wine={wine} />
              <dl className="release-stock">
                <div>
                  <dt>Produced</dt>
                  <dd>
                    {wine.produced === null
                      ? 'Unrecorded'
                      : wine.produced.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt>Sold</dt>
                  <dd>
                    <SalesCount wines={[wine]} />
                  </dd>
                </div>
                <div>
                  <dt>Remaining</dt>
                  <dd>{wine.bottles.toLocaleString()}</dd>
                </div>
                {privateStock(wine) > 0 && (
                  <div>
                    <dt>Private Collection</dt>
                    <dd>{privateStock(wine).toLocaleString()}</dd>
                  </div>
                )}
                <div>
                  <dt>Sold through</dt>
                  <dd>
                    {soldPercent === null
                      ? 'Unrecorded'
                      : `${soldPercent.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`}
                  </dd>
                </div>
                {wine.produced !== null && (
                  <div>
                    <dt>Since bottling</dt>
                    <dd>
                      {Math.max(0, state.week - wine.bottled).toLocaleString()}{' '}
                      {state.week - wine.bottled === 1 ? 'week' : 'weeks'}
                    </dd>
                  </div>
                )}
              </dl>
              <ReleaseFacts wine={wine} />
              <Composition parts={wine.components} state={state} />
              <TastingNotes profile={releaseTasting(wine, state)} />
              {wine.design.note && (
                <div className="release-winemaker-note">
                  <h4>Winemaker’s note</h4>
                  <p>{wine.design.note}</p>
                </div>
              )}
              <p className="fine-print">
                Bottled by {wine.estate}
                {wine.produced !== null &&
                  ` · Year ${calendar(wine.bottled).year}, week ${calendar(wine.bottled).week}`}
              </p>
            </div>
          </details>
        );
      })}
      {releases.length > RELEASES_PER_PAGE && (
        <div className="release-history-actions">
          {remaining > 0 && (
            <button
              className="button secondary"
              onClick={() =>
                setVisibleCount((count) => count + RELEASES_PER_PAGE)
              }
            >
              Show {Math.min(RELEASES_PER_PAGE, remaining)} older releases
            </button>
          )}
          {visibleCount > RELEASES_PER_PAGE && (
            <button
              className="text-button"
              onClick={() => {
                setVisibleCount(RELEASES_PER_PAGE);
                firstRelease.current?.focus();
              }}
            >
              Show latest {RELEASES_PER_PAGE} only
            </button>
          )}
        </div>
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
  const [query, setQuery] = useState('');
  const searchInput = useRef<HTMLInputElement>(null);
  const releasesByLine = new Map<number, Wine[]>();
  for (const wine of state.wines) {
    const releases = releasesByLine.get(wine.lineId) ?? [];
    releases.push(wine);
    releasesByLine.set(wine.lineId, releases);
  }
  const lines = state.lines.filter((line) =>
    matchesSearch(
      [
        line.name,
        ...(releasesByLine.get(line.id) ?? []).flatMap((wine) => [
          wine.label,
          ...wine.components.map(
            (part) => getVariety(state, part.variety).name,
          ),
        ]),
      ].join(' '),
      query,
    ),
  );
  const clearSearch = () => {
    setQuery('');
    searchInput.current?.focus();
  };
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
            Your house labels, at a glance. Open a wine line to explore its
            releases, tasting notes, sales, and profit. Older sold-out releases
            are summarized as the archive grows.
          </p>
        </div>
      </div>
      {history && (
        <dl className="history-totals">
          <div>
            <dt>Releases in the archive</dt>
            <dd>{releaseCount(state).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Bottles sold · all time</dt>
            <dd>{state.stats.sold.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Bottles in stock</dt>
            <dd>
              {state.wines
                .reduce((n, wine) => n + wine.bottles, 0)
                .toLocaleString()}
            </dd>
          </div>
        </dl>
      )}
      {state.wines.some((wine) => wine.produced === null) && (
        <p className="history-note">
          Older releases have incomplete production and sales records. A + marks
          sales tracked since this update; earlier sales are included only in
          the estate’s all-time total.
        </p>
      )}
      {state.lines.length > 0 && (
        <p className="history-profit-note">
          Profit is recorded wine sales minus the production cost of bottles
          sold and all marketing and judging fees. It excludes vine care, estate
          upkeep, research, and equipment. Missing older records show
          “Unrecorded”.
        </p>
      )}
      {state.lines.length === 0 ? (
        <Empty icon="glass" title="Your first house label starts here.">
          Bottle a reserve to create a wine line. Choose its name, bottle shape,
          and label, then return to it with future vintages.
        </Empty>
      ) : (
        <>
          <div className="wine-lines-toolbar">
            <label className="wine-lines-search">
              <Search size={17} aria-hidden="true" />
              <span className="visually-hidden">Search wine lines</span>
              <input
                ref={searchInput}
                type="search"
                placeholder="Search by wine name or grape"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {query && (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={clearSearch}
              >
                <X size={17} />
              </button>
            )}
            <span className="wine-lines-count" role="status">
              {lines.length} of {state.lines.length} wine lines
            </span>
          </div>
          {lines.length === 0 && (
            <Empty
              icon="glass"
              title="No matching wine lines."
              action="Clear search"
              onAction={clearSearch}
            >
              Try another wine name or grape.
            </Empty>
          )}
          {lines.map((line) => {
            const releases = [...(releasesByLine.get(line.id) ?? [])].sort(
              (a, b) => b.release - a.release,
            );
            const totalReleases =
              releases.length + (line.archive?.releases ?? 0);
            const latest = releases[0];
            const stock = releases.reduce((n, wine) => n + wine.bottles, 0);
            const result = wineLineResult(releases, line.archive);
            return (
              <details className="line-archive" key={line.id}>
                <summary className="line-summary">
                  <div className="line-identity">
                    <WineBottle
                      name={line.name}
                      estate={latest?.estate ?? state.name}
                      design={line.design}
                      founded={line.founded}
                      year={
                        latest
                          ? vintage(latest.components)
                          : `Year ${line.founded}`
                      }
                      release={totalReleases}
                      white={
                        latest &&
                        getVariety(state, latest.variety).wineType === 'White'
                      }
                    />
                    <div>
                      <h3>{line.name}</h3>
                      <p>
                        {totalReleases}{' '}
                        {totalReleases === 1 ? 'release' : 'releases'}
                        {' · Est. year '}
                        {line.founded}
                        {result.best !== null &&
                          ` · Best ${result.best} points`}
                        {stock === 0 && totalReleases > 0 && ' · Sold out'}
                      </p>
                    </div>
                  </div>
                  <div className="line-figures">
                    <span>
                      <strong>{stock.toLocaleString()}</strong>
                      <small>Bottles in stock</small>
                    </span>
                    <span>
                      <strong>
                        <SalesCount wines={releases} archive={line.archive} />
                      </strong>
                      <small>Bottles sold</small>
                    </span>
                    <span>
                      <strong>{recordedMoney(result.profitCents)}</strong>
                      <small>Total profit</small>
                    </span>
                  </div>
                  <span className="line-toggle">
                    <span className="line-show">View releases</span>
                    <span className="line-hide">Hide releases</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </span>
                </summary>
                {line.archive && (
                  <p className="history-note">
                    {line.archive.releases.toLocaleString()} earlier sold-out
                    releases summarized ·{' '}
                    {line.archive.produced.toLocaleString()}
                    {line.archive.complete ? '' : '+'} bottles produced · best{' '}
                    {line.archive.best}/100. Individual tasting records were
                    compacted.
                  </p>
                )}
                <ReleaseHistory releases={releases} state={state} />
              </details>
            );
          })}
        </>
      )}
    </section>
  );
}
