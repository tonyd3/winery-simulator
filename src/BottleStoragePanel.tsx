import { Plus } from 'lucide-react';
import { money } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import {
  BOTTLE_STORAGE,
  bottlesStored,
  shelvesUsed,
  storageCapacity,
  storageExpansionCost,
} from './bottleStorage';
import type { StorageKind } from './bottleStorage';
import './bottle-storage.css';

export function BottleStoragePanel({
  state,
  dispatch,
  shop = false,
}: {
  state: GameState;
  dispatch: Dispatch;
  shop?: boolean;
}) {
  const kinds: StorageKind[] = shop ? ['warehouse', 'shelves'] : ['warehouse'];
  return (
    <section className="bottle-storage" aria-label="Bottled wine capacity">
      {kinds.map((kind) => {
        const terms = BOTTLE_STORAGE[kind];
        const capacity = storageCapacity(state, kind);
        const used =
          kind === 'warehouse' ? bottlesStored(state) : shelvesUsed(state);
        const cost = storageExpansionCost(state, kind);
        const full = (state.bottleStorage?.[kind] ?? 0) >= terms.maxExpansions;
        return (
          <div className="storage-row" key={kind}>
            <div className="storage-description">
              <h3>
                {kind === 'warehouse' ? 'Wine warehouse' : 'Shop shelf space'}
              </h3>
              <p>
                {kind === 'warehouse'
                  ? 'Shared by all estates. Every bottled wine counts, including shelf stock and your Private Collection.'
                  : 'Assign spaces to each release below. Shelves refill from stored stock each game week.'}
              </p>
              {used >= capacity && (
                <p className="storage-warning">
                  {kind === 'warehouse'
                    ? used > capacity
                      ? `${(used - capacity).toLocaleString()} bottles over capacity. Your wine is safe; sell stock or expand before bottling more.`
                      : 'Warehouse full. Sell stock or expand before bottling more.'
                    : 'Shelves full. Reduce or pause a listing to make room for another wine.'}
                </p>
              )}
            </div>
            <div className="storage-count">
              <strong>
                {used.toLocaleString()}{' '}
                <small>/ {capacity.toLocaleString()}</small>
              </strong>
              <span>
                {Math.max(0, capacity - used).toLocaleString()}{' '}
                {kind === 'warehouse'
                  ? 'bottle spaces free'
                  : 'shelf spaces free'}
              </span>
            </div>
            <div className="storage-purchase">
              <button
                className="button secondary"
                disabled={full || state.cash < cost}
                onClick={() => dispatch({ type: 'expandBottleStorage', kind })}
              >
                <Plus size={15} />
                {full
                  ? 'Maximum capacity'
                  : `Add ${terms.step} ${kind === 'warehouse' ? 'storage' : 'shelf'} spaces · ${money(cost)}`}
              </button>
              <small>
                {!full && state.cash < cost
                  ? `Need ${money(cost - state.cash)} more.`
                  : 'Permanent space · no weekly upkeep'}
              </small>
            </div>
          </div>
        );
      })}
    </section>
  );
}
