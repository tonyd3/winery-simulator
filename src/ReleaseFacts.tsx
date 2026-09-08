import type { Wine } from './game';
import { releaseFacts } from './finance';

export const recordedMoney = (cents: number | null) =>
  cents === null
    ? 'Unrecorded'
    : (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });

export function ReleaseFacts({ wine }: { wine: Wine }) {
  const facts = releaseFacts(wine);
  const hasSales = (wine.accounts?.sold ?? 0) > 0;
  return (
    <div className="release-finances">
      <dl className="release-money">
        <div>
          <dt>Total profit</dt>
          <dd>{recordedMoney(facts.profitCents)}</dd>
        </div>
        <div>
          <dt>Recorded revenue</dt>
          <dd>{recordedMoney(facts.revenueCents)}</dd>
        </div>
        <div>
          <dt>Average sale price</dt>
          <dd>
            {hasSales
              ? recordedMoney(facts.averagePriceCents)
              : facts.profitCents === null
                ? 'No recorded sales'
                : 'No sales yet'}
          </dd>
        </div>
        <div>
          <dt>Profit / sold bottle</dt>
          <dd>
            {facts.profitCents === null
              ? 'Unrecorded'
              : hasSales
                ? recordedMoney(facts.profitPerBottleCents)
                : 'No sales yet'}
          </dd>
        </div>
      </dl>
      <dl className="release-costs">
        <div>
          <dt>Production cost of sold bottles</dt>
          <dd>{recordedMoney(facts.costCents)}</dd>
        </div>
        <div>
          <dt>Marketing & judging</dt>
          <dd>{recordedMoney(facts.promotionCents)}</dd>
        </div>
        <div>
          <dt>Cost of unsold stock</dt>
          <dd>{recordedMoney(facts.inventoryCents)}</dd>
        </div>
      </dl>
      {facts.profitCents === null && (
        <p className="release-accounts-note">
          Earlier costs or sales are missing, so total profit is unrecorded.
          Revenue and averages include recorded sales only.
        </p>
      )}
    </div>
  );
}
