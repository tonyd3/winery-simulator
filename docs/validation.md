# Validation · September 7, 2026

## Initial release automated checks

`npm test`: 18 tests pass. Coverage includes the complete production-to-sales economy, immutable failure handling, annual harvesting, winter/spring transitions, grape spoilage, tank occupancy, capped aging, supply delivery, retail/wholesale pricing, one-time rewards, soil suitability, upgrades, malformed nested saves, deterministic save continuation, low-cash recovery, 100 years of game time, loan repayment, and exact volume conversion.

`npm run build`: strict TypeScript checks and Vite production build.

## Initial release browser journeys

- Desktop: tended South slope, harvested Merlot, chose oak, fermented for two weeks, aged for one week, bottled the wine, listed it, and advanced a week. The shop sold 24 bottles for $720; funds and remaining bottles matched the result after a browser reload.
- A one-liter floating-point conversion issue found during that journey was corrected; the dedicated regression test now verifies 360 kg yields 252 L and 336 bottles.
- Mobile: selected the orchard parcel, planted Pinot Noir, and built the tasting terrace. Verified the new planted state, purchased upgrade, and deducted funds.
- Invalid JSON save: import was rejected with an error and the existing $8,740 estate remained unchanged.
- Valid save: imported “Save Test Estate” with $11,650 and a planted Pinot Noir parcel; reloading preserved all three distinguishing values.
- File export in Chrome: the downloaded `terroir-year-1-week-6.json` was read, validated, and compared to the complete expected game state. Exact equality passed. Browser-tool download-event waiting was unavailable, so the actual downloaded file provided the evidence.
- Desktop and mobile layouts were visually inspected. Interactive parcels, production stages, disabled actions, resource counters, and navigation were checked in the real application. Console inspection returned no application errors.
- The embedded browser's viewport honors its existing zoom; DOM measurements were used to verify approximately 1440×900 desktop and 390×844 mobile CSS viewports, rather than assuming screenshot pixels equal CSS pixels.

## Initial release visual evidence scope

The workspace was empty before implementation: no source, route, existing app, git commit, or baseline UI existed. Authentic “before” screenshots are therefore unavailable. Live screenshots of the new estate and mobile inspector were inspected during implementation. No pull request was requested or created.

## Remaining limits

This is a single-device browser-save prototype. Public hosting, cloud sync, comprehensive accessibility auditing, and Safari/Firefox release certification are outside this validation. JSON file export is verified in Chrome; embedded browser download support depends on the host application.

## Region, research, and breeding expansion

`npm test`: **31 tests pass** after the expansion. New coverage exercises all eight regional starts; each region's first wine; nonregional planting and climate differences; independent soil bonuses; research costs, prerequisites, exclusivity, and timing; knowledge rewards; both grape collections; climate adaptation; breeding eligibility and tradeoffs; saved random outcomes; multi-generation lineages; a custom grape's full production cycle; safe replanting; version-one migration; and rejection of broken projects or grape references. The preexisting soil test now holds grape traits constant while changing only the parcel soil, because climate is also part of quality.

`npm run build`: TypeScript and Vite pass. The expanded production JavaScript bundle is approximately 368 kB (110 kB gzip).

A separate test origin, `localhost:5174`, kept the user's `localhost:5173` estate intact during gameplay QA:

1. Randomized the region preview, reloaded before starting, and confirmed the picker remained available without creating a save.
2. Started Riverstone Estate in Mosel with Riesling and Pinot Noir, $12,500, and slate/gravel/chalk parcel soils.
3. Started Vine science, harvested and fermented Riesling while research ran, and bottled 308 bottles. Harvest and bottling rewards funded further research knowledge.
4. Completed Cross-pollination through the normal research chain. Started a Riesling × Cabernet Sauvignon trial called River No. 1 with Regional adaptation.
5. Reloaded halfway through the trial: its name, parents, and two remaining weeks persisted.
6. Completed the trial, selected the new grape from the planting dropdown, and planted Orchard field for $925. The inherited traits were warmth 1.5, resilience 4, finesse 3, 95% yield, red color, and gravel preference.
7. Grew through winter into the next season, harvested the custom grape, fermented 185 L, and bottled 246 bottles at 89 quality. Listing at $29 sold 24 bottles for $696 the next week; 222 remained.
8. Exported the actual browser save, parsed it with the production deserializer, and confirmed the custom grape, parent IDs, research, inventory, and sales stats. Imported the original version-one fixture in the browser, observed the original $12,500 estate and vines, then reimported the exported version-two estate. The searchable grape library showed River No. 1 with its correct lineage after restoration.
9. Checked mobile region selection, region details, estate naming, research navigation, and nursery controls. DOM measurements confirmed 390×844 CSS pixels in Chrome and approximately 389×843 in the in-app browser, without horizontal overflow. Chrome's file-chooser automation rejected file injection; the real import flow was verified in the in-app browser instead.

Authentic baseline screenshots for the existing estate, empty-parcel grape selector, and save settings were captured before editing source. The matching after screenshots use the same original estate and browser viewport. Region selection, research, and breeding are new screens with no prior counterpart. Evidence and the exported test estate are retained under `/private/tmp/terroir-regions-qa/`. No pull request exists, so no screenshots were published externally.

## Reserves, blending, and wine lines

`npm test`: **42 tests pass**. Eleven new tests cover reserve transfers, storage across years, partial cross-varietal/cross-vintage blends, nested blend quality, milliliter conservation, atomic failures, inherited line designs, sold-out release history, deterministic tasting variation, partial-bottling research rewards, version-two bottle migration, malformed recipes and references, and the 2 MB archive boundary. Existing production tests now follow fermentation → reserves → bottling.

`npm run build`: TypeScript and Vite pass; approximately 393 kB JavaScript (118 kB gzip).

Browser verification used `localhost:5174`, keeping the user's `localhost:5173` estate unchanged:

