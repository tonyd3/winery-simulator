# Terroir style guide

Terroir should feel like a small wine estate's illustrated field notebook: warm paper, vineyard greens, claret ink, expressive serif headings, and precise working information. The land and wine give each screen its character; controls stay quiet and easy to use.

This is the current design reference for contributors and coding agents. It records the direction embodied in the app, including the distinct regional landscapes. Follow it for future changes unless the user requests a new direction. Update this file alongside changes that establish a lasting convention.

## Start from the existing screen

Each screen has one main job and a clear next action. Keep the current content hierarchy when extending a flow:

| Surface                  | Composition to preserve                                                                                                       | Implementation reference                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| New estate               | Region choices beside a large illustrated preview, with regional details below it and the estate name/start action at the end | [Regions.tsx](../src/Regions.tsx), [expansion.css](../src/expansion.css)                                                    |
| Estate                   | Landscape as the main workspace, with parcel selection opening its inspector; resources and seasons provide context           | [EstateMap.tsx](../src/EstateMap.tsx), [App.tsx](../src/App.tsx), [styles.css](../src/styles.css)                           |
| Cellar and reserves      | Illustrated selectable vessels and a tank ledger; reserve rows and a blending or bottling workbench                                        | [Reserves.tsx](../src/Reserves.tsx), [BlendAnalysis.tsx](../src/BlendAnalysis.tsx), [winemaking.css](../src/winemaking.css) |
| Wine presentation        | Illustrated bottle, readable label, provenance, and a restrained score reveal                                                 | [WinePresentation.tsx](../src/WinePresentation.tsx)                                                                         |
| Research                 | Compact study ledger, optional outcome planning, and a filterable grape library                                               | [Research.tsx](../src/Research.tsx), [research.css](../src/research.css)                                                    |
| Dialogs and empty states | A focused title, short explanation, and useful action using the shared primitives                                             | [components.tsx](../src/components.tsx)                                                                                     |

Use spacing, alignment, typography, and thin dividers to group information. Tinted panels belong around a meaningful interaction, such as the blend bench or parcel inspector. Repeated records should usually be rows. Avoid adding a mosaic of independent cards, decorative hero sections to working screens, or extra badges that repeat information.

### Journal and estate guidance

The Journal opens to a vintage book, with **Accounts & events** keeping the financial ledger and dated event history one tab away. The book pairs the house crest, regional postcard and annual totals with release keepsakes and an editable year note. Use a two-page spread on desktop and stack the folio above the keepsakes on mobile. Records contain real harvests and bottlings; never invent missing history. Retain the latest six release keepsakes per year and annual totals independently of wine-history compaction. Explain where historical tracking began. See [VintageBook.tsx](../src/VintageBook.tsx) and [vintageJournal.ts](../src/vintageJournal.ts).

Unacknowledged warnings and production or research completions appear above the current workspace and pause time until acknowledged. Financial totals sit above full-width ledger rows. Keep entries readable on narrow screens. There are no neighboring-work or loan controls. The estate may show a contextual winemaker note for available actions; do not add achievement checklists, milestone targets, or completion bars.

### Cellar floor

Show occupied tank groups before empty tanks, keeping each batch together. Order occupied groups by their lowest tank number, then list empty tanks in tank-number order. Reapply this order as tanks fill or become available. See `Fermentation` in [Panels.tsx](../src/Panels.tsx).

[CellarFloor.tsx](../src/CellarFloor.tsx) presents those groups in an illustrated room, with steel or wood vessels reflecting the actual cellar plan. Keep volume, stage and estimated quality out of 100 visible, and open the existing batch controls in a shared modal when selected. Use the inspector's batch-quality calculation and explain that the estimate reflects time matured so far; do not imply an unselected future maturation plan. Include the score in the vessel's accessible name and the **Tank ledger**. Empty tanks have no score. Show eight groups per page on the illustrated floor. The Tank ledger shows every occupied group and empty tank in one continuous table, without pagination. A grouped batch depicts up to three vessels while its caption and inspector retain every reserved tank. Cases carry the house mark. On mobile, keep two vessel groups per row and scroll the ledger within its own region.

### Wine collection and house mark

