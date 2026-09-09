import { useId, useState } from 'react';
import type { GameState, Wine } from './game';
import type { Dispatch } from './Panels';
import {
  saleStock,
  shelfRoom,
  shelfStock,
  suggestedShelfSpace,
} from './bottleStorage';

export function ShelfAllocation({
  wine,
  state,
  dispatch,
  compact = false,
}: {
  wine: Wine;
  state: GameState;
  dispatch: Dispatch;
  compact?: boolean;
}) {
  const shelfId = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const current = shelfStock(wine);
  const max = Math.min(saleStock(wine), shelfRoom(state) + current);
  const value =
    draft ?? String(wine.listed ? current : suggestedShelfSpace(state, wine));
  const count = Number(value);
  const valid = Number.isInteger(count) && count > 0 && count <= max;
  const release = `${wine.label} release ${wine.release}`;
  const changeCount = (next: string) => {
    setDraft(next);
    const bottles = Number(next);
    if (
      wine.listed &&
      Number.isInteger(bottles) &&
      bottles > 0 &&
      bottles <= max &&
      (bottles === current ||
        dispatch({ type: 'shelfSpace', id: wine.id, bottles }))
    )
      setDraft(null);
  };
  const adjust = (delta: number) =>
    changeCount(
      String(
        Math.max(1, Math.min(max, (valid ? count : current || 1) + delta)),
      ),
    );
  const pauseButton = wine.listed && (
    <button
      type="button"
      className="text-button"
      onClick={(e) => {
        // Pausing replaces this control with a submit button in the shop.
        e.preventDefault();
        if (dispatch({ type: 'list', id: wine.id })) setDraft(null);
      }}
    >
      {compact
        ? 'Pause listing'
        : `Pause listing · free ${current.toLocaleString()} spaces`}
    </button>
  );
  return (
    <form
      className={`shelf-allocation${compact ? ' quick-shelf' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        if (
          !wine.listed &&
          valid &&
          dispatch({
            type: 'list',
            id: wine.id,
            bottles: count,
          })
        )
          setDraft(null);
      }}
    >
      <div className="shelf-heading">
        <label htmlFor={shelfId}>
          {compact ? 'Shelf spaces' : 'Shelf spaces for this release'}
        </label>
        {compact && max > 0 && (
          <span id={`${shelfId}-help`}>Up to {max.toLocaleString()}</span>
        )}
      </div>
      <div className={compact ? 'quantity-stepper' : 'shelf-controls'}>
        {compact && (
          <button
            type="button"
            aria-label={`Reduce shelf spaces by 10 for ${release}`}
            disabled={max === 0 || count <= 1}
            onClick={() => adjust(-10)}
          >
            −10
          </button>
        )}
        <input
          id={shelfId}
          type="number"
          min={1}
          max={Math.max(1, max)}
          step={1}
          aria-label={`Shelf spaces for ${wine.label} release ${wine.release}`}
          aria-describedby={`${shelfId}-help`}
          value={value}
          disabled={max === 0}
          onChange={(e) => changeCount(e.target.value)}
          onBlur={() => {
            if (wine.listed) setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && wine.listed) {
              e.preventDefault();
              if (e.currentTarget.reportValidity()) e.currentTarget.blur();
            }
          }}
          required
        />
        {compact && (
          <button
            type="button"
            aria-label={`Increase shelf spaces by 10 for ${release}`}
            disabled={max === 0 || count >= max}
            onClick={() => adjust(10)}
          >
            +10
          </button>
        )}
        {!compact && !wine.listed && (
          <button className="button primary" disabled={!valid}>
            List in the wine shop
          </button>
        )}
      </div>
      {compact && (
        <div className="quick-shelf-actions">
          <button
            type="button"
            className="text-button"
            aria-label={`Use maximum shelf spaces for ${release}`}
            disabled={max === 0 || count === max}
            onClick={() => changeCount(String(max))}
          >
            Max
          </button>
          {wine.listed ? (
            pauseButton
          ) : (
            <button className="button primary" disabled={!valid}>
              List wine
            </button>
          )}
        </div>
      )}
      {(!compact || max === 0) && (
        <p id={`${shelfId}-help`}>
          {max === 0
            ? 'No shelf space available. Pause another listing or add shelves above.'
            : `${max.toLocaleString()} spaces available for this release. Retail sales cannot exceed its shelf stock in one week.`}
        </p>
      )}
      {!compact && pauseButton}
    </form>
  );
}