1. Imported a deliberately constructed version-two fixture, “Domaine Héritage”: Year 2/week 8, $25,000, 210 L aged Merlot from Year 1, 150 L Cabernet Sauvignon from Year 2, and 80 existing Founders Cuvée bottles rated 90. The importer preserved the old bottles, price, score, and label, and gave them a wine line. Unknown original production quantities are displayed as unrecorded.
2. Moved both wines into reserves through the UI. Both fermentation tanks became available; total wine stayed at 360 L.
3. Blended 90 L Merlot and 60 L Cabernet into Solstice Reserve. The preview showed 60/40 provenance, weighted quality 82.4, a +2 balance bonus, and an estimated 81–87 point tasting. The original reserves retained 120 L and 90 L.
4. Bottled 100 bottles into a new Solstice line using a heritage crest, rounded bottle, and ochre accent. The animation was observed at 26 points while tasting and then 81 points at completion. 75 L remained in the blend, 100 kits were consumed, and all information survived a reload.
5. Listed release 1 and advanced a week. 24 bottles sold at $27; $648 sales less $160 upkeep changed cash from $25,000 to $25,488. 76 bottles remained.
6. Created a second recipe using 30 L Merlot and 60 L Cabernet. Selected the existing Solstice line; its label, shape, color, and Year 2 founding date were inherited. Bottled 120 bottles as release 2. The animation was observed at 28 points and finished at 86. The line archive showed both independent scores, stock counts, and recipe percentages.
7. At a measured 389×843 CSS viewport in the in-app browser, bottled the remaining 75 L of the first blend into Solstice release 3. Its score stayed at 81. No horizontal overflow; the reveal dialog's bounds fit inside the viewport. In-app screenshot capture had scaling/cropping artifacts at this small viewport, so Chrome supplied additional visual evidence.
8. In Chrome, used the existing separate QA estate “Highland Estate” to harvest Malbec, ferment, and store 243 L through gameplay. At a measured 390×844 CSS viewport, selected the modern label, slender bottle, and ink accent; bottled 324 bottles into Highland Reserve. The mobile designer and 94-point reveal were visually inspected. No horizontal overflow and no application console errors. Temporary viewport overrides were reset and the Chrome QA tab was closed.
9. Read the main game after the change: its original Domaine Bellevue estate, $12,500, Year 1/week 6, and original vines remained intact, with v0.3 UI loaded.

Authentic inspected desktop before/after pairs for the cellar, wine shop, guide, and research knowledge text use the same version-two fixture, origin, browser viewport, and paused date. New blending, label-design, release-reveal, and line-history screens have no prior counterpart. Original captures, fixture, scenario notes, and a prepared PR-comment template are in `/private/tmp/terroir-blending-qa/`. No git repository or pull request exists here; no evidence was published externally.

## Milestones without cash bonuses

`npm test`: **44 tests pass**. Milestones now derive completion automatically from estate progress or previously recorded legacy achievements; payout values and the claim action have been removed. Regression checks verify a first harvest deducts only its $180 cost, produces no bonus ledger entry or revenue, and advances the next milestone without claiming. Removed claim requests are rejected. Completed progress survives save/load, and historical balances and milestone ledger entries in older saves are preserved.

`npm run build`: TypeScript and Vite pass. The estate, journal, and guide were inspected in the browser using the existing paused Domaine Bellevue estate (Year 1/week 6, $12,500). There are no milestone reward amounts or claim buttons; journal entries display In progress or Completed. No gameplay actions were performed against the user's estate, and no browser application errors were reported.

Matched before/after screenshots at the unchanged 1288×1339 capture size are retained in `/private/tmp/terroir-milestones-qa/`, along with scenario notes and an unposted PR-comment template. No git repository or pull request exists in this workspace.

## Wine history and bottle sales

`npm test`: **46 tests pass**. New coverage reconciles per-release and estate sales through retail, wholesale, reload, and repeated-sale rejection while keeping sold-out releases. Existing version-three saves recover exact sales from recorded production and stock. Older releases with unknown production track subsequent retail and wholesale sales as incomplete totals; legacy estate totals remain unchanged. Invalid tracking counts are rejected during save validation.

`npm run build`: TypeScript and Vite pass.

Browser checks on the separate `localhost:5174` test origin:

- Opened Wine shop → Wine history and confirmed four archived releases, 24 lifetime bottles sold, and 376 bottles in stock. Solstice release 1 showed 100 produced, 24 sold, 76 remaining; its other releases retained independent counts and scores.
- Advanced one week: 25 retail sales brought that release to 49 sold and 51 remaining. Sold the remainder wholesale: it stayed in history with 100 sold and zero remaining, and disappeared from Current wines.
- Listed the legacy Founders Cuvée and advanced a week. Its previously unknown sales became 25+ with 55 remaining. Reload preserved those counts and the estate total of 125. Expanded the sold-out Solstice release and verified its 60% Merlot / 40% Cabernet recipe and original bottling date.
- Sold the remaining stock wholesale. Current wines displayed its sold-out state and a working View wine history action. All four releases remained archived: 400 estate lifetime sales, zero stock, Solstice 320 sold, Founders Cuvée 80+ sold.
- In Chrome at a measured 390×844 CSS viewport, inspected Highland Reserve's archive, production/sales/remaining counts, and expanded recipe. Document width was 390 pixels and the release stayed within the viewport. No application console errors. Temporary viewport settings were reset and test tabs closed.
- Opened Wine history in the main game and verified its empty archive, unchanged Domaine Bellevue estate, $12,500, and Year 1/week 6. No gameplay actions were performed against the user's save.

Inspected before/after screenshots of the shop and cellar line archive use the same paused Domaine Héritage save and 1910×1075 capture size. These are in `/private/tmp/terroir-history-qa/`, alongside mobile evidence, logs, scenario notes, and an unposted PR-comment template. The new Wine history navigation has no prior counterpart. The in-app browser's full-page capture includes scaling artifacts and is supplementary only; viewport captures provide visual proof. No pull request was requested or created.

## Blend name generator

Added a Generate button beside Name this blend, with eight suggestions for each wine region. Consecutive clicks exclude the current name, and suggestions remain editable. Generating a name only updates the draft field and does not submit the blend or advance the simulation.

