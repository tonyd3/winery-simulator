---
name: playtest-terroir
description: Playtest Terroir through the real browser UI, from a fresh or existing save through wine production, sales, and regional expansion. Use for gameplay reviews, repeat playthroughs, and checking bugs, usability, mechanics, or balance. Produce evidence-backed findings; implement fixes only within the user's requested scope.
---

# Playtest Terroir

Play as a winery owner and report what made progress confusing, repetitive, unreliable, or economically unconvincing. Use the current checkout and actual player controls. The default deliverable is a numbered findings list, not code changes.

## Establish the run

- Read the root `AGENTS.md`, `README.md`, and relevant current feature documentation. Resolve repository paths from the checkout root; this skill lives at `.agents/skills/playtest-terroir/`. Historical balance figures and old validation reports are context, not the current specification.
- Record the branch, commit, working changes, tested URL, and starting save/date. Verify which checkout an existing development server serves. A live page at a familiar port is not evidence that it contains the user's latest pull. Preserve unrelated work and running servers.
- Use the repository's setup commands. Install dependencies if needed. Start Vite on an available port with `npm run dev -- --host 127.0.0.1 --port <port> --strictPort`, then verify the actual page. Keep the server available for the user after the run.
- Follow the requested starting point. Continue an existing playthrough when requested; use a separate test origin for a fresh game when another save must be preserved. Saves belong to the exact browser origin: changing `localhost` to `127.0.0.1`, or changing ports, changes the save. Avoid multiple actively playing tabs on the same origin.
- Export a checkpoint through **Save & settings → Export save** before replacing a save or testing import/reset behavior. Use the supported import flow to move it. If file automation fails, preserve the current save and use a fresh isolated origin or continue the authorized save as appropriate; disclose the coverage difference. Do not silently clear browser storage.
- State the intended endpoint and use the user's scope. For a regional-expansion run, success means owning a second winery in a different region, growing and harvesting its grapes, producing and selling its wine, and verifying that both estates and their wine history survive reload. Purchasing the property alone is an intermediate milestone. This is a continuing tycoon game; do not invent an end screen or equate one expansion with exhaustive late-game coverage.

## Play through the UI

Use the available interactive browser tooling according to its current documentation. Take fresh UI snapshots at decisions and after lists change; identify lots by visible estate, parcel, grape, vintage, and quantity rather than stale row positions.

Advance with **Next week** around deadlines. Read and acknowledge estate updates, then reassess before advancing again. Small batches of clicks are useful only while no harvest, spoilage, maturation, or cash decision is due. Automatic speeds are appropriate for observed idle intervals; tab changes pause time and there is no offline simulation. Finish paused at a useful checkpoint.

Do not give the playthrough cash, research, land, stock, or calendar progress by editing saves, browser storage, internal application state, or invoking simulation actions outside the UI. Code inspection, exported-save analysis, and engine tests can diagnose an observed problem. Label constructed saves, component fixtures, and accelerated simulations separately; they cannot prove that progression was earned or usable through the UI.

Keep a compact checkpoint log at the first sale, season boundaries, major investments, regional acquisition, and the final state. Record game year/week, cash, recurring upkeep, estates/land, relevant stock and capacity, and the decision taken. Add research progress, quality, sales, and real elapsed time when needed to explain a finding. Do not transcribe every click.

## The production-to-expansion journey

1. **Complete the first vintage.** Inspect the ready parcel, soil/climate fit, ripeness, health, and harvest forecast. Tend and harvest, then review fresh-lot identity, spoilage deadline, fermentation cost, and tank requirements. Ferment what fits, choose a maturation route, release into reserves, and confirm tanks become available. Bottle into a wine line, set price and shelf space, list it, advance a sales week, and reconcile bottles and cash against the Journal.
2. **Build a repeatable business.** Play subsequent seasons while balancing fruit, tank occupancy, reserves, bottling kits, warehouse space, and shelves. In the current calendar, each year has 12 weeks and winter begins at week 10; verify current rules before relying on these deadlines. Watch all planted parcels before winter, including those in inactive estates. Use research and investments that serve the expansion goal, checking prerequisite, study, purchase, and recurring costs separately. Observe whether the player has meaningful choices while saving for expansion.
3. **Compare expansion choices.** Inspect plot enlargement, additional parcels, vineyard districts, and regional estates in **Build → Land & estates** or **Expand your holdings**. Compare purchase price with vines, capacity, and additional upkeep. Buy what supports the goal; an expensive district is not a mandatory detour to a second region. Check current previews and actual deductions rather than carrying forward a past run's prices.
4. **Establish a second regional winery.** Acquire it through the holdings flow, not **Start a new game**. Select and name the estate, inspect its actual regional soils and climate, and plant suitable available grapes. A regional acquisition does not automatically teach its founding grapes: inspect the grape library and research any needed variety. Equipment, research, funds, reserves, wine lines, and time are shared across estates; verify this while switching between them. Check that the original estate continues growing and producing.
5. **Sell the second region's first wine.** Follow its harvest through fermentation, maturation, reserves, bottling, listing, and actual sales. Distinguish same-grape lots from different parcels and verify the source breakdown wherever the tested build records it. Check an existing wine line's next release and its retained history. If blending is in scope and unlocked, compare source shares and quality before and after a blend; cross-estate and cross-vintage recipes have their own research gates.
6. **Verify persistence and leave a checkpoint.** Reload after a meaningful transaction. Check both estates, date, money, active production/research, inventory, wine scores, and source history. Inspect browser errors after a clean reload, not only during hot reload. Export the ending save when supported, preserve the starting export, and report the paused date and live URL.

