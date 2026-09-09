import { useState } from 'react';
import { getVariety, quality } from './game';
import type { Batch, GameState } from './game';
import { vinificationStage } from './cellarTechniques';
import { HouseCrest } from './HouseCrest';

export type TankGroup = { batch?: Batch; ids: number[] };
export const tankGroupKey = (group: TankGroup) =>
  group.batch ? `batch-${group.batch.id}` : `tank-${group.ids[0]}`;
export function groupStage(batch?: Batch) {
  return !batch
    ? 'Available'
    : batch.stage === 'fermenting'
      ? vinificationStage(batch)
      : batch.stage === 'aging'
        ? 'Maturing'
        : 'Ready for reserves';
}

export function CellarVessel({
  wooden,
  filled,
  capacity,
  color,
  number,
}: {
  wooden: boolean;
  filled: number;
  capacity: number;
  color: string;
  number: number;
}) {
  return (
    <svg viewBox="0 0 150 176" aria-hidden="true" className="cellar-vessel-art">
      <ellipse cx="78" cy="159" rx="49" ry="10" fill="#44463015" />
      {wooden ? (
        <>
          <path
            d="M34 27Q14 84 34 143Q75 164 116 143Q136 84 116 27Z"
            fill="#bb946b"
          />
          <path
            d="M99 31Q118 83 101 149L116 143Q136 84 116 27Z"
            fill="#9a7553"
          />
          <path
            d="M47 32Q31 88 48 148M65 34Q58 90 64 153M84 34Q93 86 85 153M101 32Q120 87 102 147"
            fill="none"
            stroke="#9a7553"
            strokeWidth="1.2"
          />
          <ellipse cx="75" cy="27" rx="41" ry="13" fill="#d4b188" />
          <ellipse
            cx="75"
            cy="27"
            rx="34"
            ry="9"
            fill="none"
            stroke="#9a7553"
          />
          <path
            d="M28 48Q75 65 122 48M28 125Q75 146 122 125"
            fill="none"
            stroke="#646653"
            strokeWidth="7"
          />
        </>
      ) : (
        <>
          <path d="M41 141v16M108 141v16" stroke="#6a7767" strokeWidth="6" />
          <path d="M28 35V134Q75 159 122 134V35Z" fill="#b9c3b5" />
          <path d="M90 45V146Q110 143 122 134V35Z" fill="#94a594" />
          <ellipse cx="75" cy="35" rx="47" ry="18" fill="#dce1d3" />
          <ellipse cx="75" cy="35" rx="35" ry="11" fill="#aab8a5" />
          <path d="M66 18V8H85V18" fill="#899b86" />
          <path
            d="M28 63Q75 85 122 63M28 122Q75 143 122 122"
            fill="none"
            stroke="#879b87"
            strokeWidth="3"
          />
          <path
            d="M109 134h19v8"
            fill="none"
            stroke="#596e5a"
            strokeWidth="4"
          />
        </>
      )}
      <rect x="42" y="87" width="36" height="31" rx="2" fill="#f7f1de" />
      <text x="60" y="100" textAnchor="middle" fontSize="6" fill="#58614f">
        CELLAR
      </text>
      <text
        x="60"
        y="112"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Georgia"
        fill="#44513e"
      >
        {String(number).padStart(2, '0')}
      </text>
      <rect x="91" y="80" width="7" height="48" rx="3" fill="#f7f1de" />
      <rect
        className="vessel-level"
        x="92"
        y={127 - (46 * filled) / capacity}
        width="5"
        height={(46 * filled) / capacity}
        rx="2"
        fill={color}
      />
    </svg>
  );
}