`npm test`: **46 tests pass**. `npm run build`: TypeScript and Vite pass. In the isolated `localhost:5174` estate, generated Le Grand Accord and then Cuvée du Soir with unchanged reserve stock and a disabled Create button until valid lots were selected. With 1 L from each of two lots, generated Le Fil Rouge, edited it to Le Fil Rouge No. 1, and created the blend. Reload preserved the edited name and the full 120 L total across three lots. No application console errors.

Matched, inspected before/after captures use the same paused estate, empty draft, unselected lots, and 1910×1075 viewport. Evidence, logs, and an unposted comment template are in `/private/tmp/terroir-blend-names-qa/`. The generated-name image is a separate interaction capture. No pull request exists; no screenshots were published externally. The main estate was not used for gameplay QA.

## Marketing campaigns and independent judging

`npm test`: **54 tests pass**. Eight new scenarios cover paid marketing and judging, immutable rejection of duplicate/invalid/unaffordable actions, unchanged production and chosen shelf prices, four-week campaign expiry and renewal, unlisted and sold-out countdown behavior, permanent medal thresholds, combined demand bonuses, medal-adjusted wholesale proceeds, failure to win a medal, saved judging outcomes, separate original/panel scores, new-release independence, and backward-compatible save defaults. Malformed nested promotion state is rejected.

`npm run build`: TypeScript and Vite pass. Production JavaScript is approximately 402 kB (121 kB gzip).

Browser journey in the separate Chrome `localhost:5174` Highland Estate save:

1. Began paused at Year 1/week 8, $11,860, with 324 unlisted Highland Reserve bottles rated 94. Marketing was disabled with a reason to list the wine first. Costs and effects were visible on the wine card.
2. Sent the release for judging ($180), listed it, and started marketing ($240). Funds became $11,440 and stock stayed at 324. The suggested price rose from $30 to $32. Clicking the suggestion set the shelf price to $32; the displayed forecast was 34 bottles per week.
3. Reloaded with both actions pending. The $32 shelf price, four campaign weeks, and two judging weeks persisted. The first advance sold 34 bottles and left three campaign weeks and one judging week.
4. Reloaded again and advanced. Judging awarded Gold with a 96-point panel score, while the original bottle rating remained 94. The campaign had two weeks left; 240 bottles remained, with 84 sold and $13,808 in funds. Suggested price was $38, and applying it forecast 44 bottles per week.
5. Advanced twice more. Campaign availability returned after exactly four boosted sales weeks; the medal stayed. The save contained 175 sold, 149 remaining, and $16,946. Suggested price was $37 with the permanent medal and current reputation, excluding the expired campaign. The player's $38 shelf price remained unchanged.
6. Inspected promotion controls, medal rewards, and expanded wine history at a measured 390×844 CSS viewport. Document width was 390, with no horizontal overflow. Restored the 1440×1500 desktop CSS viewport, reloaded, and verified the Gold medal, 96 panel points, original 94 rating, and stock/sales totals in history. No application console errors.

Authentic inspected before/after screenshots for the shop and unjudged archives were captured using the same paused starting save and 1440×1500 CSS viewport before gameplay. Judged-result and mobile screenshots show later game states and are supplementary, not matched data. The distributor explanation was clarified after the initial matched capture; the final shop capture records that copy with the completed gameplay state. Evidence, scenario notes, logs, and an unposted comment template are in `/private/tmp/terroir-promotion-qa/`. No git repository or pull request exists. No gameplay actions were performed against the main `localhost:5173` save.

## Blend analysis and cellar tasting

`npm test`: **60 tests pass**. Six new scenarios cover source/year aggregation, precise balance thresholds, immutable free analysis, one-time tasting costs, unchanged inventory and time, deterministic results matching normal bottling, saved scores across partial releases, rejected duplicate/invalid/unaffordable tastings, zero scores, score bounds, and reblending without inherited tasting bonuses. The existing reserve score field is reused; no save migration is needed.

`npm run build`: TypeScript and Vite pass. Production JavaScript is approximately 408 kB (122 kB gzip).

Browser verification used the separate `localhost:5174` Domaine Héritage estate:

1. Opened Analyze & score for the 2 L cross-vintage Le Fil Rouge No. 1 blend: 50% Cabernet Sauvignon from Year 2 at quality 83 and 50% Merlot from Year 1 at 82. Analysis showed weighted quality 82.5, the full +3 balance bonus, and an estimated 83–89 range. Viewing analysis left $31,959, 120 L, and the paused Year 2/week 11 unchanged.
2. Paid $60 for the tasting. The score became 87, funds became $31,899, and volume/date remained unchanged. Reloaded and reopened Tasting notes: the 87-point score persisted and the paid action was no longer offered.
3. Used the tasting dialog's Bottle this reserve action. The bottling form showed the fixed 87 points. Bottled one bottle into a new Le Fil Rouge No. 1 line; the reveal animated to 87. The lot retained 1.25 L at the same score, total reserves became 119.25 L, one kit was consumed, and cash stayed at $31,899.
4. Selected 89 L Merlot and 29 L Cabernet at the blending bench. Analysis showed 75.4% Merlot, a +1 bonus, an 80–86 range, and advice to keep every grape at 66.6% or less for the next balance point. Reducing Merlot to 29 L gave a 50/50 draft, +3 balance, and an 83–89 range without consuming any reserves.
5. At a measured 389×843 CSS viewport, the tasting dialog, source table, and blending bench stayed within the document width of 389. The scored dialog fit between x14 and x376 and used internal vertical scrolling. Its Bottle this reserve action worked, and the bottling form could be canceled. No application console errors; the viewport override was reset. In-app screenshots at this small viewport have host scaling/cropping artifacts, so mobile evidence is limited to DOM geometry and interactions rather than a clean visual capture.

Authentic inspected reserves before/after screenshots use the same initial save, unselected lots, and 1910×1075 capture size. The selected-bench pair uses the same 89 L/29 L draft, with a small vertical scroll offset caused by the added action layout. The new tasting dialog has no prior counterpart. Tasting, recipe-advice, and bottle-result captures show subsequent interaction states. Evidence and logs are in `/private/tmp/terroir-tasting-qa/`; no pull request exists and nothing was published externally. Gameplay checks did not use the main `localhost:5173` save.