Before the first 98+ point bottling, show one short Collector pricing hint above Current wines and beside the detail price range. Price inputs, steppers, sliders and suggestions share the current ceiling: $1,000 before that milestone, $10,000 afterward. Remove the hint once unlocked. Celebrate the first qualifying release once in [WinePresentation.tsx](../src/WinePresentation.tsx), with a readable status message after its score is revealed; reduced motion shows it immediately. Do not add repeated lock badges to every bottle.

[WineCollection.tsx](../src/WineCollection.tsx) gives bottles the main visual role in the shop: large original artwork, name, vintage, score and stock. Both Collection and Ledger put daily selling controls directly beside each release: whole-dollar price entry with $1 steppers and a suggested-price shortcut, plus shelf entry with 10-space steps, Max, List and Pause. Valid price and listed-wine shelf changes save immediately, including stepper and Max shortcuts. Keep price and shelf controls free of save reminders and Update buttons. Place the compact shelf limit beside its label instead of on a separate line below the controls. Invalid shelf drafts return to the saved quantity on blur. Listing a stored wine and pausing a listing remain explicit actions; choosing a quantity for an unlisted wine does not put it on sale. Keep these controls outside the bottle's detail button, with 44px touch targets and room for five-digit prices on narrow screens. See [WineQuickControls.tsx](../src/WineQuickControls.tsx) and [ShelfAllocation.tsx](../src/ShelfAllocation.tsx). Selecting a release opens its front/back label, detailed sales outlook, promotion and judging. Keep the bottle and its back note in normal document flow so long notes cannot overlap the controls on mobile.

The house identity editor is accessible from the top-bar crest and settings. Three emblems, three ink colors and up to three initials are cosmetic choices shared by the gate, cellar cases, journal and future bottlings. Snapshot the mark into each bottled release; changing the house must not repaint previous releases. See [IdentityEditor.tsx](../src/IdentityEditor.tsx), [HouseCrest.tsx](../src/HouseCrest.tsx) and [houseIdentity.ts](../src/houseIdentity.ts).

### Bottling supplies

Keep the bottling-supplies strip directly beneath the Cellar department navigation, visible in every department, including Reserves & blending. Group stock, incoming deliveries, and the explicit order action with its price and next-week delivery timing. On narrow screens, place a full-width order button beneath the supply details. See `Cellar` in [Panels.tsx](../src/Panels.tsx) and `.supply-strip` in [styles.css](../src/styles.css).

### Warehouse and shop shelves

Show bottled-wine capacity as fine-divided rows beneath the Cellar's bottling supplies and above the Wine shop's releases. Keep used/total counts, free space, and the priced expansion action together. State that warehouse totals include shelf stock; show full or excess-capacity guidance without hiding stored wine. Each release's labeled shelf-count input, initial List action when unlisted, and pause control sit together below pricing. Keep shelf autosaving consistent in the collection, ledger and wine details. Shelves refill weekly; communicate the sales ceiling without implying guaranteed demand. Stack capacity details and purchase controls on narrow screens. See [BottleStoragePanel.tsx](../src/BottleStoragePanel.tsx), [ShelfAllocation.tsx](../src/ShelfAllocation.tsx), and [bottle-storage.css](../src/bottle-storage.css).

### Blend planning and trials

Keep percentage and batch-size controls in a native disclosure inside the existing blend bench. Source lot names, available liters, percentage inputs, the total, and the maximum batch action belong together. Applying proportions returns keyboard focus to the bench heading. Present expected bottle yield and likely taste beside the existing quality analysis; distinguish estimates from a recorded tasting. See [BlendProportions.tsx](../src/BlendProportions.tsx) and [Reserves.tsx](../src/Reserves.tsx).

Saved bench trials use a full-width comparison ledger beneath the reserve workspace, with a quiet tint on the current recipe column. Keep source stock and the explicit use/remove actions within each trial's column. The table scrolls within its labeled, keyboard-focusable region on narrow screens; it must not widen the page. Reusing or removing a trial returns focus to the bench. See [BlendTrials.tsx](../src/BlendTrials.tsx), [blend-planning.css](../src/blend-planning.css), and the [planning rules](blend-planning.md).

### Private Collection

