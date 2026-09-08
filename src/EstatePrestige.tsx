import { ChevronRight } from 'lucide-react';
import { Icon, Modal } from './components';
import {
  formatPrestige,
  QUALITY_RESPONSES,
  signedPrestige,
  PRESTIGE_TIERS,
  prestigeStanding,
} from './prestige';

export function PrestigeResource({
  value,
  onOpen,
}: {
  value: number;
  onOpen: (trigger: HTMLButtonElement) => void;
}) {
  const { tier } = prestigeStanding(value);
  return (
    <button
      className="resource prestige-resource"
      onClick={(event) => onOpen(event.currentTarget)}
      aria-label={`Prestige: ${formatPrestige(value)}, ${tier.name}. View prestige tiers`}
      aria-haspopup="dialog"
    >
      <span className="resource-icon">
        <Icon name="trophy" size={20} />
      </span>
      <span className="prestige-info">
        <small>PRESTIGE</small>
        <strong>{formatPrestige(value, true)}</strong>
        <span className="prestige-label">
          {tier.name} <ChevronRight size={10} />
        </span>
      </span>
    </button>
  );
}

export function PrestigeDetails({
  value,
  onClose,
}: {
  value: number;
  onClose: () => void;
}) {
  const { index, tier, next } = prestigeStanding(value);
  return (
    <Modal title="A name worth knowing." onClose={onClose}>
      <div className="prestige-current">
        <span className="eyebrow">
          YOUR ESTATE’S PRESTIGE · TIER {index + 1}
        </span>
        <strong>{formatPrestige(value)}</strong>
        <h3>{tier.name}</h3>
        <p>{tier.note}</p>
        <p className="prestige-next">
          {next
            ? `${formatPrestige(Math.max(0, next.minimum - value))} to ${next.name}`
            : 'The highest tier. Your Prestige keeps growing without a ceiling.'}
        </p>
      </div>
      <p className="modal-intro">
        Wine quality determines the Prestige earned per bottle. Outstanding
        releases build your name faster; shop sales below 60 points reduce
        confidence. Prestige never falls below zero.
      </p>
      <table className="quality-prestige-table">
        <caption>Prestige per bottle sold</caption>
        <thead>
          <tr>
            <th scope="col">Quality</th>
            <th scope="col">Shop</th>
            <th scope="col">Wholesale</th>
          </tr>
        </thead>
        <tbody>
          {QUALITY_RESPONSES.map((band) => (
            <tr key={band.minimum}>
              <th scope="row">{band.range}</th>
              <td>{signedPrestige(band.retail)}</td>
              <td>{signedPrestige(band.wholesale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="prestige-explainer">
        Prestige improves suggested prices, shopper interest, and visitor
        attendance, with smaller gains as your fame grows. Wine quality is still
        rated out of 100. These titles celebrate your standing; they don’t award
        cash or unlock purchases.
      </p>
      <ol className="prestige-ladder" aria-label="Prestige tiers">
        {PRESTIGE_TIERS.map((level, i) => (
          <li
            key={level.minimum}
            aria-current={i === index ? 'step' : undefined}
          >
            <span className="prestige-rank">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h4>{level.name}</h4>
              <p>{level.note}</p>
            </div>
            <div className="prestige-threshold">
              <strong>{formatPrestige(level.minimum)}+</strong>
              {i === index && <span>Current tier</span>}
            </div>
          </li>
        ))}
      </ol>
      <p className="prestige-footnote">Sixteen names. No maximum score.</p>
    </Modal>
  );
}