## Expanded bottle pricing

Shelf prices now accept whole dollars from $1 to $1,000 in both actions and save validation. The shop has an exact amount field, a slider with visible endpoints, and the existing demand forecast. Suggested values and the demand formula are unchanged. Existing saves retain their chosen prices.

`npm test`: **62 tests pass**. Two new scenarios check prices below the former $6 floor and above the former $50 ceiling, both new endpoints, save round trips, invalid action and import rejection, immutable state, bounded decreasing demand, and actual weekly sales/cash at the expanded prices. `npm run build`: TypeScript and Vite pass.

In Chrome on the isolated `localhost:5174` Highland Estate save, the original $38 price, 149 bottles, and $16,946 remained unchanged after loading the new controls. Setting $1,000 updated both controls and forecast zero sales; reload retained the price. Entering $1,001 failed native validity, left the saved slider at $1,000, and reverted the input on blur. The slider's Home key selected $1 and forecast 76 bottles per week. Setting $60 forecast 11; advancing once sold exactly 11 for $660. Stock became 138, lifetime sales 186, and funds $17,446 after $160 upkeep.

Authentic inspected before/after captures use the same starting save at measured desktop 1440×1500 and mobile 390×844 CSS viewports. Mobile captures follow the same keyboard focus path, with approximately 12 pixels of scroll difference from the taller controls. The mobile document width is 390 with no horizontal overflow, and the four-digit price fits. The $1,000 screenshot records a later interaction state. No application console errors. Evidence and logs remain in `/private/tmp/terroir-pricing-qa/`; no PR exists and nothing was published externally. The main `localhost:5173` estate was not used for gameplay checks.

## Scarcer exceptional wines and nonlinear value

`npm test`: **68 tests pass**. Six new scenarios exercise all regional starts, quality effects from care and ripeness, site fit, attainable exceptional Pinot, a broad classic-grape quality grid, bounded maturation, preserved legacy batches, the accelerating premium above 90, reputation effects, all quality/reputation price limits, retail demand, wholesale, and save continuity. The existing temperature-control test now expects its deliberately reduced +3 bonus. `npm run build`: TypeScript and Vite pass.

The before/after balance audit found first-harvest quality fell from 95–99 to 67–75; without temperature control, full oak maturity now reaches 73–81 instead of 100 in every region. A deliberately broad grid of eight regions, 24 classic grapes on the first parcel, four health/ripeness conditions, and seven tasting outcomes spans 23–94 even after granting full temperature control and oak maturity to all cases. Only 17 of its 5,376 combinations reach 90+. This is a regression-test grid that includes unsuitable sites and neglected vines, not a forecast of a player's chance of producing a 90-point wine. Excellent cultivation and high-finesse varieties remain viable paths to exceptional scores; breeding and blending can extend the upper range.

At 50 reputation, suggested prices before medals/marketing are $31 at 90, $38 at 91, $56 at 92, $183 at 95, $417 at 98, and $634 at 100. The premium feeds retail willingness to pay and wholesale offers without changing a player's saved shelf price or any existing wine's score. Judging continues to add medal bonuses separately.

Browser checks used the isolated Chrome `localhost:5174` Highland Estate:

1. The original 94-point Highland Reserve kept its rating, Gold medal, 96 panel score, 138 stock, $37 shelf price, and $17,446 funds. Its suggestion rose from $37 to $109 and its total wholesale offer from $3,036 to $8,970. Applying $109 survived reload; the forecast was 37 sales. Advancing sold exactly 37 for $4,033, leaving 101 bottles and $21,319 after $160 upkeep.
2. Paused that release and grew a new Malbec harvest through gameplay. At 100 health and 100 ripeness on its matching regional soil, it yielded 360 kg at quality 78. Installed temperature control (+3), fermented in oak, and began aging. After four aging weeks quality was 85; reloading retained the same stage, age, and score. At eight weeks it reached 87, then moved 252 L to reserves with an 84–90 tasting range.
3. Paid for a tasting: the new lot scored 86. Bottled 12 bottles, retaining 243 L with the same final score. This verifies that full care, equipment, and aging do not automatically produce a 90+ Malbec. The preexisting 94-point wine retains its old score.
4. Inspected the revised estate trait contribution, build description, cellar explanation, guide, and shop valuation. At a measured 390×844 CSS viewport, the premium price controls fit without horizontal overflow (document width 390).

Authentic inspected desktop before/after pairs use the same paused starting save and 1440×1500 CSS viewport for Estate, Wine shop, Cellar, Build, and Guide. Pricing/forecast differences reflect the new formula; the player's chosen price is unchanged in the matched pair. New-production and mobile-premium captures show later interaction states and are supplementary. Screenshots, balance audit JSON, and test/build logs remain under `/private/tmp/terroir-quality-qa/`. No PR exists and no evidence was published externally. The main `localhost:5173` save was not used for gameplay.

## Release demand over time

Retail demand now uses an exponential age multiplier from each release's saved bottling date: 100% initially, 60% after six game weeks, 40% after twelve, 25% after twenty-four, approaching 20%. The weekly transition uses the start-of-week age so its sales agree with the shop forecast; judging that resolves during that transition still applies before sales. Stock limits, pricing, marketing, medals, reputation, and the tasting terrace continue to apply.

`npm test`: **75 tests pass**, including seven new demand scenarios for the nonlinear curve and long-term floor, forecast-to-sale accounting, reload continuity, paused listings, unchanged quality/value, pricing bounds, promotions, independent releases, legacy tracking, and judging completion. `npm run build`: TypeScript and Vite pass. `git diff --check`: passes.

