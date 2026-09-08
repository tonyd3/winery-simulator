# Regions and grape discovery

## Regional inspiration

Research checked September 7, 2026. Region identities borrow from real wine country; the game does not enforce appellation regulations. Its six small parcels represent invented estates, not geological surveys of entire regions.

| Region      | Inspiration and primary source                                                                                                                                                                                                                                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bordeaux    | Merlot, Cabernet Sauvignon, Cabernet Franc, Sémillon, and Sauvignon Blanc. [Bordeaux Wine Council](https://www.bordeaux.com/en/grape-varieties/) describes the main grapes; its [Merlot profile](https://www.bordeaux.com/en/grape-varieties/merlot/) supports the clay/limestone association.                                                                 |
| Burgundy    | Pinot Noir and Chardonnay on limestone-related soils, with Aligoté in the local collection. The [Bourgogne Wine Board's geology guide](https://www.bourgogne-wines.com/wine-and-terroir/our-natural-assets/geology/the-birth-of-bourgogne-wines/the-birth-of-bourgogne-wines-thousands-of-years-of-history%2C2479%2C9399.html) provides the limestone context. |
| Napa Valley | Cabernet-centered production, with Chardonnay and other international varieties. [Napa Valley Vintners](https://www.napavintners.com/napa_valley/) describes the region's grapes and diversity.                                                                                                                                                                |
| Mosel       | Cool river slopes and slate, especially associated with Riesling. [German Wine Institute](https://www.winesofgermany.com/our-regions/growing-area/72/mosel).                                                                                                                                                                                                   |
| Tuscany     | Sangiovese as the regional anchor, with international and Mediterranean choices. [Consorzio Chianti Classico](https://www.chianticlassico.com/en/wine/characteristics/) supports Sangiovese's central role; Tuscany is broader than that appellation.                                                                                                          |
| Rioja       | Tempranillo, Garnacha, and Viura. [Consejo Regulador DOCa Rioja](https://riojawine.com/en-gb/blog/what-type-of-grapes-are-used-in-rioja/).                                                                                                                                                                                                                     |
| Mendoza     | Malbec and high-altitude vineyard inspiration. [Wines of Argentina](https://blog.winesofargentina.com/es/noticias/malbec/que-gustos-tuvo-el-malbec-a-contar-desde-1990/) discusses altitude and changing Malbec styles; Torrontés is a broader Argentine inspiration.                                                                                          |
| Barossa     | Shiraz, Grenache, Mataro, and Sémillon. [Barossa Australia](https://barossawine.com/wine/barossa-wine-varieties/) distinguishes the warm Barossa Valley from cooler Eden Valley; our starting estate uses the warmer identity.                                                                                                                                 |

## Deliberate simulation choices

All numeric grape traits, soil assignments to individual parcels, weather temperatures, costs, and trait inheritance are invented for play. The regions are simplified and contain considerable real-world diversity. Northern and southern regions share an abstract spring-to-winter calendar; the game does not display Gregorian months.

Each grape has preferred warmth (1–5), resilience (0–7), finesse (−2 to +8, contributing two harvest-quality points per finesse point), yield factor (75–110%), soil, wine color, and planting cost. A local favorite receives a 15% planting discount, one level of climate tolerance, and +3 quality. Soil match adds +8 quality. Climate adaptation research grants another level of tolerance.

Effective mismatch is the difference between grape and region warmth after tolerance. It changes weekly growth by `round(2 − 2 × mismatch)` and harvest quality by `round(3 − 4 × mismatch)`. Health loss includes mismatch, reduced by resilience. Imported grapes remain plantable; difficult combinations may need care, irrigation, or research to ripen in time.

Harvest quality is `round(-10 + 0.4 × health + 0.3 × ripeness + site-and-grape-quality)`, bounded to 0–100. The site-and-grape term combines climate, local-favorite, soil, and doubled finesse contributions above. Untended first harvests span 67–75 across the eight starts, instead of the previous 95–99. A fully healthy, ripe, correctly sited Burgundy Pinot Noir reaches 82 fruit quality; temperature control and full oak maturity take its potential to 91 before final tasting. Neglected fruit falls much lower.

New fermentations receive +3 from temperature control. Aging adds `maximum × sqrt(age / 8)`, with a maximum of 6 for oak or 3 for steel, capped at eight weeks and rounded with the batch quality. Existing batches without the saved `agingProfile: balanced` marker retain their old maturation curve; existing grapes, reserves, and scored wines are not regraded.

For market value, Prestige influence equals the score through 100 and `100 + 25 × log2(Prestige / 100)` above 100. Wine scores above 90 add `6 × (score − 90)² × (0.6 + influence × 0.008)` to the original base value before rounding. Medal and marketing bonuses are then added. The premium uses the bottle's original score and applies to both retail valuation and wholesale; temporary marketing remains retail-only. Suggested values stay within the supported $1–$1,000 range, and a saved shelf price changes only when the player changes it.

## Research progression

The current catalog has 64 projects: 30 techniques and 34 individual grape field studies. See `src/catalog.ts` for the full cost/prerequisite table. The research ledger shows all costs, remaining time, prerequisites, and unlock descriptions. Each region starts with only its two founding grapes; technique nodes never grant an entire grape collection. All studied grapes can be planted across all owned regions, with region-specific climate and planting costs.

| Branch | Progression and actual unlocks |
| --- | --- |
| Vineyard science | Vine science (+2 weekly knowledge) → Nursery propagation → Climate adaptation, Cross-pollination → Field selection (+2 resilience, shorter trials) → Generational crosses. Cross-pollination also opens Aroma & finesse selection. Soil & water mapping unlocks irrigation; Precision viticulture unlocks vineyard staff. |
| Cellar techniques | Cellar foundations → Varietal assemblage → Perpetual reserves, Regional cuvées, Red & white experiments. Fermentation control unlocks the winemaker’s bench; Selective fruit handling unlocks optical sorting; Cold-chain logistics unlocks refrigeration. Sensory science is required for sommelier training. |
| Tourism & hospitality | Wine tourism → Visitor services → Hosted tastings → Sommelier training / Wine & gastronomy → Destination stays. These permit separate purchases of terrace, visitor center, tasting room, sommelier team, restaurant, and guesthouse. |
| Commerce & discovery | Estate storytelling → Cellar-door membership / Export trade. Experimental viticulture opens rare grape studies. Field notebooks adds 4 weekly knowledge. Research institute unlocks the lab. |
| Individual grapes | Classic grapes require Vine science; heritage grapes require Nursery propagation; rare grapes require Experimental viticulture. Each variety has a separate duration and price based on rarity, planting cost, and finesse. Home-region favorites cost 20% less cash and require two fewer study weeks. Visiting or buying a different region does not change these study terms. |

Technique studies cost $1,200–$140,000 and take 6–60 weeks; 12 weeks equal one game year. The field-study catalog adds ten base weeks, eight per rarity tier, and two per positive finesse point. Its cash and knowledge costs also increase by rarity and finesse. Local discounts apply before lab acceleration. Investment purchases remain separately priced, with their full ongoing operating costs.

One prepaid study and one nursery trial can run simultaneously. Knowledge comes from weekly observation (6 base), harvests (+12), and bottling (+1 per 40 bottles produced). Vine science adds 2 weekly knowledge; Field notebooks adds 4. An operating research lab adds 10 and advances both studies and trials by two study weeks per game week. Pausing the lab restores normal speed. Pausing a study retains the occupied slot; abandoning frees it, loses progress, and refunds nothing. No cost is charged again during an active project.

Basic harvest, fermentation, aging, reserve storage, analysis, single-lot bottling, marketing, judging, land, and tank purchases stay available. Every purchase in the 14-item capital investment catalog has a research prerequisite. Existing owned facilities can operate and resume without retroactive research charges.

Blend creation checks all positive-volume recipe components, including those inside earlier blends. Different grapes, years, estate origins, and wine colors require separate studies. Failed attempts consume no wine, money, IDs, knowledge, or RNG. Permission does not improve a recipe’s score: compatibility and component quality still matter. Existing blends remain bottleable.

## Breeding

A trial costs 80 knowledge and $2,000, and lasts 8 weeks (6 after Field selection). Two distinct unlocked parents are required. Previously bred parents require Generational crosses; the Wine quality trait requires Aroma & finesse selection. Choose a unique name up to 28 characters. An estate can retain 60 custom grapes; the cap is shown when reached.

The offspring inherits a randomly selected parent's color and preferred soil. Other traits begin from parent averages. Regional adaptation shifts warmth up to one point toward the estate climate and reduces yield by three percentage points. Hardiness adds two resilience and removes one finesse. Quality selection adds three finesse, removes one resilience, and reduces yield by eight percentage points. Trait bounds prevent endless improvement through repeated crossing. Breeding is an accelerated fictional model, not a prediction of actual grape genetics.

Inheritance is rolled when the trial starts and included in the save, preventing reloads from rerolling the result. After the trial, the grape becomes available to the vineyard and the complete production chain. Parent IDs remain attached through later generations.

## Persistence

Version six retains the original storage key and migrates versions one through five. Estates keep their land, inventory, prices, scores, facilities, funds, and calendar. A separate grape-license list preserves founding grapes and every grape an old save could plant. New grape discoveries are individually recorded in the completed-research list.

Legacy collection studies retain original remaining time and grant the exact promised heritage or world collection when they finish. Other old in-flight research and breeding trials keep their remaining time. Completed legacy techniques gain the prerequisites required by the new tree; malformed old progression is rejected before migration. A future study uses the new price and duration.

The saved project stores its contracted duration, remaining study weeks, and pause state. Save validation checks the project against its catalog maximum, completed prerequisites, duplicate licenses, known grapes, custom lineage, and inventory references. New-game studies and field trials persist across reloads without refunds or rerolls. See `tests/research-progression.test.ts` and `tests/expansion.test.ts`.

The expanded [34-grape library](grape-library.md) adds ten individual studies and new blending options. Legacy collection rewards are frozen to their original 24-grape catalog; all ten additions need individual studies in older estates too. Current saves retain their licenses, completed studies, and active projects.

The introductory breeding chain plus a trial totals $9,000 and 28 study/trial weeks. The mixed red/white blending chain totals $8,000 and 20 study weeks. These totals exclude upkeep, planting and waits for resources. Previously paid studies and trials retain their saved durations and remaining weeks.
