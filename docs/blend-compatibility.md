# Blend compatibility

Blends now receive a grape compatibility adjustment of **−6 to +4 points**, replacing the universal varietal-diversity bonus. Weighted source quality remains the foundation; the seeded final tasting still varies by −3 to +3. Scores are bounded to 0–100. All previously recorded reserve and bottle scores stay fixed. Unscored recipes use the new rules, including recipes in existing saves.

## Player choices

- Cabernet Sauvignon, Merlot, and Cabernet Franc complement each other; Malbec is a slightly softer match in this group.
- Grenache, Syrah, and Mourvèdre complement each other, as do Sauvignon Blanc and Sémillon.
- Sangiovese with Merlot or Cabernet, and Tempranillo with Grenache, receive a smaller positive affinity.
- Petit Verdot supports Bordeaux partners when it is a small accent. Its affinity begins falling above 20% of the whole recipe, becomes negative above 40%, and reaches its minimum at 70%. These thresholds are invented for gameplay.
- Pinot Noir can lose definition alongside powerful red grapes. Red/white combinations receive style tension in this game's still-wine model, especially aromatic whites with reds. Pinot Noir–Chardonnay is neutral. These are simplified style choices, not claims that such wines cannot succeed in reality.
- Other pairings are neutral. An unfamiliar combination is not inherently bad, and more grape names never guarantee a better wine.
- A single variety has no pairing adjustment, including multiple vintages of it. Its source quality can still make an exceptional wine.

At equal source quality of 80, before final tasting:

| Recipe | Compatibility | Potential |
| --- | ---: | ---: |
| 50% Cabernet / 50% Merlot | +4.00 | 84 |
| 90% Merlot / 10% Cabernet | +1.44 | 81 |
| 50% Chardonnay / 50% Aligoté | 0.00 | 80 |
| 50% Pinot Noir / 50% Cabernet | −4.00 | 76 |
| 50% Riesling / 50% Cabernet | −6.00 | 74 |
| 90% Merlot / 10% Petit Verdot | +1.44 | 81 |
| 50% Merlot / 50% Petit Verdot | −2.00 | 78 |

The blending bench and tasting table show source quality, compatibility, and each pair's contribution at the chosen proportions. They show up to six largest pair effects; every pair contributes to the total. A recorded tasting is shown separately from current recipe analysis, so an old score is not presented as a recalculated result.

The [blend planner and trial notebook](blend-planning.md) let players scale a recipe by percentage and compare up to three saved recipes with the current bench. These tools use the same source-quality, compatibility, and sensory models. Saving or applying a trial neither consumes wine nor records a final tasting score.

## Calculation and persistence

Aggregate each variety across lots and vintages. For shares `a` and `b`, a pair's weight is `a × b`. Compute the weighted mean of all pair affinities, including neutral pairs, then multiply by `min(1, 4 × sum(pair weights))`. This fades out tiny additions and caps total harmony without stacking bonuses for every extra grape. Sum full-precision effects before rounding the overall potential; UI contributions are rounded to one decimal.

Hybrid pair affinities inherit half of each parent's tendencies, recursively through all generations. Overlapping ancestry adds no extra affinity. The proportion of Petit Verdot includes its inherited share in hybrids. A pure lot of a hybrid remains a single variety and receives no automatic blend bonus. Hybrid genetics here are a deterministic game abstraction.

Compatibility always uses intrinsic components, never a previous tasting or blend score. Preview, reserve potential, optional paid tasting, and direct bottling use the same function and saved hybrid lineage. The final tasting is still rolled once per reserve. Reloading, partial bottling, and additional releases preserve it. No save schema change or migration is required.

## Inspiration

Primary references inform the complementary families, not the invented numeric adjustments:

- [Bordeaux: The art of the blend](https://www.bordeaux.com/en/mag/blog/the-art-of-the-blend/) describes blending Merlot's roundness, Cabernet's structure, and Cabernet Franc's aromatic contribution.
- [Bordeaux: Sémillon](https://www.bordeaux.com/en/grape-varieties/semillon/) describes its partnership with Sauvignon Blanc.
- [Rhône grape varieties](https://www.vins-rhone.com/fr/vignobles-de-la-vallee-du-rhone/les-cepages?page=2) describes Grenache, Syrah, and Mourvèdre in regional blends.
- [Château Palmer's wine library](https://www.chateau-palmer.com/en/wine-library) provides examples of Petit Verdot used in small proportions alongside Merlot and Cabernet Sauvignon. The 20% gameplay threshold is not an appellation rule or a winemaking limit.