In Chrome on the isolated `localhost:5174` Highland Estate save, matched screenshots at the existing 1618×1023 CSS viewport show Highland Reserve's forecast drop from 38 to 10 bottles, with its 21-week age visible. Both captures retain the same $109 shelf price, 101 bottles, Gold medal, 94 score, and $15,929 funds. The new Malbec release stays capped at its 12 remaining bottles. After the matching captures, listing Highland Reserve and advancing once sold exactly 10 bottles for $1,090, leaving 91 bottles and $16,844 after $175 upkeep. Reload preserved 22 weeks since bottling, 233 lifetime bottles sold, and the 10-bottle forecast. No browser console errors. The before/after images and evidence notes are retained in `/tmp/winery-demand-proof`; no PR comment was published.


## Grape compatibility — September 7, 2026

- Replaced the universal diversity bonus with proportion-weighted pairing effects, bounded from −6 to +4. Shared scoring covers live drafts, reserve potentials, tasting, direct bottling, and inherited hybrid traits. Existing recorded scores remain fixed.
- `npm test`: **84 passed**, including nine new compatibility tests and existing quality rarity, save, tasting, pricing, and demand coverage. `npm run build`: passed.
- Real browser QA used the isolated `localhost:5174` IAB save. The main `localhost:5173` game was not used for gameplay. No browser errors were logged.
- Matched desktop captures used the same two source lots: 89 L Merlot at 82 quality and 29 L Cabernet at 83 quality. The old +1 bonus / 80–86 estimate became +3.0 compatibility / 82–88. At 1 L each, the live bench showed +4.0 and 84–90.
- Created Accord des Deux from those 1 L portions, confirmed the same estimate in its reserve tasting, paid $60 once, and received 87 points. Bottled one 750 mL release at 87; reloaded and confirmed the remaining 1.25 L retained 87 and its pairing notes. Historical Le Fil Rouge No. 1 retained 87 throughout.
- Negative pairings, proportion-sensitive Petit Verdot, all 24 catalog grapes, recursive hybrids, score bounds, reblending, and poor-source limits were checked in simulation tests.
- Inspected screenshots and logs: `/private/tmp/terroir-compatibility-qa/`. No Git repository or PR was available; an unposted screenshot-comment template is included there.

## Dynamic demand and a longer release curve

The age curve now uses 36 weeks above the 20% floor, replacing the earlier six-week period. Seasonal red/white tastes, gradual shop traffic and composition-weighted grape popularity, three-week wine-fair/quiet-tourism events, and independent ±35% weekly shopper variation make actual sales fluctuate. The market uses its own saved seed so reloads, renaming, price changes, and unrelated cellar randomness cannot reroll the same week's shoppers. Old saves receive the default market seed.

Final current-workspace verification: **97 tests pass**, including 11 demand scenarios, and `npm run build` passes. Demand checks cover the longer slope, long-term decline despite short-term rises, bounded forecast ranges, pricing and stock, cash/stock reconciliation, seasons and blend weighting, smooth trends, event duration, seed validation/migration, independent releases, promotion timing, and save continuation. `git diff --check` passes.

Chrome QA on the isolated `localhost:5174` save retained the same Year 3 week 6 state, $16,844 funds, $109 shelf price, 91 Highland Reserve bottles, score, and medal for the matched desktop captures. The old 10-bottle forecast became a 19–40 range with a wine fair lasting three sales weeks. Advancing once sold 34 bottles for $3,706, leaving 57 bottles and $20,375 after $175 upkeep. The next forecast was 21–45 with two fair weeks remaining; reload and a fresh tab retained that forecast and all results. A fresh load logged no browser errors (the development tab had transient HMR errors during concurrent source edits). At a measured 360×844 CSS viewport, document width remained 360 and ranges/explanations wrapped cleanly. Temporary viewport overrides were reset.

Inspected images and logs are in `/tmp/winery-dynamic-demand-proof`. The paired shop captures retain identical gameplay data; the sidebar version marker changed from v0.3 to v0.4 during concurrent estate work. No PR evidence was published externally.

## Estate expansion — September 7, 2026

`npm test`: **97 tests pass**, including nine estate scenarios. `npm run build` and `git diff --check` pass. Estate coverage includes version-three migration, atomic purchases and affordability, district limits, region-specific cultivation, offscreen growth, shared capacity, origin preservation through blending and bottling, invalid imports, and a fully developed eight-estate portfolio: 192 parcels, 217.6 ha, and 66 tanks.

Browser gameplay used isolated `localhost:5174` saves:

1. In the in-app browser, bought the named Mosel estate Weingut Flussblick for $28,000. Funds fell from $31,839 to $3,839; upkeep rose from $160 to $335, shared tanks from two to four, and the new property contained three empty owned parcels. Planted Riesling on slate for $595. Switched home and advanced two weeks; the offscreen Riesling reached 24% growth. Reload retained the selected Mosel estate, both properties, funds, vines, and shared inventory.
2. In Chrome, expanded the Mendoza estate with an Upper vineyard for $18,000. Land rose from 3.0 to 9.8 ha, tanks from two to four, and upkeep from $175 to $360. Planted Malbec for $638, leaving $1,737. Original/Upper vineyard navigation and the planted parcel worked after reload. Reload defaults to the saved estate's original district, as documented.
3. At a measured 390×844 CSS viewport, inspected the estate selector, district tabs, map, inspector, and acquisition form. Document width remained 390 without horizontal overflow. The unaffordable Tuscany acquisition displayed the missing $26,263 and stayed disabled. The viewport override was reset. Chrome logged no application errors; the earlier in-app development tab had transient HMR errors during source edits, resolved after reload.
4. Inspected the settings change from “Start a new estate” to “Start a new game,” distinguishing progress reset from expansion. The main `localhost:5173` game rendered the upgraded interface and its existing home estate without gameplay actions against that save.

Authentic inspected Estate and Build before/after pairs retain the same paused game state and 1910×1075 capture dimensions. Settings has a separate matched pair after acquisition. Acquisition and mobile captures show later interaction states. The Estate after capture precedes the final regional road-sign copy refinement. Images, logs, detailed evidence, and an unposted screenshot-comment template are in `/private/tmp/terroir-estates-qa/`. Nothing was published or deployed.

## Paid cellar equipment and smaller tanks — September 7, 2026