export function CellarFloor({
  state,
  groups,
  onSelect,
}: {
  state: GameState;
  groups: TankGroup[];
  onSelect: (key: string) => void;
}) {
  const [view, setView] = useState<'floor' | 'ledger'>('floor');
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(groups.length / 8) - 1);
  const currentPage = Math.min(page, lastPage);
  const floorGroups = groups.slice(currentPage * 8, currentPage * 8 + 8);
  return (
    <section className="cellar-floor" aria-label="Cellar vessels">
      <div className="floor-tools">
        <p>
          Select a vessel to inspect its wine or plan the next step. Quality
          estimates reflect time matured so far.
        </p>
        <div className="view-switch" role="group" aria-label="Cellar display">
          <button
            aria-pressed={view === 'floor'}
            onClick={() => setView('floor')}
          >
            Cellar floor
          </button>
          <button
            aria-pressed={view === 'ledger'}
            onClick={() => setView('ledger')}
          >
            Tank ledger
          </button>
        </div>
      </div>
      {view === 'floor' ? (
        <div className="cellar-room">
          <div className="cellar-wall" aria-hidden="true">
            <span />
            <div>
              <HouseCrest
                identity={state.houseIdentity ?? undefined}
                name={state.name}
              />
              <b>{state.name}</b>
              <small>THE CELLAR</small>
            </div>
            <span />
          </div>
          <div className="floor-vessels">
            {floorGroups.map((group) => {
              const batch = group.batch;
              const score = batch ? quality(batch) : null;
              const vessel =
                batch?.maturationPlan?.vessel ?? (batch?.oak ? 'oak' : 'steel');
              return (
                <button
                  className="floor-vessel"
                  key={tankGroupKey(group)}
                  onClick={() => onSelect(tankGroupKey(group))}
                  aria-label={`Inspect ${batch ? getVariety(state, batch.variety).name : 'empty tank'}, tanks ${group.ids.join(', ')}, ${groupStage(batch)}${score === null ? '' : `, estimated quality ${score} out of 100`}`}
                >
                  <span className="vessel-drawing">
                    {group.ids.slice(0, 3).map((id, index) => {
                      const tank = state.cellar.tanks.find(
                        (tank) => tank.id === id,
                      )!;
                      const earlier = group.ids
                        .slice(0, index)
                        .reduce(
                          (total, id) =>
                            total +
                            state.cellar.tanks.find((tank) => tank.id === id)!
                              .capacity,
                          0,
                        );
                      return (
                        <CellarVessel
                          key={id}
                          wooden={vessel !== 'steel'}
                          number={id}
                          filled={Math.max(
                            0,
                            Math.min(
                              tank.capacity,
                              (batch?.liters ?? 0) - earlier,
                            ),
                          )}
                          capacity={tank.capacity}
                          color={
                            batch
                              ? getVariety(state, batch.variety).color
                              : '#784759'
                          }
                        />
                      );
                    })}
                  </span>
                  <span className="vessel-caption">
                    <b>
                      {batch
                        ? getVariety(state, batch.variety).name
                        : `Tank ${group.ids[0]}`}
                    </b>
                    <span>
                      {groupStage(batch)} ·{' '}
                      {batch
                        ? `${batch.liters} L`
                        : `${state.cellar.tanks.find((tank) => tank.id === group.ids[0])!.capacity} L free`}
                    </span>
                    {score !== null && (
                      <span className="vessel-quality">
                        <span>Est. quality</span>
                        <strong>
                          {score}
                          <small> / 100</small>
                        </strong>
                      </span>
                    )}
                    <small>
                      {group.ids.length > 1
                        ? `${group.ids.length} reserved tanks · ${group.ids.join(' + ')}`
                        : `Tank ${group.ids[0]}`}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="cellar-cases" aria-hidden="true">
            <HouseCrest
              identity={state.houseIdentity ?? undefined}
              name={state.name}
            />
            <span>ESTATE BOTTLED</span>
          </div>
        </div>
      ) : (
        <div
          className="cellar-ledger"
          role="region"
          aria-label="Tank ledger"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Tank / group</th>
                <th>Wine</th>
                <th>Volume</th>
                <th>Stage</th>
                <th>Est. quality</th>
                <th>
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={tankGroupKey(group)}>
                  <th scope="row">{group.ids.join(' + ')}</th>
                  <td>
                    {group.batch
                      ? getVariety(state, group.batch.variety).name
                      : 'Empty'}
                  </td>
                  <td>
                    {group.batch?.liters ?? 0} /{' '}
                    {group.ids.reduce(
                      (total, id) =>
                        total +
                        state.cellar.tanks.find((tank) => tank.id === id)!
                          .capacity,
                      0,
                    )}{' '}
                    L
                  </td>
                  <td>{groupStage(group.batch)}</td>
                  <td className="cellar-ledger-quality">
                    {group.batch ? `${quality(group.batch)} / 100` : '—'}
                  </td>
                  <td>
                    <button
                      className="text-button"
                      aria-label={`Inspect tanks ${group.ids.join(', ')}`}
                      onClick={() => onSelect(tankGroupKey(group))}
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {view === 'floor' && lastPage > 0 && (
        <div className="floor-paging">
          <button
            className="button secondary"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous vessels
          </button>
          <span>
            {currentPage + 1} / {lastPage + 1}
          </span>
          <button
            className="button secondary"
            disabled={currentPage === lastPage}
            onClick={() => setPage(currentPage + 1)}
          >
            Next vessels
          </button>
        </div>
      )}
    </section>
  );
}
