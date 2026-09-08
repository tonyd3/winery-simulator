# Estate accounts

The Journal separates seasonal cash results from release margins. Neither changes prices, sales, inventory, or the cash cost of an action.

## Seasonal cash results

Every payment and receipt contributes to a saved three-week season total, independently of the 80-row transaction ledger. The latest 40 seasons remain visible; cumulative totals continue beyond that window.

- Income includes shop sales, wholesale wine, grapes, and hospitality.
- Operating payments include vine care and removal, harvesting, fermentation, supplies, tasting, marketing, judging, and upkeep.
- Investments include land, plot and district expansions, vines, cellar space, tanks, buildings, studies, and breeding trials.
- Cash operating surplus is income minus operating payments. Net cash also subtracts investments.
- Starting capital is excluded. The first tracked season may be partial and the current season is to date.

These are cash results, not accrual profit: ordered supplies count when paid, unsold inventory is not income, and no depreciation or unpaid bill is invented. Bankruptcy records the final cash payment; its remaining unpaid amount stays in the closure record.

## Release margins

New grape lots carry the actual harvest-crew cost. Fermentation adds its cost, and paid reserve tasting adds the tasting fee. These costs follow the liquid through partial blending and bottling. Integer-cent allocations conserve the total, including leftovers. Each bottled release also receives its share of actual bottling-kit inventory cost. The starting 600 kits are free; purchased kits are valued at their paid cost and mixed inventory uses its average cost.

Sales record their actual shelf or wholesale proceeds. The cost of bottles sold is allocated from the release's production cost; the rest remains inventory cost. Marketing and judging fees are charged in full to the release. Margin is recorded sales less sold production cost and those promotion fees.

Release margins exclude vine care, estate upkeep, research, land, and equipment. Seasonal cash results reveal whether those wider expenses are covered. A release with stock remaining shows only realized margin, not projected proceeds. Its margin can be negative before sales cover promotion.

When sold-out history is compacted, financial totals remain with the wine line. This preserves results without reintroducing the 1,000-release bottling dead end.

## Older saves

No financial history is inferred from a truncated ledger. Cash tracking starts with the next receipt or payment. Existing liquid and kit costs without records remain unrecorded, and releases containing those costs do not show a fabricated margin. Sales and promotion from this update onward are recorded. Consuming all unknown kit inventory lets later purchased inventory establish a known cost basis.

Save version six remains unchanged; all new fields are additive and legacy defaults are explicit.

Implementation: [finance.ts](../src/finance.ts), [FinanceReport.tsx](../src/FinanceReport.tsx), [winemaking.ts](../src/winemaking.ts), and [finance tests](../tests/finance.test.ts).
