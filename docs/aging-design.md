# Aging by grape and wine style

Approved design proposal, September 8, 2026. This document preserves the research and proposed defaults for all 34 base grapes in [the catalog](../src/catalog.ts), plus bred varieties and blends. The implemented rules, exact coefficients, technique scheduling, and compatibility behavior are in [Maturation](aging.md); the table below remains the original balance proposal.

The current catalog has since expanded to 52 grapes. [Maturation](aging.md) also documents the 18 additional profiles and their integration with vintage notes, production costs, and automatic aging for older batches.

The recommended change is to make maturation a choice about the wine's style, balance, and release timing. An expensive vessel should not automatically produce a better wine.

## Behavior before this change

- [The quality calculation](../src/game.ts) gives every new batch up to six points in oak or three in steel, following the same eight-week curve. It does not consult the grape, body, acidity, tannin, or selected techniques. Older batches retain their earlier curve.
- [The cellar](../src/Panels.tsx) has one oak checkbox shared by the fresh harvests. That choice applies to both fermentation and subsequent aging; the player cannot choose a different maturation vessel after fermentation.
- Every batch receives the same “peak maturity” message at eight weeks. Aging stops advancing there, without a decline.
- [Tasting notes](../src/wineSensory.ts) already distinguish grapes, regions, techniques, and hybrid ancestry. Oak adds aromas and modest tannin softening, but those differences do not affect the maturation quality calculation.
- [Reserve components](../src/winemaking.ts) preserve the vessel and aging duration. Reserve storage and bottle inventory do not currently simulate further maturation.

The consequence is a universal oak quality advantage, with no grape-specific quality reason to choose steel. That is the main mismatch to fix.

## Three useful choices

| Player choice | What it represents | Reason to choose it | Tradeoff |
| --- | --- | --- | --- |
| Stainless steel tank | A vessel that contributes no wood flavor; oxygen exposure is controlled through cellar handling | Preserve fruit, flowers, freshness, and a clean expression; support an earlier release | Waiting alone should not keep adding quality or reproduce barrel maturation |
| Neutral oak | Well-used oak with little remaining flavor contribution | Develop texture and integrate a wine while keeping oak aromas restrained | Still occupies cellar capacity and needs time; it is not chemically identical to steel |
| French oak barrel | Oak with a meaningful remaining flavor contribution | Add a measured spice/toast character and develop a fuller or more structured style | More expense; excessive exposure can mask fruit and unbalance even a powerful wine |

Call the first choice a **stainless steel tank** in the game. Stainless steel barrels also exist, but the current equipment is presented as tanks.

