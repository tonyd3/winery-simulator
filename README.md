# Terroir · Winery Tycoon

A playable browser winery game with an original flat, illustrated estate, seasonal viticulture, a complete production economy, and persistent saves.

## Run

```sh
npm install
npm run dev -- --port 5173
```

Open [localhost:5173](http://localhost:5173). Keep using the same hostname and port to access the same browser save.

```sh
npm test          # 62 simulation and save-integrity tests
npm run build    # TypeScript checks and production bundle
npm run preview  # Serve the production build locally
```

Requires Node.js 22 or newer. Built with React, TypeScript, Vite, and Zod. All artwork is original SVG rendered by the game; no image service or API key is required. Fonts use Google Fonts with system fallbacks.

## Your first vintage

1. Pick or randomize one of eight wine regions and name your estate. Start with $12,500, three parcels, two regional grapes, two tanks, and 600 bottling kits. Time is paused.
2. Select **South slope**. Tend the vines if you like, then harvest its ripe regional grape.
3. In **Cellar**, choose stainless steel or French oak and start fermentation. Fresh grapes spoil after three game weeks.
4. Advance two weeks. Age for up to eight weeks if you like, then **Move to reserves** to free the tank. In **Reserves & blending**, store the wine, blend it with other grapes and vintages, or bottle it on its own.
5. Bottle any amount into a new or existing wine line. Choose a bottle and label for a new line, then watch its tasting score appear. In **Wine shop**, set its price and list the release. Customers buy each game week. Wholesale sells the entire remaining stock immediately at a lower price.
6. Track milestones in **Journal**, plant your empty parcel, buy more land, and invest in irrigation, tanks, a tasting terrace, or temperature control.

The year has 12 game weeks: spring 1–3, summer 4–6, autumn 7–9, winter 10–12. Harvest each parcel once per year at 80%+ ripeness, before winter. Grapes regrow each spring. Regional climate, grape resilience, vine health, ripeness, soil match, and inherited traits affect production. The calendar is deliberately compressed for play, not a realistic winemaking schedule.

**Next week** advances one turn. The 1×, 2×, and 4× controls advance every 6, 3, and 1.5 seconds. Switching away from the tab pauses the game; reopening a save always starts paused. There is no offline simulation.

## Regions, research, and breeding

Choose Bordeaux, Burgundy, Napa Valley, Mosel, Tuscany, Rioja, Mendoza, or Barossa. Regional favorites start unlocked, cost 15% less to plant, and enjoy local growing advantages. Six classic grapes are always available, so other-region planting is possible from the start. Research unlocks the full 24-variety catalog everywhere.

**Research** has three departments: studies, a searchable grape library, and the breeding nursery. Knowledge comes from weekly observation (+6, or +8 after Vine science), harvesting (+12), and bottling (+1 for every 40 bottles produced). Research consumes both funds and knowledge and completes as game weeks pass. One study and one breeding trial can run concurrently.

Complete **Vine science → Cross-pollination** to breed. Choose two unlocked parents, select regional adaptation, hardiness, or wine quality, and name your new grape. Trials cost $900 and 60 knowledge, and last four weeks (three after Field selection). Finished offspring can be planted, made into wine, sold, and crossed again. An estate can keep 60 custom varieties.

Use **Replace grape variety** on a planted parcel to remove its vines for $120, then buy replacement vines. Removing vines loses any unpicked crop and never grants a second harvest in the same year.

To choose a different region, use **Save & settings → Start a new estate**. Previewing regions is reversible; only the final Start button replaces the save. Export first to keep multiple estates as files. See [regional research and balancing notes](docs/regions-and-research.md).

## Reserves, blends, and house labels

The cellar has **Fermentation**, **Reserves & blending**, and **Wine lines** departments. Store up to 64 reserve lots, indefinitely, without occupying fermentation tanks. Aging improves quality in the tank before transfer; time in reserves preserves it.

Select two or more lots and enter liters to create a blend. Mix different grape varieties, harvest years, and existing blends. Only the selected amounts are consumed, and each source grape and year remains in the recipe. Liquid is measured internally in whole milliliters, including the remainder after filling 750 mL bottles.

Use **Generate** beside **Name this blend** for a name inspired by your estate's region. Click again for another suggestion, or edit it before creating the blend.

A recipe’s potential score is its weighted wine quality plus up to three points for varietal balance. A final tasting adds −3 to +3 points, clamped to 0–100, and appears in an animated bottle reveal. A reserve is assessed once: additional bottles and reloads keep its score. Reblending calculates the bonus from the original recipe, without stacking previous bonuses. Reduced-motion users see the final score immediately.

The blending bench previews the estimated range as you change quantities. Expand **Source quality & blending advice** for each grape and vintage's quality, its share of the recipe, and the proportion needed for the next balance point. Different vintages of the same grape do not add varietal balance; higher-quality sources can improve the base score while changing the balance bonus.

Every stored lot has **Analyze & score**. Analysis is free; an optional **Taste & score · $60** fixes its final score before bottling, without consuming wine, kits, or game time. After tasting, use **Bottle this reserve** to create a release. The lot becomes **Tasting notes**, where its score remains available, including after partial bottling and reloading. You can also bottle an untasted reserve directly and reveal its score as usual. Independent judging in the wine shop is a separate review for the bottled release.

New wine lines offer three label styles (heritage crest, estate landscape, modern colorblock), three bottle shapes, and four label colors. Existing lines reuse their design and founding year. Every release has its own recipe, rating, original production quantity, and remaining stock. Sold-out releases stay in the archive. The prototype supports up to 1,000 releases, subject to a 2 MB save limit; actions that would exceed the save limit are rejected without consuming inventory.

Open **Wine shop → Wine history** to see every saved release, grouped by wine line, with bottles produced, sold, and remaining. Expand a release for its blend, source vintages, and bottling details. Line totals include both retail and wholesale sales; the archive also shows estate lifetime sales and current stock. **Current wines** contains releases with stock available. These same release counts appear in **Cellar → Wine lines**.

For older releases whose original production was never recorded, historical per-wine sales are marked **Unrecorded**. New sales are tracked and shown with a **+** to indicate an incomplete total. The estate lifetime sales counter keeps its existing history. No missing sales or production quantities are invented.

## Marketing and independent judging

Each release in **Wine shop → Current wines** offers two paid actions:

- **Send for marketing · $240**: a four-week campaign adds 40% to shop demand and $2 to the suggested shop price. List the wine first. The boost applies to the next four weekly sales, then expires; you can pay for another campaign afterward. Pausing the listing does not pause campaign weeks, and marketing does not improve wholesale offers.
- **Send for judging · $180**: enter a release once for an independent panel result in two weeks. Its score varies by up to five points from the original wine rating. Bronze (80+) adds $2 to suggested value and 10% demand; Silver (85+) adds $4 and 20%; Gold (90+) adds $6 and 30%. Below 80, the review remains on record without a bonus. Medals are permanent for that release and also improve wholesale offers. New releases in the same line need their own judging entry.

Set any whole-dollar shelf price from **$1 to $1,000** using the exact price field or slider. Valid changes save immediately; incomplete or invalid input returns to the saved price when you leave the field. Click **Suggested: $…** to apply the current suggestion. Marketing and medals raise willingness to pay; they do not change your chosen selling price automatically. Demand bonuses add together and still respond to pricing and stock. Prices far above suggested value can result in no sales; the forecast updates as you adjust. Fees are charged from estate funds, with no bottle consumption or extra cash awards.

Campaign countdowns and judging results persist in saves. The panel's outcome is fixed when you enter, so reloading while waiting does not reroll it. The original bottle rating stays separate from the panel score; reviews and medals remain visible in **Wine history** and **Cellar → Wine lines**, including after sellout. Older saves start with no campaigns or judging entries and keep existing prices, funds, and inventory.

Milestones are automatic progress markers and do not grant money. The journal shows completed achievements and the estate highlights the next unfinished milestone. Previously earned cash and historical ledger entries remain intact in older saves.

## Saves

- Every successful game action saves automatically to browser `localStorage` under `terroir.save.v1`.
- **Save & settings → Export save** downloads a JSON file. **Import save** validates the entire state and previews the estate before replacing the open game.
- A save contains the calendar, funds, plots, inventory, production, labels/prices, upgrades, orders, milestones, ledger, random-generator state, region, knowledge, research, breeding projects, and complete custom-grape lineages.
- Version-one and version-two saves migrate automatically to version three. Existing land soils, vines, funds, inventory, and calendar are preserved; the legacy estate receives Bordeaux as its region. Old bottles keep their scores, prices, and stock, and become releases in house wine lines. Original production quantities are marked unrecorded when the old save did not track them. The storage key remains unchanged for compatibility.
- Invalid imports leave the current estate intact. Unreadable existing saves are preserved as a recovery copy when browser storage permits it. Failed storage writes show an explicit export reminder.
- Other tabs on the same origin adopt incoming saves and pause their timers.
- Saves are local to the browser and origin. There is no account or cloud synchronization. Export before clearing browser data, moving ports, deploying to a new address, or changing devices.
- JSON export and import were verified with a completed custom-grape estate in the in-app browser. Export was also verified in Chrome during the initial game validation. Browser host support may vary.

The **Guide** is available from the desktop sidebar and from Save & settings on all screen sizes.

## Code map

- `src/game.ts`: pure game transitions, economy, deterministic seasons, and versioned save validation.
- `src/App.tsx`: application shell, timer, persistence, import/export, and dialogs.
- `src/EstateMap.tsx`: interactive SVG estate and original vector art.
- `src/Panels.tsx`: vineyard inspector, production, pricing, upgrades, ledger, and milestones.
- `src/winemaking.ts`: reserve, recipe, label, and line schemas; exact volume allocation and blending quality.
- `src/Reserves.tsx`: reserve storage, blending bench, bottling form, and line archive.
- `src/BlendAnalysis.tsx`: live recipe analysis, source-quality advice, and paid cellar tasting.
- `src/WinePresentation.tsx`: bottle artwork, provenance, and animated score reveal.
- `tests/blending.test.ts`: cross-vintage blending, partial bottling, inherited labels, tasting persistence, and migration.
- `tests/tasting.test.ts`: recipe advice thresholds, tasting costs, fixed scores, and save integrity.
- `src/catalog.ts`: 24 grape definitions, eight regions, and six research projects.
- `src/Regions.tsx`: new-estate region selection and regional illustrations.
- `src/Research.tsx`: research progression, grape library, and breeding nursery.
- `src/expansion.css`: region and research layouts, including responsive behavior.
- `tests/expansion.test.ts`: region, research, breeding, migration, and custom-wine tests.
- `src/components.tsx`: shared controls and accessible modal behavior.
- `tests/game.test.ts`: meaningful economy, lifecycle, capacity, and save-integrity checks.
- `docs/design-notes.md`: reference research, implemented choices, and possible future depth.
- `docs/validation.md`: browser scenarios and current verification evidence.

This is a local playable prototype. `npm run build` produces a static `dist/` directory that can be hosted on any static web host; no public deployment has been created.
