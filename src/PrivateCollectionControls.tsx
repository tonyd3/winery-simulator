import { useId, useState } from 'react';
import { Bookmark } from 'lucide-react';
import type { Wine } from './game';
import type { Dispatch } from './Panels';
import { privateStock, saleStock } from './bottleStorage';

function BottleTransfer({
  wine,
  dispatch,
  returning = false,
}: {
  wine: Wine;
  dispatch: Dispatch;
  returning?: boolean;
}) {
  const id = useId();
  const [draft, setDraft] = useState('1');
  const max = returning ? privateStock(wine) : saleStock(wine);
  const count = Number(draft);
  const valid = Number.isInteger(count) && count > 0 && count <= max;
  const label = returning ? 'Return to stock' : 'Set aside';
  return (
    <form
      className="collection-transfer"
      onSubmit={(e) => {
        e.preventDefault();
        if (
          valid &&
          dispatch({
            type: returning ? 'returnWine' : 'collectWine',
            id: wine.id,
            bottles: count,
          })
        )
          setDraft('1');
      }}
    >
      <label htmlFor={id}>
        {label}
        <small>{max.toLocaleString()} available</small>
      </label>
      <input
        id={id}
        type="number"
        min={1}
        max={max}
        step={1}
        required
        aria-label={`${label} bottles of ${wine.label} release ${wine.release}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button className="button secondary" disabled={!valid}>
        {returning ? 'Return bottles' : 'Keep bottles'}
      </button>
    </form>
  );
}

export function PrivateCollectionControls({
  wine,
  dispatch,
}: {
  wine: Wine;
  dispatch: Dispatch;
}) {
  const kept = privateStock(wine);
  return (
    <section
      className="private-collection-controls"
      aria-label="Private Collection"
    >
      <h4>
        <Bookmark size={16} /> Private Collection{' '}
        <span role="status" aria-live="polite">
          {kept.toLocaleString()} kept
        </span>
      </h4>
      <p>
        Keep a few bottles for yourself. Protected from shop and wholesale
        sales; still part of your warehouse.
      </p>
      {saleStock(wine) > 0 && (
        <BottleTransfer wine={wine} dispatch={dispatch} />
      )}
      {kept > 0 && <BottleTransfer wine={wine} dispatch={dispatch} returning />}
    </section>
  );
}
