import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Icon } from './components';
import {
  CELLAR_EQUIPMENT,
  cellarExpansionCost,
  money,
  occupiedTankCount,
  tankCount,
} from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';

export function CellarEquipment({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: Dispatch;
}) {
  const [quantity, setQuantity] = useState(1);
  const freeBays = state.cellar.bays - tankCount(state);
  const count = Math.min(quantity, Math.max(1, freeBays));
  const cost = count * CELLAR_EQUIPMENT.tankCost;
  const expandCost = cellarExpansionCost(state);
  const full = state.cellar.bays >= CELLAR_EQUIPMENT.maxBays;
  const capacity = state.cellar.tanks.reduce((n, t) => n + t.capacity, 0);
  const legacy = state.cellar.tanks.filter((t) => t.capacity === 400).length;
  return (
    <section className="cellar-equipment" aria-label="Cellar space and tanks">
      <div className="section-line">
        <h3>Room for the next vintage.</h3>
        <span className="subtle">Shared by all your estates</span>
      </div>
      <dl className="equipment-summary">
        <div>
          <dt>Installed tanks</dt>
          <dd>
            {tankCount(state)} <small>/ {state.cellar.bays} bays</small>
          </dd>
        </div>
        <div>
          <dt>Empty tanks</dt>
          <dd>{tankCount(state) - occupiedTankCount(state)}</dd>
        </div>
        <div>
          <dt>Total capacity</dt>
          <dd>
            {capacity.toLocaleString()} <small>L</small>
          </dd>
        </div>
      </dl>
      <div className="equipment-row">
        <Icon name="barrel" size={30} />
        <div className="equipment-description">
          <h4>Buy 150 L tanks</h4>
          <p>
            {money(CELLAR_EQUIPMENT.tankCost)} each · {freeBays} empty bays
            available. A large harvest can fill several tanks.
          </p>
        </div>
        <div className="equipment-purchase">
          <label>
            Tanks
            <input
              aria-label="Number of tanks to buy"
              type="number"
              min={1}
              max={Math.max(1, freeBays)}
              step={1}
              value={count}
              disabled={freeBays === 0}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(freeBays, Math.floor(Number(e.target.value) || 1)),
                  ),
                )
              }
            />
          </label>
          <button
            className="button primary"
            disabled={freeBays === 0 || state.cash < cost}
            onClick={() => dispatch({ type: 'buyTank', count })}
          >
            <Plus size={16} />
            Buy {count === 1 ? 'tank' : `${count} tanks`} · {money(cost)}
          </button>
          {(freeBays === 0 || state.cash < cost) && (
            <small>
              {freeBays === 0
                ? 'Expand the cellar floor for more bays.'
                : `Need ${money(cost - state.cash)} more.`}
            </small>
          )}
        </div>
      </div>
      <div className="equipment-row">
        <Icon name="map" size={30} />
        <div className="equipment-description">
          <h4>Expand the cellar floor</h4>
          <p>
            Add four empty tank bays · +$15 weekly upkeep. Tanks are purchased
            separately.
          </p>
        </div>
        <div className="equipment-purchase">
          <button
            className="button secondary"
            disabled={full || state.cash < expandCost}
            onClick={() => dispatch({ type: 'expandCellar' })}
          >
            {full ? 'Maximum floor space' : `Add 4 bays · ${money(expandCost)}`}
            <Plus size={16} />
          </button>
          {!full && state.cash < expandCost && (
            <small>Need {money(expandCost - state.cash)} more.</small>
          )}
        </div>
      </div>
      <p className="equipment-note">
        Each harvest reserves whole tanks until its wine moves to reserves.
        Vineyard and estate purchases add land; equip the shared cellar
        separately.
        {legacy > 0 &&
          ` Your ${legacy} existing 400 L tank${legacy === 1 ? ' is' : 's are'} retained from your previous save.`}
      </p>
    </section>
  );
}
