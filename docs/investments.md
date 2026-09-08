# Investments and operating economy

Open **Build → Buildings & equipment**. Department filters cover vineyard/cellar, visitors/hospitality, sales/membership, and research/nursery. Cellar floor space and tanks have their own filter and retain their existing separate costs.

## Catalog

| Investment | Purchase | Weekly operating | Weekly suspended | Operating prerequisite |
| --- | ---: | ---: | ---: | --- |
| Drip irrigation | $6,000 | $180 | $45 | None |
| Tasting terrace | $12,000 | $400 | $100 | None |
| Winemaker’s bench | $18,000 | $550 | $138 | None |
| Visitor center | $35,000 | $1,000 | $250 | None |
| Tasting room | $50,000 | $1,600 | $400 | Visitor center |
| Sommelier team | $24,000 | $1,400 | $350 | Tasting room |
| Estate restaurant | $95,000 | $2,800 | $700 | Visitor center |
| Vineyard guesthouse | $180,000 | $3,000 | $750 | Visitor center |
| Wine club team | $45,000 | $1,200 | $300 | Tasting terrace |
| Export sales team | $85,000 | $2,200 | $550 | None |
| Optical sorting line | $32,000 | $700 | $175 | None |
| Viticulture team | $28,000 | $1,600 | $400 | None |
| Research & nursery lab | $65,000 | $1,400 | $350 | Winemaker’s bench |
| Refrigerated grape store | $42,000 | $900 | $225 | None |

These are fictional game balance values. Each investment also requires its corresponding [research project](regions-and-research.md#research-progression) before purchase; the table lists additional operating prerequisites. Research costs are separate from the purchase price. Existing owned facilities can continue operating or resume without retroactive research. Each investment is bought once for the shared business and benefits all estates. Upfront cost covers construction or team setup; weekly costs include staffing and maintenance. The eight-week figure is purchase price plus eight operating bills for that investment, excluding research, other facilities, and estate overhead.

## Hospitality

Potential weekly visitors equal floor((20 + reputation × 1.3) × season factor × attraction factor). Spring is 0.85, summer 1.15, autumn 1.35, and winter 0.45. An operating visitor center multiplies attraction by 1.25. Attendance is capped by the sum of operating terrace (24), center (60), and tasting-room (80) places. This is one shared hospitality business, not a duplicate income stream for every estate.

Admission is $14 with the terrace, otherwise $12 with the center. The tasting room adds $8 and sommeliers add $12 per visitor. A restaurant adds $20 per visitor for at most 100 visitors, plus 20% shop demand. A guesthouse fills min(24, floor(potential visitors × 0.14)) bookings at $220 each. Hospitality pays money, records lifetime revenue, and does not consume bottles or increment bottle sales. Wine sales remain separate.

Forecasts use the starting week's reputation, season, and active facilities, matching the following weekly transaction. The displayed hospitality net subtracts hospitality operating and suspended bills, but excludes wine sales and non-hospitality estate overhead. Prospective purchases show incremental hospitality income minus the new facility's bill. Quiet facilities can lose money even when they cost a great deal to build.

## Wine, production, and research benefits

- An operating tasting terrace adds 12 base shoppers per listed release. Tasting room demand multiplies by 1.15; the restaurant by 1.20.
- Sommeliers multiply demand by 1.20 for 80+ wines and suggested retail value by 1.08. The chosen shelf price and recorded wine score remain unchanged. Retail suggestions cap at $1,000.
- The wine club multiplies demand by 1.35 for releases aged at least 12 game weeks. Export staff multiply demand by 1.45 and wholesale value by 1.08 for wines rated 85+. These benefits compound with the existing market, price, release-age, marketing, and judging formulas; sales remain capped by stock.
- Irrigation retains its +3 growth and dry-spell protection. Viticulture staff add +2 growth and reduce health loss by one on every growing parcel, including offscreen estates. Sorting adds +2 to new harvest quality; temperature control retains +3 on new fermentations. Historical wine and batch scores do not change.
- Refrigeration extends freshness from three to five weeks. Suspension restores the three-week limit at the next spoilage check. Already old grapes are marked for immediate processing in the cellar.
- The research/nursery lab adds 10 weekly knowledge and consumes two study/trial progress units per game week. Completion handles odd remaining durations without overshooting or rerolling the offspring. Timelines in Research show the active pace and revert when suspended.

## Suspension, failure, and saves

Suspend preserves ownership, removes benefits, and charges 25% of the listed weekly bill, rounded up. Suspending a prerequisite explicitly suspends its dependents. Reopening the prerequisite does not automatically restart their bills; resume each investment individually. Resuming is free but requires enough cash for one full week of total estate upkeep after the change.

If available cash after that week's revenue cannot cover its bill, the game suspends all non-legacy investments. The full bill for the week just operated is still charged; reduced bills apply afterward. Existing emergency vineyard work and its reputation penalty keep the game playable, but do not leave expensive facilities active. This first iteration has no sale, demolition, partial shifts, or refund.

Version-five saves add a default-empty suspendedUpgrades list and accept the expanded catalog. Older owned irrigation, terrace, bench, and legacy cellar assets remain owned; funds, crop state, stored wine, and scores are preserved. Existing facilities adopt the new operating prices. The old cellar extension retains its $15 upkeep and cannot be suspended, since its tanks remain usable. Prerequisite ownership, enum values, duplicate entries, and valid owned suspension IDs are validated on import. No storage key change is required.