`npm test`: **106 tests pass**, including nine new equipment scenarios. Coverage includes independent floor/tank costs, increasing expansion prices, quantity limits, per-tank processing charges, one/two/three-tank allocation, whole-tank exclusivity, stable reuse, preservation of liquid and provenance through bottling, atomic failure, legacy 400 L equipment, corrupt assignments, and a fully occupied 256-tank cellar. Existing estate tests now require paid cellar equipment rather than receiving tanks with land. `npm run build` and `git diff --check` pass.

Browser QA used isolated origins:

1. The existing Chrome `localhost:5174` Highland Estate migrated with all four 400 L tanks, $1,737, 243 L of reserves, 69 bottles, and $360 weekly upkeep preserved. Matched Cellar and Build screenshots show the same paused Year 3 week 7 state and 1618×1023 capture dimensions. The new interface distinguishes installed tanks from empty floor bays and explains legacy capacity.
2. A fresh `127.0.0.1:5174` Domaine Petit Chai started with two 150 L tanks in four bays. Tending and harvesting 360 kg Merlot left $12,230. The preview showed 150 L + 102 L across two tanks, costing $280 in steel or $640 in oak. Steel fermentation left $11,950 and occupied both tanks.
3. Bought two tanks for $2,400: four installed, four bays, $9,550. Further tank purchases were disabled until floor expansion. Paid $3,200 for four more empty bays: still four tanks, eight bays, $6,350, upkeep $175 instead of $160. Reload retained the equipment and fermentation. The next expansion price was $4,800.
4. Advanced twice, harvested Sauvignon Blanc, and fermented its 183 L across tanks 3 and 4 for another $280. Aged Merlot one week and moved all 252 L to reserves. Tanks 1 and 2 became empty while Sauvignon Blanc remained fermenting in tanks 3 and 4 with 150 L + 33 L. Reload preserved that arrangement, the reserve, and $5,365 funds at Year 1 week 9.
5. Inspected the equipment form, four-tank quantity preview, and the two-vessel fermentation card at a measured 360×844 CSS viewport. Document width stayed 360 without horizontal overflow. Inputs, costs, both illustrations, and fill labels fit. The temporary viewport override was reset; the new-game tab logged no application errors.
6. The main `localhost:5173` tab retained a transient recovery notice from intermediate save-schema edits. Reloading after the completed migration restored its original legacy Chardonnay parcel, estate funds, crop state, and saved status. No gameplay actions were performed on the main save.

Images, logs, scenario notes, and an unposted screenshot-comment template are retained at `/private/tmp/terroir-tanks-qa/`. The matched cellar capture precedes a final refinement displaying separate tank illustrations for multi-tank harvests; supplemental desktop/mobile captures show that refinement. Nothing was deployed or published externally.

## Individual plot enlargement — September 7, 2026

`npm test`: **115 tests pass**, including nine new plot scenarios. Coverage includes increasing purchase prices, four-step limits, scaled care/planting/removal/harvest charges, pending rows and offscreen spring activation, preserving current crops and annual harvest flags, fractional hectare totals, legacy defaults, invalid and unaffordable actions, all 24 catalog grapes, and larger liquid volumes. A full South slope harvest conserves 1,080 kg → 756 L across six tanks → 1,008 bottles. The maximum valid 1,800 kg lot fits nine tanks. `npm run build`, formatting checks on changed code, and `git diff --check` pass.

Browser gameplay used a fresh, isolated Chrome `localhost:5175` Domaine des Longs Rangs:

1. Enlarged Merlot South slope from 1.2 to 1.8 ha for $1,800. Funds became $10,950, total land 3.6 ha, and weekly upkeep $175. An incidental $250 neighbor-work payment occurred during initial browser-control troubleshooting before the purchase, so its starting balance was $12,750. Crop ripeness/health stayed unchanged and the new rows were marked for Year 2. Save/reload retained that pending state.
2. Tended for $135 and harvested the existing crop for $180. The original 360 kg yielded 252 L, confirming newly purchased rows did not mint ripe grapes. Fermented for $280 and moved the finished wine to reserves, freeing both tanks.
3. Advanced through the next spring. The added rows became productive and the pending message disappeared. At Year 2 week 6, tending to full health and paying the now-scaled $270 harvest charge produced 540 kg / 378 L. Funds were $7,850; fermentation correctly required 78 L more empty capacity.
4. Bought a third 150 L tank for $1,200, then fermented for $420. The batch occupied 150 L + 150 L + 78 L, with $6,230 funds. Reload retained the 1.8 ha plot, harvested flag, 378 L batch, all three occupied tanks, and original 252 L reserve.
5. At a measured 360×844 CSS viewport, inspected the plot preview and purchased the second expansion for $2,700. Funds became $3,530, plot area 2.4 ha, and total area 4.2 ha. New rows were queued for Year 3; the $3,600 next purchase was disabled with “Need $70 more.” The expansion controls and three-tank card fit without horizontal overflow (document width 360). The viewport override was reset. No application console errors were logged.

Authentic before/after Estate captures use the same initial paused game and 1618×1023 dimensions, but different scroll positions to reveal the added section; they are not a pixel-matched comparison. The separate pre-change plot-controls capture includes the existing replacement confirmation, which was canceled without changing vines. Purchase, larger-harvest, and mobile captures record later gameplay states. Native accessibility clicks worked reliably after resetting the browser control session; earlier locator interactions sometimes navigated unexpectedly. Six- and nine-tank batches were verified in simulation tests; browser visual checks covered three tanks.

Inspected images, logs, and an unposted evidence template remain at `/private/tmp/terroir-plot-expansion-qa/`. The main `localhost:5173` save was not used for gameplay. Nothing was deployed or published externally.


## Investments, hospitality, and substantial upkeep — September 7, 2026