A targeted regression run can enter at the relevant stage. State which earlier stages came from an existing save. If a blocker or user limit prevents the requested endpoint, report the furthest verified milestone and what remains; do not use synthetic progression to claim completion.

## What to look for while playing

| Area | Useful probes |
| --- | --- |
| Bugs and state | Deductions match previews; rejected actions leave state intact; transfers free tanks; processing and bottling conserve quantities; buying or switching regions preserves existing assets; reload retains recorded results. |
| Usability | The next useful action is discoverable; disabled controls explain what is missing; repeated harvest/production work does not require excessive scrolling or reopening panels; lots with the same grape remain distinguishable; alerts identify the affected estate. |
| Mechanics | Partial fermentation keeps the remaining fruit's deadline; maturation recommendations and release timing agree; research unlocks the advertised action; replacement vines do not create another harvest in the same year; warehouse capacity and shop shelf allocation are understandable. |
| Balance | Track complete vintages, seasonal cash flow, time to afford expansion, and working capital after buying it. Compare recurring costs with actual income, especially after adding hectares, parcels, districts, estates, or agriculture programs. Look for dominant choices, idle stretches, traps, and inexpensive actions that repeatedly erase meaningful costs. |
| Wine and market | Compare forecast with actual quality and sales across multiple observations. Check blending proportions, price versus demand, shelf limits, promotions, wholesale tradeoffs, and release history. Separate revenue, production margin, and net cash after upkeep. A single weak vintage or unusual sales week is not enough to establish a balance defect. |
| Interaction and edge cases | Where supported, test Space harvesting on the selected ripe parcel, one action per press, and normal behavior in text fields/dialogs. Exercise fractional reserve leftovers and available sell/dump controls. Inspect the relevant flow at a measured narrow CSS viewport, such as 390 × 844, for overflow, hidden actions, and readable labels. |

Use these as probes for the requested journey, not a requirement to purchase every feature or complete every research branch. If an action loses fruit, money, or wine, distinguish a legitimate tradeoff from an unclear warning or a broken rule. Demonstrate an economic exploit on a disposable test save or with a focused engine test once the player-facing trigger is established.

## Evidence and diagnosis

- Capture the exact state, action, expected result, actual result, and player impact for a finding. Preserve a reproducible save checkpoint and inspected screenshot where they help. Keep screenshots, exported saves, logs, and temporary fixtures in a task artifact directory outside the product source tree.
- Classify evidence as **observed in the UI**, **reproduced in a focused check**, or **hypothesis/design suggestion**. Browser-tool failures, unavailable file pickers, and transient tooling errors are not game bugs. Check the actual result before treating a tool timeout as an application failure.
- Reproduce suspected bugs from the same state where practical. Then trace the current implementation: `src/App.tsx` handles time and persistence; `src/game.ts` handles actions and save validation; `src/estates.ts`, `src/investments.ts`, and `src/winemaking.ts` cover expansion, running costs, and production. Use the README code map and feature tests for the remaining paths. Do not infer a root cause solely from a screenshot.
- For balance claims, record the policy played and sample size: prices, investments, harvest timing, vintages observed, and time to the milestone. Explain the evidence for the proposed change and its likely tradeoff. A continuation from a rich save cannot measure the fresh-game acquisition grind.
- Inspect every screenshot you rely on. For an authorized UI fix, capture an authentic before state before editing, then repeat the same scenario, save, viewport, and interaction state afterward. Label component fixtures and after-only evidence honestly. Publish PR images only through a supported upload path; if unavailable, retain local artifacts and state the limitation.

## Deliver the findings and handle follow-ups

Lead with what was actually played: starting and ending dates, regions, key milestones, and whether the requested endpoint was reached. Then provide a prioritized numbered list. Each finding should contain a short title, category/severity, concrete reproduction or observation, player impact, and a proposed improvement. Include useful numbers and evidence links without dumping the entire action log.

Keep confirmed bugs separate from tuning suggestions and unresolved hypotheses. Mention important checks that passed and material gaps, such as untested research branches, mobile screens, or export/import. Do not describe the whole game as verified from one regional journey.

Preserve finding numbers when the user selects follow-up work. Resolve references such as “4 only” against the relevant report, and honor explicit ignore/accept decisions. Reviewing the game does not authorize implementing every suggestion or opening PRs. When fixes are requested, carry out the selected scope; create one PR per finding only when that is the requested delivery format.

For an authorized fix, add a focused regression test where behavior warrants it, run `npm test` for game logic and `npm run build` for code/CSS, and replay the failing UI interaction. Follow the root style guide for UI or player-facing copy changes. Keep unrelated findings out of the patch. Report the verified outcome, remaining limits, and any requested PR links.