The Wine shop's **Private Collection** tab holds bottles set aside from sales. Reuse the bottle gallery and searchable ledger from [WineCollection.tsx](../src/WineCollection.tsx), showing kept quantities and the original artwork, vintage and score. Keep sales controls in Current wines. The release detail groups labeled **Set aside** and **Return to stock** quantities with explicit transfer buttons in [PrivateCollectionControls.tsx](../src/PrivateCollectionControls.tsx). Explain protection from shop and wholesale sales and continued warehouse usage nearby. Empty collections point to Current wines; private-only stock has its own empty-shop guidance. Preserve the existing bottle details, back note and judging status. Counts remain readable in the navigation at 360px; transfer rows stack labels above 44px controls on narrow screens.

### Wine lines and release history

In the bottling form, list existing wine lines alphabetically by name, with “Create a new wine line” first.

Wine lines and the shop's wine history share a searchable ledger in [WineLines.tsx](../src/WineLines.tsx), styled in [winemaking.css](../src/winemaking.css). Each line starts collapsed, with a small original bottle illustration, its name, release count, best score, stock, sales, and total profit. Profit includes compacted releases and uses the Journal's realized release margin; explain the excluded estate expenses once above the ledger. Open a line to show its five newest releases and reveal older releases in groups of five. Keep vintage, stock, and tasting score in each release summary; production totals, percentage sold, release age, judging, provenance, tasting notes, and personal winemaker notes belong inside its disclosure. [ReleaseFacts.tsx](../src/ReleaseFacts.tsx) groups revenue, profit, per-bottle results, and costs with fine dividers. Preserve sold-out releases and incomplete historical records; show unavailable profit as “Unrecorded” and never infer past revenue from the current price. On narrow screens, stack the line totals beneath its name, use two columns for release financial figures, and let release details use the full width. Avoid placing a tall release history beside a vertically centered bottle and label.

### Prestige

Prestige is an uncapped estate score, separate from 100-point wine quality. Keep its current tier visible beneath the score on desktop and mobile. The resource is a keyboard-accessible button opening a ledger of 16 named tiers with thresholds and one current-tier highlight. Use the shared modal and existing paper/ink styling; omit achievement checklists, claim buttons, and cash rewards. See [EstatePrestige.tsx](../src/EstatePrestige.tsx) and [prestige.css](../src/prestige.css).

### Investment decisions

Build groups facilities and staff in department-filtered ledger rows, implemented in [EstateInvestments.tsx](../src/EstateInvestments.tsx) and [investments.css](../src/investments.css). Keep upfront prices, operating costs, suspended maintenance, prerequisites, and purchase/resume actions together. The budget summary separates hospitality income from wine sales and distinguishes forecasts from guaranteed returns. On narrow screens, stack purchase details beneath each description; retain readable long prices and disabled reasons.

Land & estates quotes the current district price consistently across every estate and shows the following regional acquisition price beside the purchase flow. Explain once that added districts share a portfolio-wide price curve. Keep current prices, upkeep, and affordability together; use the same cost helpers as the purchase actions. See [Holdings.tsx](../src/Holdings.tsx) and [estates.ts](../src/estates.ts).

### Estate framing

Keep estate-wide **Tend all** and **Harvest all ready** controls above the map with their total price, eligible parcel count and disabled reason. A compact parcel ledger shows labeled ripeness and vine-health percentages beside thin bars, followed by estimated grape quality out of 100 using the same current-conditions calculation as the parcel forecast. Harvested and dormant states use words instead of a misleading zero percent or quality estimate. Selecting a row opens that parcel, including across districts. Scope the controls visibly to the current estate. On narrow screens, place the parcel name above its two meters and the quality score below them; let action buttons wrap at a 44px minimum height. See [EstateFieldwork.tsx](../src/EstateFieldwork.tsx) and [fieldwork.css](../src/fieldwork.css). These are crop measurements, not achievement progress.

Place **Harvest grapes** and **Tend the vines** directly below the selected parcel's name and area, before grape details and forecasts. Keep the pair in one sticky action group with visible prices, readiness guidance, and at least 44px-high buttons. On desktop it stays within the scrolling inspector; on mobile it stays at the top while the player reads the parcel. Preserve disabled and completion states. See `PlotInspector` in [Panels.tsx](../src/Panels.tsx) and `.parcel-actions` in [styles.css](../src/styles.css).