`npm test`: **129 tests pass**, including 14 new investment scenarios. Every catalog purchase, prerequisite, cost, suspension, dependent closure, restart, and save round trip is covered. Additional scenarios verify low-season losses, reputation/season visitor capacity, rooms and restaurant revenue, exact forecast-to-ledger accounting across a season boundary, insolvency, sommelier prices without score changes, mature-release membership demand, actual premium wholesale, production improvements, offscreen vineyard staff, refrigeration expiry, and accelerated studies/breeding. The preexisting production test now supplies funds for the more expensive winemaker's bench. TypeScript/Vite build and `git diff --check` pass.

A deterministic balance sample for a visitor center, tasting room, and sommelier team has $4,000 operating costs per week. At reputation 12 in winter, 20 visitors generate $640, a $3,360 loss before wine sales. At reputation 60 in autumn, 140 visitors generate $4,480, a $480 surplus before wine sales. This checks both downside and useful capacity without treating visitor income as guaranteed profit. Samples are retained in `hospitality-balance.json`.

Browser checks used the existing isolated Chrome `localhost:5175` Domaine des Longs Rangs, initially Year 2 week 6 with $3,530, 630 L of wine, 4.2 ha, and $190 upkeep:

1. Inspected the old three-upgrade page before edits, then the 14-investment catalog, operating-budget summary, department filter, capital and eight-week figures, running/retainer costs, missing-funds reasons, and hospitality prerequisites. The new visitor center preview at reputation 12 in summer showed $612 income minus $1,000 running costs, a $388 weekly loss before wine sales.
2. Through normal game actions, borrowed $3,000, then bought $6,000 irrigation. Funds became $530 and upkeep $430, including $180 irrigation, $60 loan interest, and $190 existing estate costs. Suspending kept $530 cash and reduced upkeep to $295, including $45 irrigation maintenance. Reload retained ownership, suspension, wine inventory, land, and funds.
3. Resumed with enough funds for a full weekly bill; there was no repurchase charge. Advancing once deducted exactly $430, leaving $100. Advancing again triggered the existing $350 emergency-work payment and two-point reputation penalty, charged the full $430 bill, and suspended irrigation. The estate retained $20; future upkeep was $295. Resume was disabled with the requirement to keep $430 for one full estate week.
4. At measured 360×844 CSS size, the department filters, visitor-center purchase row, running costs, prerequisites, negative-return estimate, and operating-budget summary stayed within document width 360. Inspected captures include an automatically suspended state. Temporary viewport overrides were reset.

Before/after desktop captures retain the same paused starting game and 1618×1023 viewport but different scroll positions because the budget and categories move the purchase rows; they are not pixel-matched. Mobile captures retain the starting estate and 360×844 CSS dimensions, with the after capture focused on the new hospitality department. Later suspended-state captures are supplementary. Browser images show the Build surface; research timing and shop/production benefits have simulation coverage. The six hospitality purchases were not exercised in browser gameplay: the funded fixture import helper failed due to Chrome's local-file access restriction, and a native-picker fallback was interrupted before selecting a file. The unused fixture is explicitly labeled synthetic. Browser permissions were not changed.

The development tab recorded transient HMR errors from a module filename collision during editing; the component was renamed to `EstateInvestments.tsx`, and subsequent reloads rendered successfully. A final fresh tab loaded the suspended state and Build catalog with no application console errors. Screenshots, test/build logs, balance samples, and an unposted evidence template are in `/private/tmp/terroir-upgrades-qa/`. The main `localhost:5173` save was not used for gameplay. Nothing was committed, deployed, or posted externally.

## Expanded research progression — September 7, 2026

- `npm run build`: passed TypeScript and production Vite build.
- `npm test`: 143 passing tests, including 14 dedicated progression tests. Covers every region's two founding grapes, individual completion and regional terms, graph validity, all investment gates, cross-grape/year/estate/color blending, nested recipes, atomic rejection, pauses and abandonment, legacy collections/trials/facilities, malformed saves, and in-memory version migration.
- Isolated Chrome QA used `localhost:5175` for the previous estate and `127.0.0.1:5175` for a fresh estate. The main game on port 5173 was not used for gameplay QA.
- The old estate retained eight plantable grapes. A fresh Bordeaux estate began with two. In the real UI, a harvest funded knowledge for Vine science, which charged $1,200 and took six active weeks. Pausing survived an advance and reload. A separate Cabernet Sauvignon study charged $5,120 and 80 knowledge, remained locked after 11 weeks, and became the third plantable grape after week 12.
- A second study was paused and abandoned through the actual confirmation: its slot freed, cash and knowledge were not refunded. Build's tasting-room research link opened Hosted tastings. Two reserve lots of different vintages showed Cellar foundations and Perpetual reserves as missing and linked to the first required study. Simulation tests cover the full expensive tourism purchase chain and successful advanced blends; those late-game purchases were not clicked in the unfunded browser fixture.
- Desktop research, individual grape columns, tourism search, and the abandonment dialog were visually inspected. At 360 × 844, the research ledger and grape library had no horizontal overflow. The initial library overlap was corrected before final verification.
- Local evidence lives in `/private/tmp/terroir-research-qa/`: `before-research.jpg`, `after-research-final.jpg`, `grape-studies-desktop.jpg`, `grape-studies-mobile.jpg`, `tourism-desktop.jpg`, `research-mobile.jpg`, and `abandon-mobile.jpg`. Main-page comparison uses 1618 × 1023 with the same legacy estate; between captures its ready batch was moved to reserves for blend QA, freeing three tanks. No screenshots were fabricated and no personal save was edited for test funds.
- Existing test fixtures were explicitly granted the prerequisites needed for tests of production, investment operation, or land behavior. Separate new-game tests exercise the actual research restrictions.

## Stable estate map framing — September 7, 2026

