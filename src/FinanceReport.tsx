import { useState } from 'react';
import { calendar } from './game';
import type { GameState } from './game';
import { releaseResult } from './finance';

const amount = (cents: number | null) =>
  cents === null
    ? 'Unrecorded'
    : (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      });

export function FinanceReport({ state }: { state: GameState }) {
  const [page, setPage] = useState(0);
  const finance = state.finance;
  const pages = Math.max(1, Math.ceil(state.wines.length / 20));
  const currentPage = Math.min(page, pages - 1);
  const wines = [...state.wines]
    .reverse()
    .slice(currentPage * 20, currentPage * 20 + 20);
  const archives = state.lines.filter((line) => line.archive);
  return (
    <>
      <section className="finance-report" aria-label="Seasonal finances">
        <div className="section-line">
          <h3>Seasonal cash results</h3>
          <span className="subtle">Latest 40 seasons</span>
        </div>
        <p>
          Income minus operating payments shows your cash operating surplus.
          Land, vines, research and equipment are investments; net cash includes
          those purchases. Starting capital is excluded. This is a cash report,
          so supplies count when paid and unsold wine is not income.
        </p>
        {finance ? (
          <>
            <p>
              Tracking from Year {calendar(finance.startedWeek).year}, week{' '}
              {calendar(finance.startedWeek).week}. The first season may be
              partial; current season is to date.
            </p>
            <p>
              <strong>Since tracking began:</strong> income{' '}
              {amount(finance.totals.income)} · operating payments{' '}
              {amount(finance.totals.operating)} · investments{' '}
              {amount(finance.totals.investment)} · net cash{' '}
              {amount(
                finance.totals.income -
                  finance.totals.operating -
                  finance.totals.investment,
              )}
              .
            </p>
            <div
              className="finance-scroll"
              role="region"
              aria-label="Seasonal cash table"
              tabIndex={0}
            >
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Season</th>
                    <th>Income</th>
                    <th>Operating payments</th>
                    <th>Operating surplus</th>
                    <th>Investments</th>
                    <th>Net cash</th>
                  </tr>
                </thead>
                <tbody>
                  {finance.seasons.map((row) => (
                    <tr key={row.season}>
                      <th scope="row">
                        Year {Math.floor(row.season / 4) + 1} ·{' '}
                        {
                          ['Spring', 'Summer', 'Autumn', 'Winter'][
                            row.season % 4
                          ]
                        }
                      </th>
                      <td>{amount(row.income)}</td>
                      <td>{amount(row.operating)}</td>
                      <td>{amount(row.income - row.operating)}</td>
                      <td>{amount(row.investment)}</td>
                      <td>
                        {amount(row.income - row.operating - row.investment)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p>
            Seasonal records begin with your next payment or sale. Older
            transactions are not reconstructed.
          </p>
        )}
      </section>
      <section className="finance-report" aria-label="Release profitability">
        <div className="section-line">
          <h3>Release margins</h3>
          <span className="subtle">Recorded costs and sales</span>
        </div>
        <p>
          Direct costs include harvest crew, fermentation, cellar tasting and
          the actual cost of bottling kits. Starting kits are free. Partial
          blends and releases carry their share of costs. Margin is recorded
          sales minus the cost of bottles sold and all marketing and judging
          fees. Unsold production cost stays in inventory.
        </p>
        <p>
          Margins exclude vine care, upkeep, research and capital purchases; use
          seasonal cash results for the whole business. Older inventory and
          sales without cost records show “Unrecorded”.
        </p>
        {!state.wines.length ? (
          <p>Bottle your first release to start its account.</p>
        ) : (
          <>
            <div
              className="finance-scroll"
              role="region"
              aria-label="Release margin table"
              tabIndex={0}
            >
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Release</th>
                    <th>Sales</th>
                    <th>Direct cost sold</th>
                    <th>Promotion</th>
                    <th>Margin</th>
                    <th>Inventory cost</th>
                  </tr>
                </thead>
                <tbody>
                  {wines.map((wine) => {
                    const r = releaseResult(wine);
                    return (
                      <tr key={wine.id}>
                        <th scope="row">
                          {wine.label} · {wine.release}
                          <small>
                            {wine.accounts?.sold ?? 0} sales recorded ·{' '}
                            {wine.bottles} in stock
                          </small>
                        </th>
                        <td>{amount(r.revenueCents)}</td>
                        <td>{amount(r.costCents)}</td>
                        <td>{amount(r.promotionCents)}</td>
                        <td>{amount(r.marginCents)}</td>
                        <td>{amount(r.inventoryCents)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="finance-pagination">
                <button
                  className="button secondary"
                  disabled={currentPage === 0}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Newer releases
                </button>
                <span>
                  Page {currentPage + 1} of {pages}
                </span>
                <button
                  className="button secondary"
                  disabled={currentPage === pages - 1}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Older releases
                </button>
              </div>
            )}
          </>
        )}
        {!!archives.length && (
          <details>
            <summary>Compacted wine-line accounts</summary>
            <p>
              Sold-out releases keep their financial totals when their detailed
              histories are compacted.
            </p>
            {archives.map((line) => {
              const a = line.archive!.accounts;
              return (
                <p key={line.id}>
                  <strong>{line.name}</strong> · {line.archive!.releases}{' '}
                  releases · recorded sales {amount(a?.revenueCents ?? 0)} ·
                  promotion {amount(a?.promotionCents ?? 0)} · margin{' '}
                  {amount(
                    a?.complete
                      ? a.revenueCents - a.costCents - a.promotionCents
                      : null,
                  )}
                </p>
              );
            })}
          </details>
        )}
      </section>
    </>
  );
}