Growing parcels show a compact grape-quality forecast after vine health, using fine dividers, one display score, and the expected kilograms. Keep owned upgrade contributions in a native disclosure with visible health/ripeness requirements or suspension status. Label the score as an estimate at current conditions, hide it for resting and dormant parcels, and link the quality action to Build. See [HarvestForecast.tsx](../src/HarvestForecast.tsx) and [harvest.css](../src/harvest.css).

The desktop estate workspace has a viewport-based height that stays fixed while switching parcels. Long parcel details scroll inside the inspector; its children must not shrink to fit. Plot selection updates the highlight and details while preserving the map framing and manual zoom. At 620px and below, the map and inspector stack: the map keeps its 350px height and the details use normal page scrolling. See `.estate-workspace` and `.plot-inspector` in `styles.css`.

### Research decisions

Research uses branch-filtered ledger rows with a description and linked prerequisites beside a compact cost/duration/action column. [ResearchProjects.tsx](../src/ResearchProjects.tsx) and [research.css](../src/research.css) own this layout. Keep the first study close to the top: one page heading and a short resource line, with instructions inside native disclosures. A prerequisite opens that exact study and gives it keyboard focus; retain a clear way back to the branch. Show **Paid** for an active study instead of presenting the current catalog price as its historical payment.

Keep the slot count, additional-slot purchase, and all active studies visible across the project, grape-library, and nursery tabs. Group current studies in one tinted ledger with fine dividers; each row has its own remaining game weeks and pause/resume and abandon controls. Show the slot purchase cost, affordability, and capacity limit beside its action. Paused studies retain their slots, and abandoning requires the existing no-refund confirmation for that named study. Optional experiments expand within their study, with eligibility, resource consumption, observation progress, and one-time reward stated beside the action.

The outcome planner and five-item **Study next** shortlist use compact disclosures and ordered rows, implemented in [ResearchDecisions.tsx](../src/ResearchDecisions.tsx). Separate unpaid research, follow-on purchases, and trial costs. Explain time assumptions and operating costs; do not present an optimistic research duration as a promised finish date. Shortlisting never starts a study or spends resources.

[ResearchNotices.tsx](../src/ResearchNotices.tsx) keeps discoveries visible until dismissed, with earlier notices in a disclosure. Each notice leads to a relevant study, facility, cellar task, or parcel choice. Choosing a grape opens a parcel review before planting; selecting a destination must never remove vines or purchase anything automatically.

[GrapeLibrary.tsx](../src/GrapeLibrary.tsx) keeps filters together above comparable ledger rows. Climate, growing traits, planting price, and study terms stay distinct; stack them below the grape name on narrow screens. Region selection changes climate and planting comparisons, while research discounts still use the home region. [BreedingNursery.tsx](../src/BreedingNursery.tsx) shows both parents and the offspring preview before the name and purchase action. Distinguish fixed traits from randomly inherited color and soil; keep the introductory trial's limits and the advanced research gates visible.

## Color and surfaces

The shared token definitions live in `:root` in [styles.css](../src/styles.css). Use these CSS variables for new interface styling. Keep the definitions there rather than maintaining a second palette in JSON or another stylesheet.

| Token     | Current value                | Role                                                               |
| --------- | ---------------------------- | ------------------------------------------------------------------ |
| `--paper` | `#f8f7f2`                    | Main warm paper background                                         |
| `--ink`   | `#3d4639`                    | Primary text and strong labels                                     |
| `--muted` | `#68705f`                    | Readable secondary text and quieter controls |
| `--wine`  | `#784759`                    | Primary actions, active controls, and links                        |
| `--line`  | `#e5e5da`                    | Fine dividers and structural borders                               |
| `--green` | `#768764`                    | Vineyard and growth accents                                        |
| `--serif` | `'Fraunces', Georgia, serif` | Display typography                                                 |

Existing secondary surfaces include `#fbfaf5` for the parcel inspector, `#f1eee5` for the blend bench, and `#fcfbf5` for dialogs. These are component values, not additional shared tokens. Match the relevant component; promote a value to a named token when it gains a reusable role. Do not add another nearly identical hex value for each new screen.

