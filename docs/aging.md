# Maturation

New fermentations offer three independent maturation routes after fermentation and any selected cellar techniques finish. Each finished batch can move straight to reserves or start a plan of 1–12 whole game weeks. Fermentation in oak does not lock the later vessel choice.

| Vessel | One-time charge per reserved tank | Purpose |
| --- | --- | --- |
| Stainless steel | $0 | Preserve fruit and freshness; no added wood flavor |
| Neutral oak | $80 | Develop texture with little wood flavor |
| French oak | $180 | Add wood character, with a penalty for excessive exposure |

Charges apply to every tank assigned to the batch, including partially filled tanks. Wood plans include barrel service and keep the same cellar capacity reserved. They do not replace owned tanks or create a separate barrel inventory. Moving the batch to reserves releases all its tanks and preserves every milliliter.

Maturation service is an operating expense in the estate accounts and joins the batch's recorded production cost. That cost follows the wine through reserve transfer, blending, and partial bottling. If an older batch's earlier costs are unknown, its total production cost remains unknown rather than reporting barrel service as the whole cost.

## Choosing a release

The cellar shows grape advice, a suggested release window, and separate readiness and oak-influence messages. It defaults to the profile's preferred vessel and earliest ready week. All three vessels remain available for every grape. Changing one batch's settings leaves other batches alone.

The plan's automatic-transfer option defaults on in the UI. At its selected week, it transfers the whole batch through the same validation as manual transfer. If all 256 reserve spaces are occupied, wine stays in the cellar, the journal explains the problem, and automatic transfer turns off. Free a reserve space and transfer manually; maturation continues while waiting, up to the 12-week simulation limit. Without automatic transfer, the duration is a forecast, not a command to stop aging.

The release window is advice. Quality gains plateau at the first ready week; passing the window does not cause generic spoilage. Excessive French-oak exposure can still lower balance. Neither reserves nor bottled inventory develops or deteriorates with calendar time in this release.

## Grape and lot profiles

[maturation.ts](../src/maturation.ts) explicitly defines all 64 catalog grapes. Each has steel and wood development times, steel and French-oak gain ceilings, oak tolerance, a preferred vessel, and style advice. Examples without additional techniques:

- Chardonnay offers a one-week steel route or a three-week wood route, each capable of the full six-point gain.
- Riesling favors steel, with neutral oak available for texture. Its low tolerance makes long French-oak plans risky.
- Pinot Noir defaults to neutral oak and also supports measured French oak.
- Cabernet Sauvignon takes five weeks to develop in wood; its higher oak tolerance still has a limit.
- Nebbiolo takes five weeks in neutral oak without accumulating vanilla or toast.

The expanded catalog's 18 Italian and French grapes also have explicit profiles. These are game defaults for still wines; all three vessels remain available. Times below are the first ready week before technique adjustments, not real-world maturation requirements.

| Grape | Default vessel | Steel / wood weeks |
| --- | --- | --- |
| Aglianico | Neutral oak | 3 / 5 |
| Sagrantino | Neutral oak | 3 / 5 |
| Corvina | Steel | 1 / 3 |
| Montepulciano | Neutral oak | 2 / 4 |
| Nero d’Avola | Neutral oak | 2 / 3 |
| Dolcetto | Steel | 1 / 2 |
| Fiano | Neutral oak | 2 / 3 |
| Verdicchio | Steel | 1 / 3 |
| Garganega | Steel | 1 / 2 |
| Arneis | Steel | 1 / 2 |
| Tannat | French oak | 3 / 5 |
| Carignan | Neutral oak | 2 / 4 |
| Cinsault / Cinsaut | Steel | 1 / 2 |
| Pinot Meunier | Neutral oak | 1 / 2 |
| Savagnin | Neutral oak | 2 / 4 |
| Melon de Bourgogne | Steel | 1 / 2 |
| Clairette | Steel | 1 / 2 |
| Grenache Blanc | Neutral oak | 2 / 3 |