- Reproduced the reported behavior in the isolated `localhost:5175` estate. At a measured 1440 × 900 viewport, switching between a planted expanded parcel and a for-sale parcel changed map height from 1165px to about 544px while the manual zoom remained 1. The inspector's content height was stretching the grid row and resizing/recentering the SVG.
- The desktop workspace now has a viewport-based fixed height, with a separately scrolling inspector. Its children retain their natural sizes, and the inspector can receive keyboard focus. Mobile retains its 350px map and normal page-scrolling details.
- Clicked all six plots at 1440 × 900: each map measured 584.444px high and 976.892px wide. A fixed plot landmark stayed 223.152px wide and at the same relative position for every selection. At manual zoom 1.15, switching parcels retained both the zoom transform and the landmark width of 256.624px.
- The inspector's End key reached the lower expansion controls (scroll position about 581px) without changing the page scroll or map size. Wide desktop (1760 × 1000) and mobile (360 × 844) checks also retained identical map and landmark dimensions between selections.
- `npm run build` passed; all 143 existing simulation tests passed; `git diff --check` passed. This layout fix does not alter game state or save rules.
- Local before/after images and DOM measurements are in `/private/tmp/terroir-map-stability-qa/`. Desktop captures use the same estate, selected parcel, 1440 × 900 CSS viewport, and page-top navigation. Mobile captures use the same 360 × 844 viewport and scroll sequence, with a small native-wheel vertical offset between images; map height and landmark size are unchanged. No PR or deployment was requested.

## Milestone removal — September 7, 2026

- Removed the estate milestone panel, Journal checklist, completion rules, and achievement-specific components and styles. The winemaker note now fills the estate footer; the Journal gives the ledger more room beside a compact financial-support panel. Guide and current documentation describe the remaining controls.
- New estates omit achievement metadata. Existing `claimed` fields remain valid, inert save data; historical funds and ledger entries are preserved. Save version six and the storage key are unchanged. Production, wine history, sales, judging, and research progression remain independent of achievements.
- `npm run build` passed; all 143 tests passed. Updated regression tests cover new saves without achievement state, old metadata with historical payouts, identical harvest behavior with and without that metadata, and version-five migration.
- Real browser checks used only the isolated `localhost:5175` Domaine des Longs Rangs save. Estate, Journal, and Guide had no milestone controls or targets. The estate shortcut opened the cellar. Neighboring vineyard work added exactly $250 ($20 → $270) without advancing Year 2/week 8; its ledger entry and disabled repeat action survived reload. No browser errors were recorded.
- Inspected matching desktop Estate, Journal, and Guide captures at 1440 × 900 CSS pixels, plus mobile Estate and Journal captures at 390 × 844. No horizontal overflow. The desktop map remained 584.444px high. All pairs retain the same paused $20 / 630 L starting state; gameplay checks came afterward. The estate footer and mobile Journal naturally shift with the removed content, so their scroll positions differ while the navigation sequence stays the same.
- Evidence and a prepared, unposted comment template are in `/private/tmp/terroir-remove-milestones-qa/`. The browser returned JPEG bytes, retained without alteration under `.jpg` filenames. Each pair has matching image dimensions. The main port-5173 save was not used for gameplay QA; no PR or deployment was requested.

## Retired financial support — September 7, 2026

- Removed the Journal's helping-hand panel, neighboring-work action, business loans, repayment controls, and related styles. The ledger now fills the available width. Guide and current documentation describe the remaining accounts view.
- New games omit `helpWeek` and `debt`. Older saves retain these as inert metadata, along with their cash and historical transactions; no further loan interest is charged. The automatic emergency-work insolvency backstop is unchanged.
- `npm run build` passed; all 144 tests passed. Regression coverage checks retired-action rejection without mutation, new-game round trips, version-five/six legacy financial metadata, preserved funds/history, and a full year of identical gameplay with and without that metadata.
- Inspected authentic before/after Journal captures at 1440 × 900 and 390 × 844 CSS pixels, plus the updated desktop Guide. All pairs use the same paused Year 2/week 8 estate, $270 balance, and 630 L reserves. Upkeep correctly changes from $295 to $235. Full-page mobile image heights differ because the support panel was removed; desktop Guide captures are both scrolled to the bottom. No horizontal document overflow at 1440, 390, or 360px; the 360px ledger also has no horizontal overflow.
- After capturing the comparison, advanced the isolated `localhost:5175` estate to week 9 through the UI: cash fell from $270 to $35, with an exact $235 upkeep entry and no loan interest. Reload preserved the result and history. No browser console errors were recorded. The main port-5173 save was not used for gameplay QA.
- Original JPEG captures, test log, scenario notes, and an unposted evidence template are in `/private/tmp/terroir-remove-support-qa/`. No PR was requested.

## Higher land purchase costs — September 7, 2026

- Neighboring parcels now cost $14,000–$19,200, above the $12,500 starting balance. Plot expansions cost twice as much ($3,600 for South slope's first addition); district expansion is $36,000/$54,000/$72,000, and regional acquisitions start at $56,000 with $16,000 increments. Parcel inspectors now show the exact savings shortfall. Existing ownership, upkeep, planting costs, and historical transactions are unchanged.
- `npm run build`, all 147 tests, and `git diff --check` pass. Added coverage verifies that all eight starting regions cannot buy neighboring parcels but can still harvest and plant existing land, one-dollar-short rejection and exact-price purchases in home/acquired estates, and save preservation of a parcel bought at its historical price. Existing expansion and full-portfolio tests cover larger purchases with explicitly funded capacity fixtures.
- Inspected authentic desktop before/after pairs at 1440 × 900 CSS pixels for River meadow, South slope's third expansion, and Build → Land & estates. Same paused isolated `localhost:5175` estate: Year 2/week 9, $35, 630 L, 4.2 ha. Map labels and inspector agree; purchase buttons remain disabled and show the updated funding gap. Holdings shows $36,000 for a district and $56,000 for an estate; the pending third plot expansion shows $7,200. No purchases or calendar advances were made in this unfunded browser save; successful purchases and affordability thresholds were exercised in simulation tests.
- Supplementary mobile inspection at 390 × 844 confirms the parcel price and shortfall are readable. No horizontal document overflow at 1440, 390, or 360px, and no browser console errors. The main port-5173 save was not used for gameplay QA.
- Original JPEG images, scenario notes, test log, and an unposted evidence template are retained in `/private/tmp/terroir-land-prices-qa/`. Desktop pairs follow the same navigation/focus sequence; mobile is after-only supplementary evidence. No PR was requested.