Use the wine accent consistently across regions. The artwork can shift from cool blue-green to ochre and terracotta while the surrounding controls retain their identity. Grape colors, gold harvest/score details, and error colors communicate their own meaning and need not use the action accent.

Keep text darker than decorative accents. Some existing metadata is small or pale; that is not a requirement to repeat poor readability. Improve contrast or size where needed, and pair color-coded status with text or an icon. Prefer flat fills and subtle tonal differences. Avoid neon colors, glossy gradients, glass panels, or dark backgrounds introduced as decoration.

## Typography and copy

Use only the two existing font families:

- **Fraunces**, through `var(--serif)`, for the wordmark, page and section headings, estate/wine names, and selected prominent figures. Prefer weights 400–500 and the existing gentle negative tracking for large headings.
- **DM Sans**, inherited from the root, for body text, buttons, forms, navigation, labels, and working data. Prefer weights 400–500, with stronger weights for emphasis.

The root text size is currently 14px. Existing section headings are commonly 23–34px; the region setup heading scales from 40–66px. These are reference ranges, not a demand to resize every screen. Reserve the largest type for onboarding and major page titles. Keep body copy comfortably readable, usually with 1.5–1.8 line height, and increase compact text where the screen needs it.

Use the existing `.eyebrow` treatment for short uppercase context labels. Do not set instructions or whole paragraphs in spaced capitals. Align comparable quantities and use tabular numerals where changing numbers would otherwise shift the layout. Keep units beside values.

Write with the calm, practical voice of a winemaker explaining the next step. A heading such as “Every wine starts somewhere.” can establish atmosphere on setup; working controls should say what happens: “Harvest grapes,” “Move to reserves,” or “Bottle this reserve.” Show relevant cost or consequence beside the action. Keep instructions short, preserve regional names and accents, and distinguish estimates from recorded results. Do not expose implementation terminology or invent progress, scores, or functionality for visual effect.

## Spacing, borders, and controls

Match the surrounding screen's rhythm. Common existing values are 6–10px within a compact control, 12–18px between closely related items, 24–34px for section padding, and larger gaps between primary columns. These are useful starting points, not a new spacing-token system.

Use mostly square or gently rounded shapes. Buttons currently use a 5px radius, inputs 6px, and the blend bench 4px. Dialogs and the brand mark have softer corners. Reserve pills and circles for small counts, swatches, seals, or other existing treatments. Use one-pixel borders and restrained shadows for overlays; ordinary rows do not need elevation.

Reuse the existing primitives and classes:

- `.button.primary`: wine fill with light text for the main action in a decision area.
- `.button.secondary`: light paper fill and a fine border for supporting actions.
- `.text-button`: lower-emphasis inline actions, such as generation, inspection, and navigation.
- `Modal`, `Empty`, and `Progress` from [components.tsx](../src/components.tsx): retain their established structure and behavior.
- Lucide icons: match neighboring line weights and sizes; the shared `Icon` defaults to 20px with a 1.7 stroke. Keep icon-only controls accessible by name.

Place costs, availability, and disabled-state explanations close to the relevant control. Preserve semantic buttons, associated input labels, visible focus indicators, and the modal's Escape, focus-trapping, and focus-restoration behavior. Do not shrink touch targets to preserve a dense desktop arrangement.

## Illustration language

Artwork is original SVG kept in the repository. Use broad flat silhouettes, layered terrain, limited earthy palettes, and a small amount of shadow or highlight. Details should remain legible at the displayed size. Vine rows, field boundaries, trees, paths, roofs, and bottle labels carry the visual story.

The estate uses an isometric map; regional previews use landscape postcards; wine presentation uses a front-facing bottle. Preserve the perspective of the surface being edited. Reuse small drawing primitives where helpful without forcing distinct scenes into one template. Avoid substituting stock photography, emoji scenery, photorealistic renders, or an external image service for these illustrations as part of routine work.

### Bottle identity

