import { useState } from 'react';
import { ArrowUpRight, LayoutGrid, List } from 'lucide-react';
import { WineBottle } from './WinePresentation';
import { getVariety } from './game';
import type { GameState, Wine } from './game';
import type { Dispatch } from './Panels';
import { WineQuickControls } from './WineQuickControls';
import { vintage } from './winemaking';
import { privateStock, saleStock, shelfStock } from './bottleStorage';

export function WineCollection({
  state,
  wines,
  onSelect,
  dispatch,
  privateView = false,
}: {
  state: GameState;
  wines: Wine[];
  onSelect: (id: number) => void;
  dispatch: Dispatch;
  privateView?: boolean;
}) {
  const [view, setView] = useState<'collection' | 'ledger'>('collection');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(24);
  const filtered = [...wines]
    .reverse()
    .filter((wine) =>
      `${wine.label} ${vintage(wine.components)} ${wine.components.map((part) => getVariety(state, part.variety).name).join(' ')}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
    );
  return (
    <section
      className={`wine-collection${privateView ? ' private-wine-collection' : ''}`}
      aria-label={privateView ? 'Kept wines' : 'Wine collection'}
    >
      <div className="collection-tools">
        <label>
          <span className="sr-only">Find a wine</span>
          <input
            type="search"
            aria-label="Find a wine"
            placeholder="Find a wine, grape or vintage"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(24);
            }}
          />
        </label>
        <div className="view-switch" role="group" aria-label="Wine display">
          <button
            aria-pressed={view === 'collection'}
            onClick={() => setView('collection')}
          >
            <LayoutGrid size={15} />
            Collection
          </button>
          <button
            aria-pressed={view === 'ledger'}
            onClick={() => setView('ledger')}
          >
            <List size={15} />
            Ledger
          </button>
        </div>
      </div>
      <div
        className={
          view === 'collection' ? 'bottle-collection' : 'collection-ledger'
        }
      >
        {filtered.slice(0, limit).map((wine) => (
          <article key={wine.id} className="collection-wine">
            <button
              className="collection-select"
              aria-label={`View ${wine.label} release ${wine.release}`}
              onClick={() => onSelect(wine.id)}
            >
              <div className="collection-bottle">
                <WineBottle
                  name={wine.label}
                  estate={wine.estate}
                  design={wine.design}
                  founded={wine.founded}
                  year={vintage(wine.components)}
                  release={wine.release}
                  white={getVariety(state, wine.variety).wineType === 'White'}
                />
                <span className="collection-score">
                  {wine.quality}
                  <small>points</small>
                </span>
              </div>
              <div className="collection-identity">
                <span className="eyebrow">
                  {vintage(wine.components)} · No. {wine.release}
                </span>
                <h3>{wine.label}</h3>
                <p>
                  {[
                    ...new Set(
                      wine.components.map(
                        (part) => getVariety(state, part.variety).name,
                      ),
                    ),
                  ].join(' · ')}
                </p>
              </div>
              <div className="collection-stock">
                <span>
                  {privateView
                    ? `${privateStock(wine).toLocaleString()} kept · ${wine.quality} points`
                    : `${saleStock(wine).toLocaleString()} available for sale · ${wine.listed ? `${shelfStock(wine)} on shelf` : 'Not listed'}`}
                </span>
                <span className="collection-kept">
                  {privateView
                    ? 'Protected from all sales'
                    : privateStock(wine) > 0
                      ? `${privateStock(wine).toLocaleString()} in Private Collection`
                      : ''}
                </span>
              </div>
              <span className="collection-open">
                Wine details <ArrowUpRight size={15} />
              </span>
            </button>
            {!privateView && (
              <WineQuickControls
                wine={wine}
                state={state}
                dispatch={dispatch}
              />
            )}
          </article>
        ))}
      </div>
      {!filtered.length && (
        <p className="collection-empty">
          No wines match this search. Try a wine name, grape or vintage.
        </p>
      )}
      {filtered.length > limit && (
        <button
          className="button secondary collection-more"
          onClick={() => setLimit(limit + 24)}
        >
          Show more wines · {filtered.length - limit} remaining
        </button>
      )}
    </section>
  );
}
