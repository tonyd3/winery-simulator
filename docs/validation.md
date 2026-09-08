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