Newness, size, and time matter as well as wood origin. A large old cask and a small new French barrel must not share one automatic flavor effect. Neutral oak is a useful first abstraction for low-flavor wood maturation, although real old casks differ in size and oxygen behavior. WSET explains that oak changes style without inherently increasing quality; Tablas Creek describes its use of large and neutral vessels to preserve fruit while allowing development. [WSET: oak in winemaking](https://www.wsetglobal.com/knowledge-centre/blog/2021/july/27/why-is-oak-used-in-winemaking/), [Tablas Creek: large oak](https://blog.tablascreek.com/2011/04/foudres-demi-muids-puncheons-and-wood-fermenters-the-appeal-of-large-oak/).

American oak can be a later option, especially for Rioja-inspired and some New World styles. It should be another flavor choice, with barrel age and exposure still relevant, rather than an upgrade above French oak. Concrete and amphora can wait until they add a distinct player decision.

## All 34 grapes

These are **proposed game defaults**, informed by broad wine styles and the examples below. They are not exclusive winemaking rules, measured quality coefficients, or a claim that every producer follows the same method. All three choices remain available. Recommendations should adapt to the actual lot and its intended style.

The windows are initial balance proposals for **active maturation in compressed game weeks**, not real cellar schedules or bottle-aging potential. “1–2” means an early-release direction; “5–8” means a patient, structured direction. Longer time is not a quality ranking. Technique time needs to be reconciled with these windows before implementation, particularly lees aging.

| Catalog ID | Grape | Suggested starting vessel | Game weeks | Alternatives and important qualification |
| --- | --- | --- | --- | --- |
| `merlot` | Merlot | Neutral oak or measured French oak | 3–5 | Steel supports a fresher, earlier style; softer lots need less maturation than firm ones. |
| `chardonnay` | Chardonnay | Steel for a crisp style; French oak for a richer style | 1–3 / 3–5 | Offer two equally legitimate routes. Neutral oak with lees is a third; butter should not be an automatic oak effect. |
| `pinot` | Pinot Noir | Neutral oak | 3–5 | Measured French oak is legitimate, including ambitious barrel-aged styles. Preserve its perfume and avoid assuming delicate means incapable of aging. |
| `cabernet` | Cabernet Sauvignon | French or neutral oak | 5–8 | Ripe, structured lots support a longer plan. Oak cannot repair poor fruit or guarantee balance. |
| `sauvignon` | Sauvignon Blanc | Steel | 1–2 | Neutral or measured French oak supports a textured Bordeaux/Fumé-style direction. Avoid treating all oak use as a mistake. |
| `syrah` | Syrah / Shiraz | Neutral or French oak | 4–7 | Fruit, pepper, and intensity should remain recognizable; oak exposure can vary widely by style. |
| `riesling` | Riesling | Steel or neutral oak | 1–3 | Strong new-oak flavor is a poor default for its delicate aromas. Short vessel maturation must not imply poor bottle-aging potential. |
| `sangiovese` | Sangiovese | Neutral oak | 4–7 | French oak is a valid richer direction; large, low-flavor wood is an important alternative to new barriques. |
| `tempranillo` | Tempranillo | Neutral or French oak | 4–7 | Preserve an early-release steel route. An American-oak option would broaden Rioja-inspired styles later. |
| `malbec` | Malbec | Neutral or French oak | 3–6 | Steel is valid for a juicy style; choose duration from concentration and tannin, not color alone. |
| `grenache` | Grenache / Garnacha | Neutral oak | 3–5 | Steel suits a fruity release. Avoid a default of strong new-oak flavor; concentrated examples can support measured oak. |
| `cabernet_franc` | Cabernet Franc | Neutral oak | 3–5 | Steel for a bright early release; French oak for sufficiently concentrated lots. Preserve floral and herbal character. |
| `semillon` | Sémillon | Steel for a fresh style; neutral oak for a textured style | 1–2 / 3–5 | French oak is legitimate for a Bordeaux-inspired direction. Unwooded Hunter-style Sémillon can still be very ageworthy in bottle. |
| `aligote` | Aligoté | Steel | 1–2 | Neutral oak and lees can support a more textured style; do not force all examples into one simple profile. |
| `zinfandel` | Zinfandel | Neutral or French oak | 3–6 | Keep a fruit-forward steel route. Richness does not grant unlimited tolerance for wood flavor. |
| `viura` | Viura | Steel for a fresh style; neutral oak for a developed style | 1–2 / 4–7 | Preserve distinct young and barrel-matured white Rioja directions. Long oxidative traditions are beyond this first simple model. |
| `torrontes` | Torrontés | Steel | 1–2 | Neutral oak is an experimental texture option; conspicuous new oak can obscure floral character. |
| `mourvedre` | Mourvèdre / Mataro | Neutral oak | 5–8 | Measured French oak is valid for concentrated lots. Long maturation need not mean strong wood flavor. |
| `petit_verdot` | Petit Verdot | Neutral or French oak | 5–8 | Give firm tannins time; blending role and grape proportions remain separate from maturation suitability. |
| `nebbiolo` | Nebbiolo | Neutral oak | 5–8 | Preserve a measured French-oak route and a lighter, earlier style. High tannin and floral delicacy can coexist. |
| `chenin` | Chenin Blanc | Steel or neutral oak | 2–4 | Measured French oak supports richer dry styles. Acidity and concentration matter; this proposal does not add sweetness or sparkling production. |
| `gewurztraminer` | Gewürztraminer | Steel or neutral oak | 1–3 | Keep perfume central. Full body does not automatically make strong new oak desirable. |
| `vermentino` | Vermentino | Steel | 1–2 | Neutral oak/lees or measured French oak can produce a richer alternative when supported by the lot. |
| `barbera` | Barbera | Steel or neutral oak | 2–4 | French oak suits some fuller styles. High acidity must not be mistaken for high tannin or a mandatory long barrel program. |
| `gamay` | Gamay | Steel or neutral oak | 1–3 | Longer neutral-oak maturation suits more structured styles; allow measured oak without making it the default. |
| `carmenere` | Carménère | Neutral or French oak | 3–6 | Preserve fruit and herbal identity. Oak must not erase consequences of underripe fruit. |
| `graciano` | Graciano | Neutral or French oak | 4–7 | Balance aromatic intensity, acidity, and tannin; reserve longer plans for lots with enough substance. |
| `petite_sirah` | Petite Sirah / Durif | Neutral or French oak | 5–8 | Firm tannins justify patience; high extraction does not make unlimited new oak beneficial. |
| `pinot_gris` | Pinot Gris / Pinot Grigio | Steel for a light style; neutral oak for a richer style | 1–2 / 2–4 | Both names refer to the same grape, with different stylistic associations. Preserve both routes. |
| `viognier` | Viognier | Steel or neutral oak | 2–4 | Measured French oak can work. Preserve apricot/floral character and freshness; body alone is an insufficient guide. |
| `albarino` | Albariño | Steel | 1–3 | Lees and neutral oak are useful textured routes; carefully selected oak-aged examples are legitimate. |
| `gruner_veltliner` | Grüner Veltliner | Steel or neutral oak | 1–3 | Richer examples support a longer neutral-oak plan; new wood should remain a deliberate style choice. |
| `marsanne` | Marsanne | Neutral oak or steel | 2–4 | Measured French oak suits a fuller style. Do not trade away all freshness to maximize texture. |
| `roussanne` | Roussanne | Neutral or measured French oak | 3–5 | Steel remains viable for aromatic clarity; preserve both perfume and texture. |

### Evidence for the exceptions

The point of the matrix is to provide sensible starting advice while leaving room for real stylistic variation:

- Wagner-Stempel's Riesling uses both stainless steel and traditional large German oak, supporting the distinction between neutral wood and strong oak flavor. [Producer's Riesling sheet](https://shop.wagner-stempel.de/index.php/fuseaction/download/lrn_file/gw_riesling_2025_e.pdf).
- Château Carbonnieux matures its Sauvignon–Sémillon white in barrels and large casks, while Tyrrell's documents unwooded Sémillon with substantial bottle-cellaring potential. [Carbonnieux white](https://carbonnieux.com/en/the-wines/chateau-carbonnieux-white/), [Tyrrell's white release notes](https://www.tyrrells.com.au/private-bin-2026-white-release).
- Rías Baixas describes both lees aging and selective oak use for Albariño, including a greater role for oak in riper vintages. [Rías Baixas winemaking](https://www.riasbaixaswines.com/about/vineyards-and-winemaking/).
- Austrian Wine's Grüner Veltliner tasting guide includes steel fermentation followed by maturation on lees in an old large cask. [Austrian Wine tasting guide](https://www.austrianwine.com/fileadmin/user_upload/PDF/AVZs/WG15_GV_Verkostung-WEB.pdf).
- Tablas Creek makes a Viognier-led white in steel and Grenache-led reds in large oak, demonstrating that white richness and red maturation do not require strong new-oak flavor. [Tablas Creek wines](https://tablascreek.com/story/vineyard_and_winemaking/our_wines).
- López de Heredia documents a Viura-led white with exceptionally long barrel aging. That is an important counterexample to a universal “white grapes need a short steel program”; its real schedule is not the proposed game schedule. [Producer's wine booklet](https://www.lopezdeheredia.com/Fichas/Boutique.pdf).

These examples support the design's flexibility. They do not scientifically validate the proposed game-week windows or every default in the table. Those remain design judgments to balance and test.

## Recommended player experience

1. **Ferment the harvest.** Keep steel as the simple default. Any barrel-fermentation choice is recorded separately and can remain an advanced option, especially for appropriate white-wine styles.
2. **Choose maturation for this batch.** Show steel, neutral oak, and French oak with the grape's advice, total price, capacity occupied, and a suggested duration. Replace the shared oak checkbox with a per-batch decision.
3. **Choose a release direction.** Offer an early, fresh release or more developed texture where appropriate. Chardonnay and Pinot Gris should visibly support distinct styles without one being labeled inferior.
4. **Watch readiness and oak influence separately.** A wine can be structurally young but already strongly oaked, or ready to release with almost no oak flavor. Show useful language such as developing, ready to release, and oak becoming dominant.
5. **Move to reserves.** Offer an optional scheduled transfer at the chosen duration. Validate reserve capacity when the transfer occurs; if space is unavailable, keep the wine accounted for in its vessels and report that action is needed. Continue to allow manual transfer after required processing finishes.

Illustrative advice: “Riesling: steel or neutral oak preserves its floral character. Suggested release: 1–3 game weeks.” “Cabernet Sauvignon: allow more time for its firm structure. French or neutral oak; suggested release: 5–8 game weeks.” These are draft concepts, not implemented player copy.

## How the simulation should decide quality

Use grape-specific starting profiles for development time, aroma sensitivity, and tolerance for oak flavor. Modify the recommendation using the lot's body, tannin, acidity, fruit condition, and selected techniques. Grape identity provides a starting point; the actual wine determines the result.

Track two separate effects:

- **Maturation readiness:** integration and development appropriate to the intended style, with a useful release window and diminishing benefits.
- **Oak exposure:** flavor contribution accumulated from the actual wood treatment and duration. It can complement a wine, do little for it, or overwhelm it. Neutral oak should contribute little wood flavor while still offering its own maturation behavior.

Keep adjustments modest so vineyard quality remains decisive. Remove the blanket oak-versus-steel quality premium. A well-made fresh white must be able to reach an exceptional score through an appropriate steel route. A badly judged new-oak treatment can lower balance, including for Cabernet. Exact coefficients need a balance pass; the current six-point maximum is a useful ceiling to audit against, not evidence that every wine should earn six points by waiting.

Use an explicit ready window rather than the same eight-week finish line for everything. For the first implementation, a plateau plus an over-oaking consequence is enough; broad spoilage and unattended reserve deterioration would be separate gameplay decisions. Do not silently convert stored inventory into a perishable asset.

WSET describes ageworthiness in terms of flavor intensity and preservative structure, with wines having different development trajectories. That supports a varied model, but does not prescribe these game mechanics. [WSET: why age wine](https://www.wsetglobal.com/knowledge-centre/blog/2023/march/21/why-do-we-age-wine/).

## Techniques, hybrids, and blends

- Malolactic conversion and oak remain independent. Malolactic conversion changes acidity; buttery character can arise from that process. Oak should not automatically trigger it. Lees contact can happen in steel or wood. The existing techniques should inform the advice without becoming universal quality upgrades.
- Reconcile lees-aging time with maturation time. The current game schedules all techniques serially before optional aging. A first implementation may retain that scheduling abstraction, but must document it and avoid counting the same elapsed week or texture benefit twice.
- Bred varieties should inherit continuous tendencies through their full ancestry, following the existing sensory and compatibility patterns. Do not fall back to “all hybrids like oak,” or simply use the first parent.
- Preserve each blend component's actual treatment and duration. Blending a steel-aged component with an oak-aged one does not retroactively mature both in oak. Weight the resulting sensory effects by volume and prevent reblending from stacking maturation rewards.
- Keep bottle-aging potential distinct from vessel maturation. This first change should leave bottle inventory and reserve preservation as they are. Future bottle development would need its own readiness, sensory, pricing, and save rules.

## Implementation boundaries and verification

The smallest useful release adds per-batch maturation selection, neutral oak, complete grape profiles, varied readiness advice, and matching quality/tasting effects. Retain an explicit simplified cellar-capacity model for that release. Do not depict a purchased steel tank physically transforming into a wooden barrel without explaining the equipment abstraction. A later expansion can give fermentation tanks and maturation barrels separate inventories and floor space.

Preserve saved quality, tasting scores, money, tank assignments, wine quantities, and provenance. Existing oak records do not reveal barrel age or new-oak percentage; keep them as legacy French-oak treatment rather than inventing that history. Snapshot the new batch's maturation profile and version so later balance changes cannot unexpectedly reprice an existing vintage.

Required checks when implemented:

- Every catalog grape has a profile; no omissions, duplicate IDs, or silent generic fallbacks.
- Steel, neutral oak, and measured French oak each have a useful role. Ordinary fruit remains ordinary and excellent steel-aged whites remain possible.
- Riesling has a sensible neutral/steel route; Chardonnay supports two strong routes; Nebbiolo can mature slowly without accumulating strong oak flavor; Pinot Noir is not categorically penalized for measured French oak.
- Sensory notes agree with actual fermentation and maturation history, including zero additional aging and neutral oak.
- Parent crosses, multi-generation hybrids, mixed-vessel blends, partial transfers, reblending, bottling, and reloads conserve liquid and avoid stacked rewards.
- Already-saved batches retain their contracted behavior and bottled wines retain their assessed scores.
- Exercise the actual cellar before and after UI changes, including narrow layouts and keyboard controls, then run the build and simulation tests required by [AGENTS.md](../AGENTS.md).