Bottle choices retain a flat SVG silhouette with restrained highlights. The six shapes, six label motifs, neck finishes, and back label are implemented in [BottleArtwork.tsx](../src/BottleArtwork.tsx) and [WinePresentation.tsx](../src/WinePresentation.tsx). Keep botanical vines, divided vineyard parcels, and arched vintage labels visually distinct. Reuse the shared wine-name, vintage, and release text placement, fit labels within the glass, and give clipping paths unique IDs. Artwork and finishes are cosmetic; the chooser must not imply a different bottle volume or wine quality.

The studio in [BottleDesigner.tsx](../src/BottleDesigner.tsx) uses label-art thumbnails, shape silhouettes, and named ink swatches with visible selected states. Keep the complete looks, optional finishing touches, and personal back note in native disclosures; use labeled selects for finish and paper. The large preview stays beside the form on desktop and precedes it on mobile. Keep tasting details in a disclosure while designing. **Read back label** turns the bottle with a brief entrance and preserves button focus; repeat the note outside the SVG at a readable size. Thumbnails may lift slightly on hover. Disable turn and hover transitions for reduced motion. [bottle-studio.css](../src/bottle-studio.css) owns these details; [bottle designs](bottle-designs.md) lists the combinations and persistence rules.

### Regional identity

[RegionLandscape.tsx](../src/RegionLandscape.tsx) owns the regional postcards. [EstateScenery.tsx](../src/EstateScenery.tsx) carries these identities into the playable maps with distinct terrain, architecture and trees. Seasonal ground and foliage follow the game calendar, with bare deciduous trees in winter and brief mist under wet or overcast weather. Harvest crates appear only while the estate has fresh grapes. Keep parcel hit targets, selection, and map framing stable as scenery changes. A selection must visibly change the composition and geography as well as the palette. Each region should be distinguishable at a glance even if its label is hidden.

| Region      | Defining visual cues                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| Bordeaux    | Broad estuary, formal vineyard rows, slate-roofed château, cool Atlantic sky                 |
| Burgundy    | Small walled parcels, limestone slopes, stone village and tiled church tower                 |
| Napa Valley | Wide valley between wooded ridges, straight rows, oak tree and timber winery                 |
| Mosel       | Broad blue river bend, steep terraced slopes, hilltop castle and riverside village           |
| Tuscany     | Rolling golden hills, terracotta-roofed villa and a winding cypress-lined lane               |
| Rioja       | Rugged limestone ridge, red-earth vineyards and a sandstone village with a square bell tower |
| Mendoza     | Snow-covered Andes, dry foothills, irrigated vines, poplars and an adobe winery              |
| Barossa     | Open golden country, rusty soil, stone farmhouse and a spreading gum tree                    |

These are stylized regional cues, not exact site reconstructions. When adding a region, define its terrain, vineyard arrangement, architecture, vegetation, and palette before drawing it. Keep region descriptions and visible scenery consistent.

The postcards use a `640 × 400` viewBox and an `8 / 5` aspect ratio. Fill the preview frame; retain `preserveAspectRatio="xMidYMid slice"` unless a deliberate framing change calls for another approach. Check that responsive cropping preserves the landmarks and the country label stays readable. Do not restore fixed-color bars around the artwork. Give meaningful SVGs descriptive accessible names and use unique IDs, such as React `useId`, for reusable clipping paths.

## Batch technique choices

Keep optional cellar recipes inside a native disclosure beneath each harvest row. The main fermentation action always shows the complete charge, tank allocation, and total weeks, even with the recipe collapsed. Expanded recipes use fine-divided rows with a labeled checkbox, a concrete style effect, time and per-tank cost, and a direct study link when locked. Stack terms below their technique on narrow screens. Preserve the distinction between character and quality points. See [GrapeArrival.tsx](../src/GrapeArrival.tsx) and [winemaking.css](../src/winemaking.css). Tank status names the current step; tasting notes list the treated proportion when wine is blended.

Keep fermentation choices local to each harvest. Once its cellar plan finishes, group maturation advice, vessel, suggested release window, duration, automatic transfer, and total charge inside that batch's existing card. Use native labeled controls and a fine divider; selecting one batch must not change another. Readiness and oak influence are separate plain-language messages. On narrow screens, stack duration and automatic transfer. Wood maturation uses the label “Cellar slot” and explains the included barrel service; owned tanks remain equipment. See [BatchMaturation.tsx](../src/BatchMaturation.tsx) and `.batch-maturation` in [winemaking.css](../src/winemaking.css).

