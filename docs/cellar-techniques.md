# Cellar techniques

Research **Cellar foundations**, then complete any of these three independent studies in **Research → Cellar techniques**. Open **Cellar → Fermentation → Cellar techniques** beneath a fresh harvest and select the treatments for that batch. All choices start off. Basic steel and oak fermentation remain available immediately.

| Technique               | Study cash | Knowledge | Study weeks | Processing cost | Extra tank weeks | Game style effect                     |
| ----------------------- | ---------: | --------: | ----------: | --------------: | ---------------: | ------------------------------------- |
| Skin contact            |     $2,800 |        55 |           8 |    $40 per tank |                1 | More body and tannin                  |
| Malolactic fermentation |     $6,500 |        85 |          10 |    $60 per tank |                2 | Softer acidity and a rounder body     |
| Lees aging              |    $10,000 |       120 |          12 |    $50 per tank |                3 | Fuller texture and bread-dough aromas |

Study prices are separate from processing. The operating research lab accelerates these studies using the normal study rules, but does not accelerate wine production. The full processing charge is paid when fermentation starts: $140 per steel tank or $320 per oak tank, plus each selected treatment's cost per tank actually filled. Choices are fixed for that batch.

Base fermentation takes two game weeks. The selected extra steps follow in the table's order, automatically. Taking all three produces an eight-week cellar plan. Tanks remain occupied until that plan finishes; wine cannot move to reserves or begin further aging early. The tank status and journal show the current step. New batches then offer separate steel, neutral-oak, or French-oak [maturation](aging.md), with grape-specific readiness windows. Its clock starts at zero. Skin contact, malolactic conversion, and lees inform the lot's readiness and oak tolerance without counting their elapsed weeks again or adding a direct quality bonus. This serial schedule is a game abstraction; actual cellar techniques can overlap.

A 538 kg harvest with two free 150 L tanks can start 300 L with all three treatments for $580 in steel. It leaves 109 kg (76 L) with the harvest's original quality, origin, and spoilage deadline. Selecting treatments does not rescue the unprocessed remainder. A later batch can use different choices.

## Character and blending

Each reserve component retains its completed treatments alongside its grape, vintage, origin, quality, and maturation history. Blending or partial bottling preserves that history. Sensory effects are weighted by the treated volume: a trace addition cannot give the entire blend the full treatment effect. Tasting notes list each technique and the percentage of wine that received it. Bottling freezes those notes with the release.

The current model adds 0.35 body and 0.75 tannin for skin contact, subtracts 1 acidity and adds 0.25 body for malolactic fermentation, and adds 0.5 body plus a weighted bread-dough aroma for lees aging. These are descriptive game units used by the existing light/medium/full and acidity/tannin thresholds, not chemical measurements. Grape color categories remain red or white; this release does not introduce a separate amber-wine product category.

The real techniques inform these broad tendencies: white-grape [skin contact](https://www.awri.com.au/industry_support/winemaking_resources/winemaking-practices/winemaking-treatment-skin-contact/) extracts flavor and phenolics, affecting body and astringency. [Malolactic fermentation](https://www.awri.com.au/files/attachment/mlf_modulation_awri_fact_sheet/) converts malic acid to lactic acid and can change texture and aroma; buttery flavor is not assumed for every wine. [Lees contact](https://www.awri.com.au/industry_support/winemaking_resources/winemaking-practices/winemaking-treatment-lees-contact/) can contribute yeast-derived character and mouthfeel. Results in real cellars depend on the fruit, microbes, temperature, and handling. This game deliberately compresses time and uses predictable effects; costs and durations above are game balance choices.

## Buyer preferences

The Wine shop shows a repeating four-year cycle: fruit-forward, round/textured, skin-contact, then oak-influenced wines. Each preference lasts 12 weekly sales; its remaining weeks and successor are visible before release. Fermentation and maturation histories assign proportional appeal: malolactic and lees favor rounded styles, neutral oak adds texture, skin contact favors structure, and French oak favors wood influence. Untreated wine retains fruit-forward appeal. Combining treatments divides appeal instead of granting every benefit at once; blend effects follow the actual treated volume.

The matching share adjusts retail demand from −15% to +45%, averaging no bonus across a complete 48-week cycle. It does not change quality, tasting snapshots, chosen prices, wholesale prices, or wine aging. Costs and tank time remain real tradeoffs. The forecast includes this factor, and weekly sales use the same factor with the existing customer pools and market variation.

## Persistence and verification

Version-six saves gain optional `techniques` arrays on active batches and wine components, and optional technique descriptions in tasting snapshots. Existing saves, in-flight fermentations (including old three-week batches), and old tasting notes remain valid. An absent field means no recorded treatment; learning a technique never retroactively applies it. New actions reject unknown or duplicate techniques, unpaid research, and insufficient cash before consuming grapes or tanks. Imports reject malformed treatment arrays and impossible batch progress.

Implementation: [cellarTechniques.ts](../src/cellarTechniques.ts), [game.ts](../src/game.ts), [GrapeArrival.tsx](../src/GrapeArrival.tsx), [wineSensory.ts](../src/wineSensory.ts), and [winemaking.ts](../src/winemaking.ts). Behavior coverage is in [cellar-techniques.test.ts](../tests/cellar-techniques.test.ts): research gates, all eight recipe combinations, exact charges and timing, partial harvests, old-save compatibility, blend proportions, and stable bottled notes.
