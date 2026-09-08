import { useState } from 'react';
import type { Batch } from './game';
import { money } from './game';
import type { Dispatch } from './Panels';
import {
  MATURATION_LIMIT,
  VESSELS,
  VESSEL_IDS,
  maturationCost,
  maturationOutlook,
} from './maturation';
import type { MaturationVessel } from './maturation';

export function BatchMaturation({
  batch,
  name,
  cash,
  dispatch,
}: {
  batch: Batch;
  name: string;
  cash: number;
  dispatch: Dispatch;
}) {
  const profile = batch.maturationProfile!;
  const [vessel, setVessel] = useState<MaturationVessel>(profile.preferred);
  const [duration, setDuration] = useState(
    String(profile.routes[profile.preferred].readyFrom),
  );
  const [autoTransfer, setAutoTransfer] = useState(true);
  const selectedVessel = batch.maturationPlan?.vessel ?? vessel;
  const route = profile.routes[selectedVessel];
  const outlook = maturationOutlook(
    profile,
    selectedVessel,
    batch.age,
    batch.oak,
  );
  const weeks = Number(duration);
  const validDuration =
    Number.isInteger(weeks) && weeks >= 1 && weeks <= MATURATION_LIMIT;
  const forecast = maturationOutlook(
    profile,
    selectedVessel,
    validDuration ? weeks : 0,
    batch.oak,
  );
  const cost = maturationCost(selectedVessel, batch.tankIds.length);
  const title = `maturation-${batch.id}`;
  return (
    <section className="batch-maturation" aria-label={`${name} maturation`}>
      <h4 id={title}>
        {batch.stage === 'ready'
          ? 'Choose how it matures.'
          : 'Maturation in progress'}
      </h4>
      {batch.stage === 'ready' ? (
        <>
          <p>{profile.advice}</p>
          <label className="maturation-field">
            <span>Maturation vessel</span>
            <select
              value={vessel}
              onChange={(event) => {
                const selected = event.target.value as MaturationVessel;
                setVessel(selected);
                setDuration(String(profile.routes[selected].readyFrom));
              }}
            >
              {VESSEL_IDS.map((id) => (
                <option key={id} value={id}>
                  {VESSELS[id].name} ·{' '}
                  {money(maturationCost(id, batch.tankIds.length))}
                </option>
              ))}
            </select>
          </label>
          <p className="maturation-vessel-note">
            {VESSELS[vessel].description}
          </p>
          <div className="maturation-window">
            <span>Suggested release</span>
            <strong>
              {route.readyFrom}–{route.readyUntil} game weeks
            </strong>
          </div>
          <div className="maturation-order">
            <label className="maturation-field">
              <span>Game weeks</span>
              <input
                type="number"
                min={1}
                max={MATURATION_LIMIT}
                step={1}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
              />
            </label>
            <label className="maturation-auto">
              <input
                type="checkbox"
                checked={autoTransfer}
                onChange={(event) => setAutoTransfer(event.target.checked)}
              />
              <span>Move to reserves automatically</span>
            </label>
          </div>
          <p
            className={
              forecast.overOaked ? 'maturation-warning' : 'maturation-forecast'
            }
            aria-live="polite"
          >
            {validDuration
              ? `${forecast.readiness} at week ${weeks} · ${forecast.oak}.`
              : 'Choose 1–12 whole game weeks.'}
          </p>
          <button
            className="button secondary wide"
            disabled={!validDuration || cash < cost}
            onClick={() =>
              dispatch({
                type: 'age',
                id: batch.id,
                vessel,
                targetWeeks: weeks,
                autoTransfer,
              })
            }
          >
            Start maturation
            {cost > 0 ? ` · ${money(cost)}` : ' · No extra charge'}
          </button>
          {cash < cost && (
            <p className="maturation-warning">
              Need {money(cost - cash)} more.
            </p>
          )}
          <p className="maturation-footnote">
            {batch.tankIds.length} cellar slot
            {batch.tankIds.length === 1 ? '' : 's'} occupied until transfer.
            Barrel service is included in the displayed charge; your tanks stay
            owned.
          </p>
        </>
      ) : (
        <>
          <div className="maturation-window">
            <span>{VESSELS[selectedVessel].name}</span>
            <strong>{batch.age} game weeks</strong>
          </div>
          <p>
            <strong>{outlook.readiness}</strong> · Suggested release{' '}
            {route.readyFrom}–{route.readyUntil} weeks.
          </p>
          <p className={outlook.overOaked ? 'maturation-warning' : ''}>
            {outlook.oak}.
          </p>
          <p>
            {batch.maturationPlan?.autoTransfer
              ? `Automatic transfer at week ${batch.maturationPlan.targetWeeks}, if a reserve space is free.`
              : 'Transfer to reserves when ready. Maturation stops after transfer.'}
          </p>
          {batch.age >= MATURATION_LIMIT && (
            <p>
              Maximum simulated maturation reached. Further waiting adds no
              benefit.
            </p>
          )}
        </>
      )}
    </section>
  );
}
