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

Each grape has preferred warmth (1–5), resilience (0–7), finesse (−2 to +8 quality), yield factor (75–110%), soil, wine color, and planting cost. A local favorite receives a 15% planting discount, one level of climate tolerance, and +3 quality. Soil match adds +8 quality. Climate adaptation research grants another level of tolerance.

Effective mismatch is the difference between grape and region warmth after tolerance. It changes weekly growth by `round(2 − 2 × mismatch)` and harvest quality by `round(3 − 4 × mismatch)`. Health loss includes mismatch, reduced by resilience. Imported grapes remain plantable; difficult combinations may need care, irrigation, or research to ripen in time.

## Research progression

- **Vine science:** 30 knowledge, $350, 2 weeks. Opens the tree; weekly knowledge rises from 6 to 8.
- **Heritage collection:** requires Vine science; 40 knowledge, $600, 3 weeks. Unlocks ten heritage grapes (regional favorites may already be available).
- **Climate adaptation:** requires Vine science; 50 knowledge, $800, 3 weeks. Reduces climate mismatch by one level.
- **Cross-pollination:** requires Vine science; 55 knowledge, $900, 3 weeks. Opens breeding.
- **World collection:** requires Heritage collection; 65 knowledge, $1,000, 3 weeks. Unlocks every classic variety.
- **Field selection:** requires Cross-pollination; 70 knowledge, $1,100, 4 weeks. Adds two effective resilience, capped at seven, and shortens new breeding trials to three weeks.

One research project and one nursery trial may run simultaneously. Knowledge is also earned through harvests (+12) and bottling (+1 for every 40 bottles produced; updated with the reserves expansion). Failed or repeated actions do not grant rewards.

## Breeding

A trial costs 60 knowledge and $900. Two distinct unlocked parents are required, including previously bred grapes. Choose a unique name up to 28 characters. An estate can retain 60 custom grapes; the cap is shown when reached.

The offspring inherits a randomly selected parent's color and preferred soil. Other traits begin from parent averages. Regional adaptation shifts warmth up to one point toward the estate climate and reduces yield by three percentage points. Hardiness adds two resilience and removes one finesse. Quality selection adds three finesse, removes one resilience, and reduces yield by eight percentage points. Trait bounds prevent endless improvement through repeated crossing. Breeding is an accelerated fictional model, not a prediction of actual grape genetics.

Inheritance is rolled when the trial starts and included in the save, preventing reloads from rerolling the result. After the trial, the grape becomes available to the vineyard and the complete production chain. Parent IDs remain attached through later generations.

## Persistence

Version two extends the schema rather than replacing the save mechanism. The original localStorage key is retained. Version-one files and existing browser saves migrate to a Bordeaux estate with original parcel soils and all previous assets intact. New estates use regional soils. Validation checks region IDs, known grapes, unique hybrid IDs, parent ordering, inventory references, trait bounds, research prerequisites, and project progress. JSON export/import includes active trials and all finished lineages.
