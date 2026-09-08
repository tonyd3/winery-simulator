import { ArrowRight, FlaskConical, X } from 'lucide-react';
import { RESEARCH } from './catalog';
import type { ResearchId } from './catalog';
import {
  getVariety,
  getLand,
  getEstate,
  money,
  plotPlantingCost,
  suitability,
} from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import { discoveryDestination } from './researchPlanning';
import type { ResearchDestination } from './researchPlanning';
import { Modal } from './components';
import './research.css';

export function ResearchNotices({
  state,
  dispatch,
  onDestination,
}: {
  state: GameState;
  dispatch: Dispatch;
  onDestination: (destination: ResearchDestination) => void;
}) {
  const ids = [...state.unseenDiscoveries].reverse();
  if (!ids.length) return null;
  const notice = (id: string) => {
    const study = RESEARCH[id as ResearchId];
    const name = study?.name ?? getVariety(state, id).name;
    const destination = discoveryDestination(id);
    return (
      <div key={id} className="discovery-notice">
        <FlaskConical size={19} />
        <div>
          <strong>
            {name} {study ? 'learned' : 'ready to plant'}
          </strong>
          <p>{study?.text ?? 'Your estate grape passed its nursery trial.'}</p>
          <button
            className="text-button"
            onClick={() => onDestination(destination)}
          >
            {destination.label} <ArrowRight size={14} />
          </button>
        </div>
        <button
          className="icon-button"
          aria-label={`Dismiss ${name} discovery`}
          onClick={() => dispatch({ type: 'dismissDiscovery', id })}
        >
          <X size={16} />
        </button>
      </div>
    );
  };
  return (
    <section
      className="discovery-notices"
      aria-label="New discoveries"
      aria-live="polite"
    >
      {notice(ids[0])}
      {ids.length > 1 && (
        <details>
          <summary>
            {ids.length - 1} earlier{' '}
            {ids.length === 2 ? 'discovery' : 'discoveries'}
          </summary>
          {ids.slice(1).map(notice)}
        </details>
      )}
    </section>
  );
}

export function DiscoveryParcelChoice({
  state,
  grape,
  onChoose,
  onClose,
}: {
  state: GameState;
  grape: string;
  onChoose: (plotId: number) => void;
  onClose: () => void;
}) {
  const variety = getVariety(state, grape);
  const plots = state.plots
    .filter((p) => p.owned)
    .sort((a, b) => Number(Boolean(a.variety)) - Number(Boolean(b.variety)));
  return (
    <Modal title={`Choose a parcel for ${variety.name}`} onClose={onClose}>
      <p>
        Review a parcel before planting. Occupied parcels need their existing
        vines removed first; no vines are changed here.
      </p>
      <div className="discovery-parcels">
        {plots.map((p) => {
          const land = getLand(state, p.id),
            fit = suitability(state, grape, land.soil, land.region);
          return (
            <button
              key={p.id}
              className="discovery-parcel"
              onClick={() => onChoose(p.id)}
            >
              <strong>
                {land.name} · {getEstate(state, land.estateId).name}
              </strong>
              <span>
                {p.variety
                  ? `${getVariety(state, p.variety).name} planted`
                  : 'Empty parcel'}{' '}
                · {land.soil} · {fit.label} climate fit
                {fit.soilMatch ? ' · Soil match' : ''}
              </span>
              <span>
                {money(plotPlantingCost(state, p, grape))} to plant{' '}
                <ArrowRight size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
