import { useState } from 'react';
import type { GameState, Wine } from './game';
import type { Dispatch } from './Panels';
import { shelfRoom, shelfStock, suggestedShelfSpace } from './bottleStorage';

export function ShelfAllocation({
  wine,
  state,
  dispatch,
}: {
  wine: Wine;
  state: GameState;
  dispatch: Dispatch;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const current = shelfStock(wine);
  const max = Math.min(wine.bottles, shelfRoom(state) + current);
  const value =
    draft ?? String(wine.listed ? current : suggestedShelfSpace(state, wine));
  const count = Number(value);
  const valid = Number.isInteger(count) && count > 0 && count <= max;
  return (
    <form
      className="shelf-allocation"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          valid &&
          dispatch({
            type: wine.listed ? 'shelfSpace' : 'list',
            id: wine.id,
            bottles: count,
          })
        )
          setDraft(null);
      }}
    >
      <label htmlFor={`shelf-${wine.id}`}>Shelf spaces for this release</label>
      <div className="shelf-controls">
        <input
          id={`shelf-${wine.id}`}
          type="number"
          min={1}
          max={Math.max(1, max)}
          step={1}
          aria-label={`Shelf spaces for ${wine.label} release ${wine.release}`}
          aria-describedby={`shelf-help-${wine.id}`}
          value={value}
          disabled={max === 0}
          onChange={(e) => setDraft(e.target.value)}
          required
        />
        <button
          className={`button ${wine.listed ? 'secondary' : 'primary'}`}
          disabled={!valid || (wine.listed && count === current)}
        >
          {wine.listed ? 'Update shelf space' : 'List in the wine shop'}
        </button>
      </div>
      <p id={`shelf-help-${wine.id}`}>
        {max === 0
          ? 'No shelf space available. Pause another listing or add shelves above.'
          : `${max.toLocaleString()} spaces available for this release. Retail sales cannot exceed its shelf stock in one week.`}
      </p>
      {wine.listed && (
        <button
          type="button"
          className="text-button"
          onClick={() => {
            if (dispatch({ type: 'list', id: wine.id })) setDraft(null);
          }}
        >
          Pause listing · free {current.toLocaleString()} spaces
        </button>
      )}
    </form>
  );
}
