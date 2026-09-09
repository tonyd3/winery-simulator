# Terroir · Winery Tycoon

A playable browser winery game with an original flat, illustrated estate, seasonal viticulture, a complete production economy, and persistent saves.

Play online at [winery.tony-dong.com](https://winery.tony-dong.com/).

## Design conventions

The [Terroir style guide](docs/style-guide.md) records the palette, typography, layout, controls, illustration language, regional identities, motion, and responsive conventions. Read it before changing the UI. [AGENTS.md](AGENTS.md) directs coding agents to the same guide and defines the verification expected for future changes.

## Run

```sh
npm install
npm run dev -- --port 5173
```

Open [localhost:5173](http://localhost:5173). Keep using the same hostname and port to access the same browser save.

```sh
npm test          # Simulation and save-integrity tests
npm run build    # TypeScript checks and production bundle
npm run preview  # Serve the production build locally
```

Requires Node.js 22 or newer. Built with React, TypeScript, Vite, and Zod. All artwork is original SVG rendered by the game; no image service or API key is required. Fonts use Google Fonts with system fallbacks.

## Agent playtesting

Use the repo-local [playtest-terroir skill](.agents/skills/playtest-terroir/SKILL.md) for a browser playthrough and a numbered review of bugs, usability, mechanics, and balance. It covers save preservation, production and sales, expansion into a second region, persistence checks, and evidence for selected fixes.

Example request: “Use $playtest-terroir to play from a fresh save until a second regional winery sells its first wine, then report the findings.”

## Your first vintage

1. Pick or randomize one of eight wine regions and name your estate. Start with $12,500, three parcels, two regional grapes, two 150 L tanks in a four-bay cellar, and 600 bottling kits. Time is paused.
2. Select **South slope**. Tend the vines if you like, then harvest its ripe regional grape.
3. In **Cellar**, review each harvest's fermentation options, available tanks, and processing cost. Steel is the default; French oak fermentation is an optional choice for that harvest. Large harvests fill multiple tanks; if only part fits, start that portion and process or sell the remaining grapes later. Fresh grapes keep their original three-week spoilage deadline.
4. Advance two weeks, plus any selected technique time. Move the finished wine directly to reserves, or choose **stainless steel, neutral oak, or French oak maturation** for that batch. Follow its suggested release window and optionally schedule an automatic transfer. Transfer frees all tanks used by the batch. In **Reserves & blending**, store the wine, blend it with other grapes and vintages, or bottle it on its own.
5. Bottle into a new or existing wine line, up to your available kits and warehouse space. Preview its likely tasting notes, choose a bottle and label for a new line, then watch its tasting score appear. In **Wine shop**, set its price and shelf allocation, then list the release. Customers buy each game week, limited by its shelf stock. Wholesale sells the entire remaining stock immediately at a lower price.
6. Review income and expenses in **Journal**, plant your empty parcel, buy more land, and research investments that suit your estate.

The year has 12 game weeks: spring 1–3, summer 4–6, autumn 7–9, winter 10–12. Harvest each parcel once per year at 80%+ ripeness, before winter. Grapes regrow each spring. Regional climate, grape resilience, vine health, ripeness, soil match, and inherited traits affect production. The calendar is deliberately compressed for play, not a realistic winemaking schedule.

Weather varies by region and year, with a wider temperature range. Sunshine adds one point to weekly ripening; overcast weather subtracts one and dry spells subtract two. Dry spells still stress vine health, with irrigation and resilient grapes providing protection. Spring and summer weather also adjust harvest quality by up to **−3 to +3 points**, so equally well-tended grapes can differ between vintages. That adjustment stays fixed through autumn. Reloading or unrelated actions cannot reroll weather, and already-harvested grapes and recorded wine scores keep their quality.

**Next week** advances one turn. The 1×, 2×, and 4× controls advance every 6, 3, and 1.5 seconds. Switching away from the tab pauses the game; reopening a save always starts paused. There is no offline simulation.

## Warehouse and shelf space

Start with **600 warehouse bottle spaces** and **120 shop shelf spaces**, shared by all estates. Warehouse capacity counts every unsold bottle, including those on the shelf. Partial bottling leaves unused wine in reserves. Assign shelf space to each listed release; it refills automatically each week and caps that release's retail sales. Pausing frees shelf space, and sales free warehouse space.

Add **600 warehouse spaces for $2,400** in the Cellar or Wine shop, or **60 shelf spaces for $900** in the Wine shop. Later purchases cost more; both are permanent investments with no extra upkeep. Wholesale can clear a release's entire stock. Old saves keep all their wine, even above warehouse capacity. See [storage rules and save behavior](docs/bottle-storage.md).

## Regions, research, and breeding

Choose Bordeaux, Burgundy, Napa Valley, Mosel, Tuscany, Rioja, Mendoza, or Barossa. New estates know only their region’s **two founding grapes**. Every other grape has an individual field study. Regional favorites keep their growing advantages and 15% planting discount, and their studies cost 20% less cash and take two fewer study weeks. Buying another estate does not unlock grapes.

**Cellar techniques** are researched after Cellar foundations, then selected separately for each fresh harvest before fermentation. Skin contact adds body and tannin (+1 week, $40 per tank); malolactic fermentation softens acidity (+2 weeks, $60 per tank); lees aging adds texture and bread-dough notes (+3 weeks, $50 per tank). The batch shows its full processing cost and tank time upfront. Steps run automatically, preserve partial-harvest handling, and carry into blend and bottle tasting notes. See [cellar techniques](docs/cellar-techniques.md) for research terms and save behavior.

**Research** contains **97 studies**: 33 techniques across vineyard science, cellar techniques, tourism/hospitality, and commerce/discovery, plus 64 individual grape studies. Search by technique, grape, or unlock; follow clickable prerequisites; filter by availability. Studies range from **6–72 weeks** and **$1,200–$180,000**. A game year has 12 weeks. Research costs are separate from buildings, teams, and planting.

Use **Plan toward an outcome** to trace prerequisites, remaining cash and knowledge, study time, follow-on purchases, and facility upkeep. Save and reorder up to five studies with **Study next**; each still requires an explicit Start study action. Discoveries stay visible until dismissed and link to the relevant next task. The grape library filters by color, soil, climate fit, and availability, and compares growing traits, planting prices, and study terms.

The 64-grape library includes 12 new varieties: Touriga Nacional, Touriga Franca, Baga, Mencía, Bobal, Pinotage, Saperavi, Assyrtiko, Moschofilero, Godello, Verdejo, and Rkatsiteli. Each has its own field study, growing traits, tasting profile, maturation advice, and blending affinities. Search accepts names without accents and either apostrophe style. See the [grape expansion guide](docs/grape-library.md) for all additions, costs, and recipe ideas.

When creating a wine line, choose from six bottle silhouettes, six label styles, six colors, four neck finishes, and three paper tones: **2,592 combinations**. Start with one of four complete looks or choose each detail visually. Add a personal back-label note, then turn the preview or finished bottle to read it. Find the studio in **Cellar → Reserves & blending → Bottle this reserve**. Each release and subsequent vintage keeps its line’s design and note. All bottles remain 750 mL and consume one kit. See [bottle designs](docs/bottle-designs.md).

Knowledge comes from weekly observation (+6; +2 after Vine science; +4 after Field notebooks), harvesting (+12), and bottling (+1 per 40 bottles). Start with one study slot and buy up to eight under **Research → Add study slot**. The second slot costs $5,000, the third $10,000, and each later slot costs $5,000 more; slots are permanent and add no weekly upkeep. Every study pays its own cash and knowledge costs upfront and progresses in parallel, with individual pause/resume and abandon controls. Paused studies keep their slots; abandoning refunds nothing. One breeding trial can run separately. An operating research lab doubles all running study and trial progress and adds 10 knowledge each week.

**Cellar foundations** unlocks basic blending after **6 study weeks, $1,500 and 35 knowledge**: combine up to two grape varieties of the same wine color, vintage and estate. **Advanced blending** adds recipes with three or more grapes after another 14 weeks, $7,500 and 100 knowledge. Perpetual reserves then unlocks different vintages; Regional cuvées unlocks different estates; Red & white experiments unlocks mixed wine colors. Each step opens new ways to improve a recipe through source quality, proportions and compatibility. Research itself adds no score bonus. Basic harvesting, fermentation, reserve storage, analysis, and single-lot bottling remain available immediately. Every capital investment in Build requires a discovery, while cellar bays, tanks, and land remain direct purchases.

For example: **Wine tourism → Visitor services → Hosted tastings** unlocks a tasting terrace, visitor center, and tasting room for separate purchase. The tasting room also needs an operating visitor center. Sommelier training additionally requires Sensory science; Wine & gastronomy and Destination stays open later hospitality options.

After **Vine science**, run one introductory cross of your two founding grapes for **$1,800, 40 knowledge, and 8 study weeks**, selecting climate adaptation or hardiness. The nursery previews offspring traits and planting price before purchase.

Further trials require **Nursery propagation → Cross-pollination**. Cross-pollination remains a later investment: **36 study weeks, $38,000 and 320 knowledge**, bringing the full prerequisite path to 52 study weeks without a lab. Trials separately cost **$7,500 and 160 knowledge**, and take **24 weeks** (18 after Field selection). Generational crosses unlocks hybrid parents, including the introductory grape; Aroma & finesse selection unlocks the Wine quality trait. Finished offspring can be planted, bottled, and sold. An estate can keep 60 custom varieties. Previously paid studies retain their original durations, and existing Varietal assemblage research counts as Advanced blending.

Optional experiments connect three active studies to practical work: observe healthy, suitably planted vines for **Soil & water mapping** or **Climate adaptation**, or consume 1.5 L from matching oak/steel reserves for **Sensory science**. These give bounded, one-time time savings; normal study progress remains available. See [experiment rules](docs/regions-and-research.md#optional-research-experiments).

Use **Replace grape variety** on a planted parcel to remove its vines for $120 at original plot size, then buy replacement vines. Removal and planting costs scale with expanded acreage. Removing vines loses any unpicked crop and never grants a second harvest in the same year.

To restart in a different region, use **Save & settings → Start a new game**. Previewing regions is reversible; only the final Start button replaces the save. Export first to keep the previous game. Acquire additional regional estates through **Build → Land & estates** to keep playing the same business. See [regional research and balancing notes](docs/regions-and-research.md).

## Expand your wine estates

Neighboring parcels cost $14,000 (River meadow), $16,800 (Hilltop parcel), and $19,200 (Old stone field), plus vines and $25 weekly upkeep. These exceed the $12,500 starting balance; build income from the three parcels you already own before acquiring more land.

To grow more of a grape already planted, select its parcel on the **Estate** map and use **Grow more here → Expand plot**. Each purchase adds half the original acreage, with four expansions reaching three times the original size. The preview shows price, mature yield, and cellar tank needs. New rows on planted plots join the crop next spring; the current harvest stays unchanged. Each purchase adds $15 weekly upkeep, and care, planting, and harvest costs scale with size. For example, South slope grows from 1.2 to 1.8 ha for $3,600, taking its healthy Merlot yield from 360 to 540 kg once established. See [plot expansion rules](docs/plot-expansion.md).

To add more parcels or properties, open **Build → Land & estates**, or use **Expand your holdings** above the estate map.

- **Add a vineyard district:** unlock six parcels totaling 6.8 ha for separate purchase. Districts cost $75,000, then $100,000, then $125,000 at each estate, and add $35 weekly upkeep. Each parcel costs $14,000–$19,200 and adds $25 weekly upkeep once bought. Buying a district adds no owned land; buy each parcel before planting or enlarging it. Vines, cellar space, and tanks cost extra.
- **Acquire a regional estate:** choose an unowned region and name the estate (or generate a name). The first acquisition costs $250,000; each later acquisition costs $100,000 more. Includes three empty parcels totaling 3 ha and three neighboring parcels available to buy; cellar equipment is separate. Adds $175 weekly upkeep before further purchases. Existing saves retain all previously owned parcels and historical purchase prices.
- **Manage the portfolio:** use the estate selector above the map and its vineyard district tabs. All estates grow every week, with their own regional soil and climate. Switching estates consumes no time or money. Research, equipment, cash, supplies, reserves, wine lines, and the calendar are shared.
- **Keep provenance:** grape lots retain their origin through fermentation, storage, blending, bottling, and history. Combine wines from different estates and vintages while retaining the source breakdown. Estate diversity alone gives no grape-compatibility bonus.

Own one estate in each of the eight regions, with up to four districts per estate: **192 parcels and 217.6 ha before individual plot expansions**, or **652.8 ha with every parcel fully enlarged**. Existing vines, inventory, scores, money, and history survive migration. **Start a new game** in settings remains the separate reset flow.

See [estate expansion rules](docs/estates.md) for costs, save compatibility, and simulation boundaries.

## Facilities, staff, and running costs

**Build → Buildings & equipment** has 18 investments grouped into vineyard/cellar, hospitality, sales, and research. Prices range from **$6,000 to $180,000**, with **$180–$3,000 weekly running costs per investment**. Existing irrigation, tasting terrace, and winemaker’s bench purchases remain owned and use their listed running costs.

**Improve grape quality** through the compost program (+1 point), canopy management (+2 at 80%+ vine health), precision irrigation controls (+2 at 95%+ ripeness, requiring operating drip irrigation), and a selective harvest crew (+3 points for 10% less fruit). Research unlocks each purchase; operating benefits apply across all estates and stack with optical sorting's +2 points. The parcel inspector previews grape quality and kilograms before picking, with a disclosure explaining owned upgrades and unmet conditions. Suspended investments stop contributing, and already harvested grapes and wine retain their recorded scores.

Visitor centers, tasting rooms, sommeliers, restaurants, and a guesthouse earn visitor income or improve wine demand. Attendance and room occupancy depend on Prestige and season; there is no guaranteed $140 visitor payment. The page previews current hospitality income after costs, each purchase's incremental return before wine sales, and its purchase price plus eight weeks of operating costs. Wine sales still depend on stock, quality, prices, and the market.

Optical sorting improves new harvests, viticulture staff support larger vineyards, refrigeration extends fresh-grape life to five weeks, and the research/nursery lab accelerates studies and breeding. Wine-club and export teams target older releases and premium wines. Benefits only apply while an investment and its prerequisites operate.

Use **Suspend** to stop benefits and reduce a bill to **25%**, rounded up. Ownership is permanent; there is no refund. Dependents also suspend and must be resumed individually. Resuming requires cash for one full week of total estate upkeep. If funds after weekly income cannot cover the bill, bankruptcy closes the estate and requires a new game. Suspend facilities before advancing to reduce future bills.

See [investment costs and economy](docs/investments.md) for the complete catalog and simulation rules.

## Cellar floor space and tanks

Open **Cellar → Space & tanks**, or **Build → Buildings & equipment → Cellar space & tanks**.

- New games have **two 150 L tanks and four tank bays**. Buy additional 150 L tanks for **$1,200 each**, including several at once.
- Expand the floor by **four empty bays for $3,200**. Each later extension costs $1,600 more and adds $15 weekly upkeep. Tanks are purchased separately; vineyard purchases do not add equipment or bays.
- A harvest fills the available empty tanks, leaving any remaining grapes to process or sell before their original spoilage deadline. A 360 kg harvest makes 252 L, filling one tank with 150 L and another with 102 L. Steel processing costs **$140 per tank used**; oak costs **$320**. An order is rejected without charges if no tanks are empty or there is insufficient money for the displayed processing cost.
- Tanks cannot share batches, even if partially full. Each batch reserves the same cellar capacity through fermentation and maturation; transferring it to reserves frees every assigned tank. Maturation costs **$0 in steel, $80 in neutral oak, or $180 in French oak per reserved tank**, paid once when started. Wood choices include barrel service; owned tanks remain in the inventory. The cellar supports up to **256 installed tanks**.
- Old saves retain all previously owned **400 L tanks**, occupied wine, funds, and existing upkeep. New purchases are 150 L. See [cellar equipment rules](docs/cellar-equipment.md).

## Reserves, blends, and house labels

The cellar has **Fermentation**, **Reserves & blending**, **Wine lines**, and **Space & tanks** departments. Store up to 256 reserve lots, indefinitely, without occupying fermentation tanks. Aging improves quality in the tank before transfer; time in reserves preserves it.

Select two or more lots and enter liters to create a blend, or open **Set percentages & batch size** for custom shares, equal shares, and two-lot 60/40 or 80/20 presets. Set a batch size or use the maximum available at those proportions, then **Apply proportions**. The bench shows bottle yield, likely aromas and palate, and estimated quality. Mix different grape varieties, harvest years, and existing blends. Only creating the blend consumes the selected source amounts; each source grape and year remains in the recipe. Liquid is measured internally in whole milliliters, including the remainder after filling 750 mL bottles.

**Save bench trial** keeps up to three recipes in a tasting notebook beside the current recipe. Compare proportions, aromas, palate, source quality, and estimated score without using wine, cash, kits, or game time. Trials save with the estate. **Use** restores a recipe to the bench while its source stock is available; **Create blend in reserves** remains the production action and requires the normal research. Depleted recipes retain their notes but cannot restore used wine. See [blend planning and trials](docs/blend-planning.md).

Lots smaller than 750 mL appear in a **Small leftovers** summary. **Select for blending** fills the blending selection with their full volumes; normal recipe and research requirements still apply. **Clear small leftovers** reviews the exact lots and total volume before permanently discarding them to free reserve spaces. Clearing earns no cash, knowledge, or Prestige and consumes no kits or game time. Lots of 750 mL or more and bottled releases are preserved. Bottling continues to keep remainders until you choose what to do with them.

Use **Generate** beside **Name this blend** for a name inspired by your estate's region. Click again for another suggestion, or edit it before creating the blend.

The bottling preview and reveal include **Likely tasting notes**: aromas, body, acidity, tannins, vintage character, regional influence, and recorded fermentation and maturation. Steel, neutral oak, and French oak histories stay distinct through blending. Fruit expression varies by harvest year, with new harvests recording ripeness, vine health, and growing-season sunshine. Blends reflect each portion's grape ancestry and picking conditions. Each release saves its notes for the shop and wine history. Older wines without snapshots receive updated estimates, with missing harvest and aging history marked as unrecorded; existing snapshots stay intact. See [how tasting notes work](docs/tasting-notes.md).

A recipe’s potential score combines weighted source quality with **grape compatibility (−6 to +4 points)**. Grape choices and proportions matter: Bordeaux reds, Rhône partners, and Sauvignon Blanc–Sémillon complement each other; some contrasting styles lose points. Petit Verdot works as an accent but can overwhelm a recipe at high proportions. Unfamiliar pairings can be neutral, and a single grape can still make excellent wine. A final tasting adds −3 to +3 points, clamped to 0–100, and appears in an animated bottle reveal. A reserve is assessed once: additional bottles and reloads keep its score. Tasting character is fixed by grape, estate, and vintage, then weighted by volume. Renaming, splitting, or reblending the same wine cannot reroll it; tiny additions have only a proportional effect. Reblending calculates compatibility from the original recipe, without stacking previous bonuses. Bred varieties inherit their parents’ pairing tendencies through their ancestry. Reduced-motion users see the final score immediately.

**90+ is exceptional.** New starting harvests score 68–77 depending on region. Health, full ripeness, climate, matching soil, and grape finesse matter more than automatic cellar bonuses. Each finesse point contributes two harvest-quality points. Temperature control adds 3 points to new fermentations. Maturation adds at most 6 points, with grape-specific vessel routes and readiness windows. Well-suited steel routes can earn the full gain; excessive French-oak exposure can lower balance. Poor fruit cannot become a great wine just by waiting. High-finesse grapes, careful cultivation, breeding, and thoughtful blends provide routes into the 90s.

Existing grapes, stored recipes, and recorded bottle/tasting scores are preserved. Batches already in the cellar keep their original aging curve. New fermentations snapshot all three maturation routes, including full hybrid ancestry and lot context. Plans allow 1–12 game weeks; quality plateaus once ready, while over-oaking can still reduce it. Reserves and bottles do not deteriorate. See [maturation rules and save compatibility](docs/aging.md).

The blending bench previews the estimated range as you change quantities. Expand **Source quality & blending advice** for each grape and vintage's quality, its share, and the complementary, neutral, or conflicting pairings behind the score. Pair contributions reflect the current proportions; tiny additions have tiny effects. Different vintages of the same grape do not earn a pairing bonus. Saved tastings remain final even when current recipe analysis changes. See [blend compatibility](docs/blend-compatibility.md) for the game model, examples, and source inspiration.

Every stored lot has **Analyze & score**. Analysis is free; an optional **Taste & score · $60** fixes its final score before bottling, without consuming wine, kits, or game time. After tasting, use **Bottle this reserve** to create a release. The lot becomes **Tasting notes**, where its score remains available, including after partial bottling and reloading. You can also bottle an untasted reserve directly and reveal its score as usual. Independent judging in the wine shop is a separate review for the bottled release.

New wine lines offer visual label choices, bottle shapes, inks, finishes, paper tones, and an optional personal note; see [bottle designs](docs/bottle-designs.md). Existing lines reuse their design, note, and founding year. Every release has its own recipe, rating, original production quantity, and remaining stock. Sold-out releases stay in the archive. The prototype supports up to 1,000 releases, subject to a 2 MB save limit; actions that would exceed the save limit are rejected without consuming inventory.

Open **Wine shop → Wine history** to see every saved release, grouped by wine line, with bottles produced, sold, and remaining. Expand a release for its blend, source vintages, and bottling details. Line totals include both retail and wholesale sales; the archive also shows estate lifetime sales and current stock. **Current wines** contains releases with stock available. These same release counts appear in **Cellar → Wine lines**.

For older releases whose original production was never recorded, historical per-wine sales are marked **Unrecorded**. New sales are tracked and shown with a **+** to indicate an incomplete total. The estate lifetime sales counter keeps its existing history. No missing sales or production quantities are invented.

## Marketing and independent judging

Each release in **Wine shop → Current wines** offers two paid actions:

- **Send for marketing · $240**: a four-week campaign adds 40% to shop demand and $2 to the suggested shop price. List the wine first. The boost applies to the next four weekly sales, then expires; you can pay for another campaign afterward. Pausing the listing does not pause campaign weeks, and marketing does not improve wholesale offers.
- **Send for judging · $180**: enter a release once for an independent panel result in two weeks. Its score varies by up to five points from the original wine rating. Bronze (80+) adds $2 to suggested value and 10% demand; Silver (85+) adds $4 and 20%; Gold (90+) adds $6 and 30%. Below 80, the review remains on record without a bonus. Medals are permanent for that release and also improve wholesale offers. New releases in the same line need their own judging entry.

Set any whole-dollar shelf price from **$1 to $1,000** using the exact price field or slider. Valid changes save immediately; incomplete or invalid input returns to the saved price when you leave the field. Click **Suggested: $…** to apply the current suggestion. Marketing and medals raise willingness to pay; they do not change your chosen selling price automatically. Demand bonuses add together and still respond to pricing and stock. Prices far above suggested value can result in no sales; the forecast updates as you adjust. Fees are charged from estate funds, with no bottle consumption or extra cash awards.

Retail sales taper over several years from each release's bottling date. Underlying interest follows `20% + 80% × 2^(-weeks / 36)`: 100% at bottling, about 83% after one game year (12 weeks), 60% after three years, 40% after six, and 25% after twelve, approaching a lasting 20% audience. This is six times the previous decay period. Age alone does not reduce the wine's score, suggested value, or wholesale offer.

Actual demand moves above and below that longer curve. Shop traffic changes smoothly over 18-week periods (75–125%); individual grape popularity changes over 12-week periods (70–130%). Seasonal tastes favor whites in summer and reds in winter by up to 18%, weighted by the blend's composition. Three-week market windows can bring a wine fair (+45%) or quiet tourism (−35%); each has a 14% chance per window. Each grape-and-vintage customer pool also gets a weekly shopper variation of ±35%. Pricing, Prestige, the tasting terrace, marketing, and medals continue to apply. Sales are rounded down to whole bottles and capped by remaining stock.

The shop shows a **forecast range** for the next weekly sale, weeks since bottling, and the strongest market influence. Events show how many sales weeks remain. Judging results arriving that week can raise actual sales above the range. A dedicated saved market seed keeps forecasts and sales reproducible: reloading, renaming, changing prices back and forth, or unrelated cellar actions do not reroll shoppers. Pausing a listing does not freeze release age or the market. Each new release keeps its bottling date; equivalent grape and vintage releases share a weekly customer pool, so splitting bottles does not multiply demand. Older saves receive a default market seed and keep recorded bottling dates, inventory, funds, prices, and sales history.

Above **90 points**, suggested value includes a quadratic premium: each additional point adds more value than the previous one. Prestige strengthens that premium. For example, at 50 Prestige before medals or marketing:

| Bottle score | Suggested price |
| ------------ | --------------- |
| 90           | $31             |
| 91           | $38             |
| 92           | $56             |
| 95           | $183            |
| 98           | $417            |
| 100          | $634            |

This premium uses the original bottle score. Independent judging adds its medal's price and demand bonuses; it does not replace the bottle score. The same value curve feeds shop demand and wholesale offers. Existing releases gain the new suggested valuation while keeping their chosen shelf prices until you change them.

Campaign countdowns and judging results persist in saves. The panel's outcome is fixed when you enter, so reloading while waiting does not reroll it. The original bottle rating stays separate from the panel score; reviews and medals remain visible in **Wine history** and **Cellar → Wine lines**, including after sellout. Older saves start with no campaigns or judging entries and keep existing prices, funds, and inventory.

**Journal** contains the estate ledger, lifetime revenue, weekly upkeep, best vintage, seasonal cash results, and release margins. [Estate accounts](docs/finances.md) explains cost allocation, promotion expenses, inventory value, and older-save limitations. Neighboring work and business loans are retired; old saves keep their cash and transaction history, without further loan interest. The estate’s winemaker note suggests practical next steps based on current inventory and crops. There are no achievement targets or completion checklists.

## Prestige

**Prestige** replaces Reputation with a score that has no gameplay ceiling. Click it in the resource bar to see 16 named tiers, from **Two-Buck Beginning** and **Grocery Aisle Darling** to **Pétrus Pantheon**. Wine sales earn Prestige according to quality: shop sales range from -0.01 per disappointing bottle to +0.16 per exceptional bottle; wholesale ranges from 0 to +0.04. The shop explains buyer response, and the Journal tracks average quality sold. Tier titles follow the current total; they provide no cash awards or purchase unlocks.

Prestige improves suggested prices, shopper interest, and hospitality attendance. Benefits grow more slowly above 100, while the score continues accumulating beyond the last tier. Wine quality retains its separate 100-point rating. Existing saves keep their current score and assets. See the [Prestige rules and tier ladder](docs/prestige.md).

## Saves

- Every successful game action saves automatically to browser `localStorage` under `terroir.save.v1`.
- **Save & settings → Export save** downloads a JSON file. **Import save** validates the entire state and previews the estate before replacing the open game.
- A save contains the calendar, funds, plots, inventory, production, labels/prices, owned and suspended investments, orders, ledger, random-generator state, region, knowledge, research, breeding projects, complete custom-grape lineages, all estates and districts, the selected estate, purchased plot expansions and productive rows, wine origins, cellar bays, purchased tanks, and occupied tank assignments.
- Version-one through version-five saves migrate automatically to version six, with the original property retained as the home estate and existing 400 L tanks preserved. Existing land soils, vines, funds, inventory, and calendar are preserved; the legacy estate receives Bordeaux as its region. Old bottles keep their scores, prices, and stock, and become releases in house wine lines. Original production quantities are marked unrecorded when the old save did not track them. Previously unlocked grapes and owned investments remain available. Paid legacy collection studies keep their original remaining time and promised grape unlocks. Completed legacy techniques receive their new prerequisites. The storage key remains unchanged for compatibility.
- Old achievement metadata is accepted as inert save data; new games do not create it. Historical payouts and ledger entries remain intact.
- Invalid imports leave the current estate intact. Unreadable existing saves are preserved as a recovery copy when browser storage permits it. Failed storage writes show an explicit export reminder.
- Other tabs on the same origin adopt incoming saves and pause their timers.
- Saves are local to the browser and origin. There is no account or cloud synchronization. Export before clearing browser data, moving ports, deploying to a new address, or changing devices.
- JSON export and import were verified with a completed custom-grape estate in the in-app browser. Export was also verified in Chrome during the initial game validation. Browser host support may vary.

The **Guide** is available from the desktop sidebar and from Save & settings on all screen sizes.

## Code map

- `src/CellarEquipment.tsx` — shared tank purchasing and cellar expansion controls.
- `src/PlotExpansion.tsx` — individual plot enlargement, yield forecasts, and costs.
- `tests/plot-expansion.test.ts` — spring activation, scaled costs and crops, larger cellar batches, and save compatibility.

- `src/game.ts`: pure game transitions, economy, deterministic seasons, and versioned save validation.
- `src/market.ts`: longer release demand curves, seasonal tastes, grape popularity, visitor events, and reproducible weekly shopper variation.
- `src/App.tsx`: application shell, timer, persistence, import/export, and dialogs.
- `src/EstateMap.tsx`: interactive SVG estate districts and original vector art.
- `src/Holdings.tsx`, `src/estates.ts`, `src/holdings.css`: estate selection, district expansion, regional acquisitions, and parcel addressing.
- `tests/estates.test.ts`: estate migration, purchases, regional production, provenance, and full portfolio capacity.
- `src/prestige.ts`, `src/EstatePrestige.tsx`, `src/prestige.css`: uncapped Prestige, named tiers, economic influence, and the tier browser.
- `src/Panels.tsx`: vineyard inspector, production, pricing, and the estate ledger.
- `src/EstateInvestments.tsx`, `src/investments.ts`, `src/investments.css`: investment catalog, running costs, suspension, hospitality forecasts, and staff benefits.
- `tests/investments.test.ts`: investment economy, prerequisites, suspension, production and sales benefits, and save compatibility.
- `src/winemaking.ts`: reserve, recipe, label, and line schemas; exact volume allocation and blending quality.
- `src/Reserves.tsx`: reserve storage, blending bench, and bottling form.
- `src/blendPlanning.ts`, `src/BlendProportions.tsx`, `src/BlendTrials.tsx`: exact percentage allocation, batch sizing, and the saved trial notebook.
- `src/bottleStorage.ts`: bottled-stock capacity, shelf allocations, expansion terms, and legacy initialization.
- `src/BottleStoragePanel.tsx`, `src/ShelfAllocation.tsx`: warehouse and shelf controls in the cellar and shop.
- `src/WineLines.tsx`: searchable wine-line ledger and expandable release history, shared by the cellar and wine shop.
- `src/BlendAnalysis.tsx`: live recipe analysis, source-quality advice, and paid cellar tasting.
- `src/WinePresentation.tsx`: bottle artwork, provenance, and animated score reveal.
- `tests/blending.test.ts`: cross-vintage blending, partial bottling, inherited labels, tasting persistence, and migration.
- `tests/tasting.test.ts`: source analysis, tasting costs, fixed scores, and save integrity.
- `src/blendCompatibility.ts`: grape pairings, proportion effects, and inherited hybrid affinities.
- `tests/compatibility.test.ts`: complementary and conflicting recipes, proportions, ancestry, bounds, and preview-to-bottle consistency.
- `tests/quality.test.ts`: quality distribution, exceptional-wine progression, legacy maturation, and nonlinear pricing.
- `src/maturation.ts`, `src/BatchMaturation.tsx`: all 64 grape profiles, inherited readiness, vessel plans, costs, and oak balance.
- `src/grapeCharacter.ts`: shared grape and region character used by maturation and tasting notes.
- `tests/maturation.test.ts`: vessel balance, automatic transfers, capacity recovery, ancestry, treatment history, and old saves.
- `src/cellarTechniques.ts`, `src/GrapeArrival.tsx`: batch technique rules, progress labels, and per-harvest cellar choices.
- `src/catalog.ts`: 64 grape definitions, eight regions, and 97 research projects.
- `src/Regions.tsx`: new-estate region selection.
- `src/RegionLandscape.tsx`: distinct SVG postcards for all eight regions.
- `src/Research.tsx` and `src/ResearchProjects.tsx`: research departments, exact prerequisite navigation, active studies, and the study ledger.
- `src/researchPlanning.ts` and `src/ResearchDecisions.tsx`: outcome paths and economics, study payoffs, and the manual shortlist.
- `src/GrapeLibrary.tsx` and `src/BreedingNursery.tsx`: grape comparisons, introductory/full trials, and offspring previews.
- `src/ResearchExperiments.tsx` and `src/ResearchNotices.tsx`: optional experiments, persistent discoveries, and parcel-choice handoffs.
- `src/researchProgression.ts` and `src/research.css`: shared research terms, capability checks, and responsive ledger styles.
- `tests/research-progression.test.ts`: individual studies, unlock gates, long projects, and legacy migration.
- `tests/research-flow.test.ts`: outcome economics, shortlist persistence, introductory crosses, experiments, and save compatibility.
- `src/expansion.css`: region and research layouts, including responsive behavior.
- `tests/expansion.test.ts`: region, research, breeding, migration, and custom-wine tests.
- `src/components.tsx`: shared controls and accessible modal behavior.
- `tests/game.test.ts`: meaningful economy, lifecycle, capacity, and save-integrity checks.
- `docs/design-notes.md`: reference research, implemented choices, and possible future depth.
- `docs/validation.md`: browser scenarios and current verification evidence.

`npm run build` produces a static `dist/` directory that can be hosted on any static web host.