Place **Select all available** and **Clear all** in a quiet, wrapping action row above the technique checkboxes. Include French oak in the selection count and name it in the collapsed summary. Remember the last choices by grape variety on this browser, explain that scope beside the shortcuts, and filter out locked studies when restoring choices. Newly opened harvests reuse these defaults; harvests already on screen stay independent. Keep prices and durations visible before fermentation. See [cellarPreferences.ts](../src/cellarPreferences.ts).

### Vintage tasting notes

The shared [TastingNotes.tsx](../src/TastingNotes.tsx) keeps aromas above fine-divided Palate, Vintage, Origins, Ferment, Aging, and optional Cellar rows. Describe each vintage within its grape's character, using recorded picking conditions when available. State the recorded share in blends and mark missing harvest history as estimated. Show the recorded parcel name and soil beneath grape, vintage, and estate metadata in harvests, cellar batches, and wine recipes. Keep distinct parcel shares visible in blends and release provenance; label older lots without a record “Parcel unrecorded.” Let source labels wrap on narrow screens while percentages stay readable. Keep saved release notes stable; do not imply that viewing or waiting changes the wine. See [tasting-notes.md](tasting-notes.md) for the model and save behavior.

## Motion and responsive behavior

Use short motion to explain a change: a selected row changes emphasis, a region scene enters, an inspector appears, or a score is revealed. Ordinary controls currently transition in roughly 160–200ms, region art in 400ms, and the special bottle arrival in 750ms. Match those relationships instead of applying the longest animation everywhere. Avoid scroll theatrics or continuous decorative motion on working screens.

Respect `prefers-reduced-motion`. CSS already disables animation and transitions globally for that preference; JavaScript-driven reveals must also make their result available without waiting for an animation.

Adapt to available space instead of scaling down the entire interface. Reuse the relevant stylesheet's breakpoints: setup changes at 1000, 780, and 620px; the reserve workspace stacks at 950px and has narrower adjustments at 600px. Other estate-shell breakpoints are defined in `styles.css`; there is no single universal breakpoint set to impose on every component.

Keep the task sequence and important actions available when columns stack. Let long estate and wine names wrap, keep quantities and units readable, and prevent controls from overflowing. The current body has a 360px minimum width; check changes at that narrow width when affected. The palette and illustration language should remain consistent across screen sizes.

## Implementation and review

The app uses React, TypeScript, and plain CSS. Shared styles live in [styles.css](../src/styles.css), region/research styles in [expansion.css](../src/expansion.css), and cellar/bottle styles in [winemaking.css](../src/winemaking.css). [main.tsx](../src/main.tsx) imports them in that order, followed by [prestige.css](../src/prestige.css) for the resource and tier dialog, and [atmosphere.css](../src/atmosphere.css) for the illustrated working spaces, house marks, vintage book and readability. Check later overrides before assuming an earlier rule is the rendered value.

Extend an existing component or class when its role matches. Keep new rules near the related feature and name classes by their role. Use inline styles for data-dependent values, such as composition proportions or grape colors; put reusable presentation rules in CSS. A routine feature should not introduce another CSS framework, font family, icon set, or animation dependency.

For each UI change:

1. Read this guide and the relevant source references. Identify the existing pattern the change should extend.
2. Inspect the affected screen before editing, then compare it with the result using the same state and viewport. Keep temporary screenshot evidence outside the product source unless requested otherwise.
3. Exercise the actual action and its relevant selected, empty, disabled, error, or completion states. For regional art, check every affected region, selection/details agreement, and frame coverage.
4. Check narrow layouts when affected, including long labels, touch access, focus, and reduced motion when changing animation. Do not sacrifice legibility to match an old screenshot.
5. Run `npm run build` for code or CSS changes and `npm test` when behavior changes. State any verification that could not be completed. Documentation-only changes need link and reference checks rather than a build.

When a requested change establishes a new convention, update this guide and the relevant shared implementation together. Keep historical rationale in [design-notes.md](design-notes.md). Prefer a small set of maintained rules and concrete source examples over another parallel design system.
