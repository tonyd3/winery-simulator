import type { ResearchId } from './catalog';
import { RESEARCH } from './catalog';
import { useState } from 'react';
import {
  ArrowRight,
  FlaskConical,
  Sprout,
  Users,
  Wine,
  Pause,
  Play,
  Plus,
} from 'lucide-react';
import { money, upkeep } from './game';
import type { GameState } from './game';
import type { Dispatch } from './Panels';
import { CellarEquipment } from './CellarEquipment';
import {
  INVESTMENT_DEPARTMENTS,
  UPGRADES,
  UPGRADE_IDS,
  hospitalityForecast,
  investmentBill,
  investmentUpkeep,
  upgradeActive,
  upgradeBlocked,
} from './investments';
import type { InvestmentDepartment, Upgrade } from './investments';
import './investments.css';

const departmentIcons = {
  vineyard: Sprout,
  hospitality: Users,
  sales: Wine,
  research: FlaskConical,
};
const signedMoney = (amount: number) =>
  `${amount < 0 ? '−' : '+'}${money(Math.abs(amount))}`;

export function Investments({
  state,
  dispatch,
  onLand,
  onResearch,
}: {
  state: GameState;
  dispatch: Dispatch;
  onLand: () => void;
  onResearch: (id?: ResearchId) => void;
}) {
  const [department, setDepartment] = useState<
    InvestmentDepartment | 'all' | 'equipment'
  >('all');
  const visitors = hospitalityForecast(state);
  const running = state.upgrades.filter(
    (id) => !UPGRADES[id].legacy && upgradeActive(state, id),
  ).length;
  const owned = state.upgrades.filter((id) => !UPGRADES[id].legacy).length;
  return (
    <div className="operations-page investments-page">
      <div className="section-intro">
        <div>
          <span className="eyebrow">THE BUSINESS OF WINE</span>
          <h2>Investments & running costs.</h2>
          <p>
            Build for the estate you can sustain. Every facility and team
            carries a weekly bill.
          </p>
        </div>
        <span className="investment-count">
          {running} operating · {owned - running} suspended
        </span>
      </div>
      <section className="investment-budget" aria-label="Operating budget">
        <dl>
          <div>
            <dt>Estate upkeep / week</dt>
            <dd>{money(upkeep(state))}</dd>
            <small>{money(investmentUpkeep(state))} from investments</small>
          </div>
          <div>
            <dt>Hospitality income / week</dt>
            <dd>{money(visitors.revenue)}</dd>
            <small>
              {visitors.visitors} / {visitors.capacity} visitor places ·{' '}
              {visitors.rooms} rooms booked
            </small>
          </div>
          <div>
            <dt>Hospitality after costs</dt>
            <dd className={visitors.net < 0 ? 'investment-loss' : ''}>
              {signedMoney(visitors.net)}
            </dd>
            <small>{visitors.season} estimate · excludes wine sales</small>
          </div>
        </dl>
        <p>
          Attendance follows Prestige and the season. Suspending stops benefits
          but retains 25% maintenance; dependent investments suspend too. Resume
          when you can cover one week of total estate upkeep.
        </p>
      </section>
      <nav className="investment-filters" aria-label="Investment departments">
        <button
          className={department === 'all' ? 'active' : ''}
          aria-pressed={department === 'all'}
          onClick={() => setDepartment('all')}
        >
          All investments{' '}
          <span>{UPGRADE_IDS.filter((id) => !UPGRADES[id].legacy).length}</span>
        </button>
        {Object.entries(INVESTMENT_DEPARTMENTS).map(([id, label]) => (
          <button
            key={id}
            className={department === id ? 'active' : ''}
            aria-pressed={department === id}
            onClick={() => setDepartment(id as InvestmentDepartment)}
          >
            {label}
          </button>
        ))}
        <button
          className={department === 'equipment' ? 'active' : ''}
          aria-pressed={department === 'equipment'}
          onClick={() => setDepartment('equipment')}
        >
          Cellar space & tanks
        </button>
      </nav>
      {department === 'equipment' ? (
        <CellarEquipment state={state} dispatch={dispatch} />
      ) : (
        Object.entries(INVESTMENT_DEPARTMENTS)
          .filter(([id]) => department === 'all' || department === id)
          .map(([category, label]) => (
            <section
              className="investment-department"
              key={category}
              aria-label={label}
            >
              <h3>{label}</h3>
              {UPGRADE_IDS.filter(
                (id) =>
                  !UPGRADES[id].legacy && UPGRADES[id].category === category,
              ).map((id) => (
                <InvestmentRow
                  key={id}
                  id={id}
                  state={state}
                  dispatch={dispatch}
                  onResearch={onResearch}
                />
              ))}
            </section>
          ))
      )}
      <p className="investment-policy">
        Purchases are permanent. Full running costs apply while operating, even
        during quiet weeks. If funds cannot cover the weekly bill, investments
        suspend automatically; reduced maintenance still applies afterward.
      </p>
      <div className="cellar-note">
        <Sprout size={17} />
        <button className="text-button" onClick={onLand}>
          Expand vineyards or acquire another regional estate{' '}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function InvestmentRow({
  id,
  state,
  dispatch,
  onResearch,
}: {
  id: Upgrade;
  state: GameState;
  dispatch: Dispatch;
  onResearch: (id?: ResearchId) => void;
}) {
  const u = UPGRADES[id];
  const owned = state.upgrades.includes(id);
  const active = upgradeActive(state, id);
  const Icon = departmentIcons[u.category];
  const blocked = upgradeBlocked(state, id);
  const resumed: GameState = {
    ...state,
    suspendedUpgrades: (state.suspendedUpgrades ?? []).filter((x) => x !== id),
  };
  const resumeBlocked =
    u.requires && !upgradeActive(state, u.requires)
      ? `Resume ${UPGRADES[u.requires].name} first`
      : state.cash < upkeep(resumed)
        ? `Keep ${money(upkeep(resumed))} for one week of estate upkeep`
        : null;
  const projected: GameState = { ...state, upgrades: [...state.upgrades, id] };
  const extraRevenue =
    !owned &&
    !u.legacy &&
    (!u.requires || upgradeActive(state, u.requires)) &&
    u.category === 'hospitality'
      ? hospitalityForecast(projected).revenue -
        hospitalityForecast(state).revenue
      : null;
  return (
    <article
      className={`investment-row ${owned ? 'owned' : ''}`}
      aria-label={u.name}
    >
      <div className="investment-symbol">
        <Icon size={25} strokeWidth={1.5} />
      </div>
      <div className="investment-description">
        <div className="investment-title">
          <h4>{u.name}</h4>
          {owned && (
            <span className={`investment-status ${active ? 'operating' : ''}`}>
              {active ? 'Operating' : 'Suspended'}
            </span>
          )}
        </div>
        <p>{u.text}</p>
        <div className="investment-terms">
          <span>{money(u.upkeep)} / week operating</span>
          <span>{money(Math.ceil(u.upkeep * 0.25))} / week suspended</span>
        </div>
        {u.research && !owned && (
          <p>
            <button
              className="text-button"
              onClick={() => onResearch(u.research)}
            >
              Research: {RESEARCH[u.research].name}{' '}
              {state.research.includes(u.research) ? '✓' : '→'}
            </button>
            <br />
            <small>Study cost is separate from this purchase.</small>
          </p>
        )}
        {u.requires && (
          <small>Requires {UPGRADES[u.requires].name} operating</small>
        )}
        {extraRevenue !== null && (
          <p
            className={`investment-return ${extraRevenue - u.upkeep < 0 ? 'investment-loss' : ''}`}
          >
            At current traffic: {signedMoney(extraRevenue)} income −{' '}
            {money(u.upkeep)} running costs ={' '}
            {signedMoney(extraRevenue - u.upkeep)} / week, before wine sales.
          </p>
        )}
      </div>
      <div className="investment-purchase">
        {owned ? (
          <>
            <strong>
              {money(investmentBill(state, id))}
              <small> / week now</small>
            </strong>
            <button
              className="button secondary"
              disabled={!active && Boolean(resumeBlocked)}
              aria-label={`${active ? 'Suspend' : 'Resume'} ${u.name}`}
              onClick={() =>
                dispatch({
                  type: 'operateUpgrade',
                  upgrade: id,
                  active: !active,
                })
              }
            >
              {active ? <Pause size={14} /> : <Play size={14} />}
              {active ? 'Suspend' : 'Resume'}
            </button>
            {!active && resumeBlocked && <small>{resumeBlocked}</small>}
          </>
        ) : (
          <>
            <strong>{money(u.cost)}</strong>
            <small>
              {money(u.cost + u.upkeep * 8)} incl. 8 weeks operating
            </small>
            <button
              className="button primary"
              disabled={Boolean(blocked)}
              aria-label={`${u.kind === 'team' ? 'Hire' : 'Build'} ${u.name} for ${money(u.cost)}`}
              onClick={() => dispatch({ type: 'upgrade', upgrade: id })}
            >
              {u.kind === 'team' ? 'Hire team' : 'Build'}
              <Plus size={14} />
            </button>
            {blocked && <small>{blocked}</small>}
          </>
        )}
      </div>
    </article>
  );
}
