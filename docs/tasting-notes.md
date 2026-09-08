# Likely tasting notes

The bottling workbench forecasts a wine’s aromas, body, acidity, tannins, regional style, and recorded maturation. The finished-bottle reveal repeats the forecast. Find it later under **Wine shop → Tasting notes & provenance**, **Wine history**, or **Cellar → Wine lines**.

These descriptions are a style forecast. Source quality shapes the finish description, but aromas are not quality bonuses: a fragrant wine can still score poorly. Generating or viewing notes consumes no simulation randomness, knowledge, cash, or game time, and does not add a price or sales bonus.

## How the forecast works

- All 52 grape varieties have a small sensory profile. Each component contributes by its share of the actual bottled volume. Leading aromas are shown; trace additions cannot take over the description.
- Each harvest year and source region has a stable aromatic expression. Related fruit descriptions and their prominence vary within the grape's vocabulary: Cabernet can lean toward fresh blackcurrant and black cherry in one vintage, cassis and black cherry preserve in another. This is deterministic game variation, not a claim about historical weather. Different vintages can still resemble one another.
- New harvests record ripeness, vine health, and the share of growing weeks with sunshine or dry weather up to picking. Fresher picks favor lifted fruit and acidity; fully ripe picks favor fuller fruit and softer tannins. The weather contribution is modest. Stressed vines can give a more subdued finish. Picking conditions are captured before the plot resets and remain attached to each portion of wine.
- Bred grapes inherit equal parts of their parents’ sensory profiles. Ancestry is resolved through successive generations, so a backcross carries more of the recurring parent’s character.
- Each source estate contributes its region’s style by volume. Cool regions favor freshness and lighter body; warm regions favor fuller, riper styles. A blend lists every source region and its approximate percentage. Switching the estate you are managing does not change the wine’s origins.
- French oak contributes vanilla, then baking spice or toast and cedar as recorded maturation increases. Its contribution scales with the proportion of oak-treated wine. Steel adds no oak aromas. Longer oak maturation can soften the forecast tannins and round the texture.
- Multiple vessels and maturation periods survive blending, reblending, and partial bottling. The aging row lists each vessel’s share and the range of recorded maturation weeks. These are compressed **game weeks**, not a real cellar schedule.

For example, a Burgundy Pinot Noir matured four weeks in French oak suggests cherry and raspberry expressions, violet, vanilla, and baking spice. Its harvest can shift the fruit's freshness and structure. A warm-region Syrah has a fuller dark-fruit and pepper profile. A small white-grape addition may contribute an accent without displacing the leading red-grape aromas.

Harvest years remain in the recipe, but elapsed calendar time is not treated as maturation. The current simulation only ages wine when the player starts aging in the fermentation cellar. Waiting in reserves or keeping a bottle in stock does not invent new aging, tertiary aromas, sweetness, or alcohol measurements. Soil continues to affect suitability and quality; it does not invent literal soil flavors.

## Saves and release history

Each newly stored component records `maturation: { vessel: 'oak' | 'steel', weeks: 0..8 }`. Zero means fermentation completed without extra maturation. Combining lots keeps distinct maturation histories separate, while the visible grape recipe still groups matching grapes, estates, and vintages.

Newly picked grapes also record `harvest: { ripeness: 80..100, health: 0..100, sunExposure: 0..1 }`. This optional record survives partial fermentation, aging, reserves, reblending, and partial bottling. Different picking histories remain separate even when grape, estate, year, quality, and vessel match. Blended descriptions weight the actual wine volume; the Vintage row states the recorded share and marks any missing harvest history.

Each new bottled release stores its descriptive `tasting` snapshot with its recipe and label. Later catalog edits, estate navigation, naming changes, and passing weeks cannot rewrite that snapshot. The bottling preview uses the same milliliter allocation as the final release.

These fields are optional additions to save version 6. Existing batches retain their known oak/steel choice and age when moved to reserves. Older lots without a harvest record receive grape, region, source-quality, and year-based estimates without inventing picking conditions. Older bottles without a tasting snapshot receive the updated forecast. Already saved tasting snapshots keep their original text. Missing aging history remains explicit; a reserve name containing “Réserve” is never taken as evidence of oak use.

## Implementation and checks

- `src/wineSensory.ts`: grape and region profiles, ancestry, weighted descriptors, snapshot validation.
- `src/winemaking.ts`: maturation metadata and liquid-preserving recipe operations.
- `src/game.ts`: transfer of batch history and bottling snapshots.
- `src/TastingNotes.tsx`: shared card for preview, reveal, shop, and archive.
- `tests/wine-sensory.test.ts`: catalog coverage, proportions, ancestry, origins, vessels, partial bottling, serialization, legacy saves, and unchanged scoring randomness.

## Inspiration and limits

The aromatic vocabulary and climate/oak relationships draw on WSET’s explanations of [geography and wine style](https://www.wsetglobal.com/knowledge-centre/blog/2021/august/24/how-does-geography-affect-a-wine-s-style), [oak in winemaking](https://www.wsetglobal.com/knowledge-centre/blog/2021/july/27/why-is-oak-used-in-winemaking/), and [wine aging](https://www.wsetglobal.com/knowledge-centre/blog/2023/march/21/why-do-we-age-wine/). Grape and regional context also follows the sources in the [grape library](grape-library.md).

The numeric character values, aroma cutoffs, regional adjustments, and maturation thresholds are game design choices. They are not laboratory measurements, appellation rules, or a claim that every real wine from a grape or region tastes alike.
