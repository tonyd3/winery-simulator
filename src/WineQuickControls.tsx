import { useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { BOTTLE_PRICE, money, retailPrice } from './game';
import type { GameState, Wine } from './game';
import type { Dispatch } from './Panels';
import { ShelfAllocation } from './ShelfAllocation';

export function WineQuickControls({
  wine,
  state,
  dispatch,
}: {
  wine: Wine;
  state: GameState;
  dispatch: Dispatch;
}) {
  const priceId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const release = `${wine.label} release ${wine.release}`;
  const suggested = retailPrice(wine, state);
  const setPrice = (price: number) => {
    if (dispatch({ type: 'price', id: wine.id, price })) setDraft(null);
  };

  return (
    <div
      className="wine-quick-controls"
      role="group"
      aria-label={`Selling controls for ${release}`}
    >
      <div className="quick-price">
        <label htmlFor={priceId}>Price / bottle ($)</label>
        <div className="quantity-stepper">
          <button
            type="button"
            aria-label={`Reduce price by $1 for ${release}`}
            disabled={wine.price <= BOTTLE_PRICE.min}
            onClick={() => setPrice(wine.price - 1)}
          >
            <Minus size={15} />
          </button>
          <input
            id={priceId}
            type="number"
            min={BOTTLE_PRICE.min}
            max={BOTTLE_PRICE.max}
            step={1}
            required
            aria-label={`Price per bottle for ${release}`}
            value={draft ?? String(wine.price)}
            onChange={(e) => {
              setDraft(e.target.value);
              if (e.target.validity.valid)
                dispatch({
                  type: 'price',
                  id: wine.id,
                  price: e.target.valueAsNumber,
                });
            }}
            onBlur={() => setDraft(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (e.currentTarget.reportValidity()) e.currentTarget.blur();
              }
              if (e.key === 'Escape') {
                setDraft(null);
                e.currentTarget.blur();
              }
            }}
          />
          <button
            type="button"
            aria-label={`Increase price by $1 for ${release}`}
            disabled={wine.price >= BOTTLE_PRICE.max}
            onClick={() => setPrice(wine.price + 1)}
          >
            <Plus size={15} />
          </button>
        </div>
        <button
          type="button"
          className="text-button quick-suggestion"
          aria-label={`Use suggested price for ${release}`}
          onClick={() => setPrice(suggested)}
        >
          Use {money(suggested)} suggested
        </button>
      </div>
      <ShelfAllocation wine={wine} state={state} dispatch={dispatch} compact />
    </div>
  );
}