These choices extend the character profiles and sources in the [grape library](grape-library.md). For example, the [Montefalco consortium](https://www.consorziomontefalco.it/montefalco-sagrantino-docg/) describes Sagrantino's intensity and need for cellar development; the [Langhe consortium](https://www.langhevini.it/en/i-vitigni-del-territorio/dolcetto/) describes both young and longer-lived Dolcetto styles. The numeric routes are design judgments. Savagnin does not acquire oxidative flavors from wood alone, Corvina does not automatically become a dried-grape wine, and Meunier stays within the existing still-wine model.

Bred varieties recursively average both parents' numeric tendencies through their full ancestry. Parent order has no effect. Matching parental vessel preferences are retained; differing preferences default to neutral oak with advice explaining the inherited profile.

All routes are snapshotted when fermentation starts, using the source estate's region, original fruit quality, and selected techniques. Later estate selection or profile-table edits do not change that batch's saved routes.

The current lot adjustments are deliberately small game coefficients:

- Wood development starts from the grape's time. Skin contact adds one week; malolactic conversion removes one when baseline tannin is at least 3; lees removes one when baseline tannin is below 1. Round and clamp development time to 1–8 weeks. Steel uses the grape's steel time.
- Steel's window extends one week beyond readiness. Wood extends two weeks, or three when baseline tannin is at least 4 or region/MLF-adjusted acidity is at least 4.5. Windows end no later than week 10.
- Oak tolerance starts from the grape's value, adds 0.4 times the regional/technique body adjustment, then adds 0.025 times fruit quality minus 80. Round to two decimals and clamp to 1–10. Thus weak fruit tolerates less wood; this does not repair its source quality.
- Neutral oak has a six-point gain ceiling. Steel and French oak use the grape's individual ceiling, all at most six. For elapsed maturation `age`, gain is `ceiling × sqrt(min(age, readyFrom) / readyFrom)`.
- Oak exposure is French-oak maturation weeks plus 1.5 units if fermentation used oak. Steel and neutral oak add no exposure. The balance penalty is `min(8, max(0, exposure − tolerance) × 1.5)`.
- Batch quality adds gain minus penalty to its fermentation quality, rounds, and clamps to 0–100. The existing temperature-control benefit remains separate. There is no additional technique quality bonus.

Technique time remains serial before optional maturation, whose clock begins at zero. The same week is never counted as both technique time and maturation time. Texture effects are applied once by the sensory model. These compressed schedules and coefficients are game rules, not real-world cellar calendars or appellation requirements. The [approved design and research](aging-design.md) explains the stylistic basis and alternatives.

## History and older saves

Save version 6 accepts the new optional fields. New batches use `agingProfile: 'varietal-v1'`, a version-one `maturationProfile`, and a `maturationPlan` while aging. Validation requires complete, ordered route windows and valid vessel/duration combinations. They wait at zero maturation until the player chooses a plan, so the automatic-aging change on `main` cannot silently pick or charge for their vessel. Existing batches retain their prior eight-week curve, including the earlier pre-rebalance curve where applicable, and follow `main`'s automatic aging after fermentation. An old ready batch starts on the next weekly turn, without retroactive aging. Completion, readiness, and automatic-transfer results use the estate's important-event feed.

New reserve components record fermentation separately from a version-one maturation history, including vessel, actual weeks, and whether oak was dominant. Immediate transfer records zero maturation weeks. Recorded harvest ripeness, vine health, and sunshine also survive transfer and remain available to the vintage-dependent tasting model. Legacy maturation records retain their previous wood interpretation. Missing history is marked unrecorded rather than inferred from a wine's name.

Blends and partial bottling preserve each component's treatment history and exact volume. Reblending does not award maturation gains again. Bottled tasting snapshots, recorded quality and tasting scores, money, supplies, vintages, origins, and old tank assignments stay intact. See [tasting notes](tasting-notes.md) for weighted flavor descriptions.

## Implementation and verification

- [maturation.ts](../src/maturation.ts): profiles, ancestry, lot snapshots, exposure, and costs.
- [BatchMaturation.tsx](../src/BatchMaturation.tsx): per-batch controls and progress.
- [game.ts](../src/game.ts): charges, elapsed time, quality, transfers, and validation.
- [grapeCharacter.ts](../src/grapeCharacter.ts) and [wineSensory.ts](../src/wineSensory.ts): shared character and recorded flavor effects.
- [maturation.test.ts](../tests/maturation.test.ts): all grapes and regions, exceptional steel wines, poor fruit, oak penalties, exact costs, capacity failures and recovery, simultaneous transfers, technique timing, ancestry, partial volumes, and save compatibility.
