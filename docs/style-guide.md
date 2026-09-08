# Terroir style guide

Terroir should feel like a small wine estate's illustrated field notebook: warm paper, vineyard greens, claret ink, expressive serif headings, and precise working information. The land and wine give each screen its character; controls stay quiet and easy to use.

This is the current design reference for contributors and coding agents. It records the direction embodied in the app, including the distinct regional landscapes. Follow it for future changes unless the user requests a new direction. Update this file alongside changes that establish a lasting convention.

## Start from the existing screen

Each screen has one main job and a clear next action. Keep the current content hierarchy when extending a flow:

| Surface                  | Composition to preserve                                                                                                       | Implementation reference                                                                                                    |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| New estate               | Region choices beside a large illustrated preview, with regional details below it and the estate name/start action at the end | [Regions.tsx](../src/Regions.tsx), [expansion.css](../src/expansion.css)                                                    |
| Estate                   | Landscape as the main workspace, with parcel selection opening its inspector; resources and seasons provide context           | [EstateMap.tsx](../src/EstateMap.tsx), [App.tsx](../src/App.tsx), [styles.css](../src/styles.css)                           |
| Cellar and reserves      | Ledger rows with quantities and actions; a distinct workbench for blending or bottling                                        | [Reserves.tsx](../src/Reserves.tsx), [BlendAnalysis.tsx](../src/BlendAnalysis.tsx), [winemaking.css](../src/winemaking.css) |
| Wine presentation        | Illustrated bottle, readable label, provenance, and a restrained score reveal                                                 | [WinePresentation.tsx](../src/WinePresentation.tsx)                                                                         |
| Research                 | Notebook sections, clear prerequisites, and a browsable grape library                                                         | [Research.tsx](../src/Research.tsx), [expansion.css](../src/expansion.css)                                                  |
| Dialogs and empty states | A focused title, short explanation, and useful action using the shared primitives                                             | [components.tsx](../src/components.tsx)                                                                                     |

Use spacing, alignment, typography, and thin dividers to group information. Tinted panels belong around a meaningful interaction, such as the blend bench or parcel inspector. Repeated records should usually be rows. Avoid adding a mosaic of independent cards, decorative hero sections to working screens, or extra badges that repeat information.

### Journal and estate guidance

The Journal pairs accounts with a dated history of important estate events. Unacknowledged warnings and production or research completions appear above the current workspace and pause time until acknowledged. Financial totals sit above full-width ledger rows. Keep entries readable on narrow screens. There are no neighboring-work or loan controls. The estate may show a contextual winemaker note for available actions; do not add achievement checklists, milestone targets, or completion bars.

### Bottling supplies

Keep the bottling-supplies strip directly beneath the Cellar department navigation, visible in every department, including Reserves & blending. Group stock, incoming deliveries, and the explicit order action with its price and next-week delivery timing. On narrow screens, place a full-width order button beneath the supply details. See `Cellar` in [Panels.tsx](../src/Panels.tsx) and `.supply-strip` in [styles.css](../src/styles.css).

### Wine lines and release history

Wine lines and the shop's wine history share a searchable ledger in [WineLines.tsx](../src/WineLines.tsx), styled in [winemaking.css](../src/winemaking.css). Each line starts collapsed, with a small original bottle illustration, its name, release count, stock, and sales totals in one row. Open a line to show its five newest releases and reveal older releases in groups of five. Keep vintage, stock, and tasting score in each release summary; production totals, judging, provenance, and tasting notes belong inside its disclosure. Preserve sold-out releases and incomplete historical sales indicators. On narrow screens, stack the line totals beneath its name and let release details use the full width. Avoid placing a tall release history beside a vertically centered bottle and label.

### Prestige

Prestige is an uncapped estate score, separate from 100-point wine quality. Keep its current tier visible beneath the score on desktop and mobile. The resource is a keyboard-accessible button opening a ledger of 16 named tiers with thresholds and one current-tier highlight. Use the shared modal and existing paper/ink styling; omit achievement checklists, claim buttons, and cash rewards. See [EstatePrestige.tsx](../src/EstatePrestige.tsx) and [prestige.css](../src/prestige.css).

### Investment decisions

Build groups facilities and staff in department-filtered ledger rows, implemented in [EstateInvestments.tsx](../src/EstateInvestments.tsx) and [investments.css](../src/investments.css). Keep upfront prices, operating costs, suspended maintenance, prerequisites, and purchase/resume actions together. The budget summary separates hospitality income from wine sales and distinguishes forecasts from guaranteed returns. On narrow screens, stack purchase details beneath each description; retain readable long prices and disabled reasons.

### Estate framing

Growing parcels show a compact grape-quality forecast after vine health, using fine dividers, one display score, and the expected kilograms. Keep owned upgrade contributions in a native disclosure with visible health/ripeness requirements or suspension status. Label the score as an estimate at current conditions, hide it for resting and dormant parcels, and link the quality action to Build. See [HarvestForecast.tsx](../src/HarvestForecast.tsx) and [harvest.css](../src/harvest.css).

The desktop estate workspace has a viewport-based height that stays fixed while switching parcels. Long parcel details scroll inside the inspector; its children must not shrink to fit. Plot selection updates the highlight and details while preserving the map framing and manual zoom. At 620px and below, the map and inspector stack: the map keeps its 350px height and the details use normal page scrolling. See `.estate-workspace` and `.plot-inspector` in `styles.css`.

### Research decisions

Research uses branch-filtered ledger rows with a description and linked prerequisites beside a compact cost/duration/action column. `ResearchProjects.tsx` and `research.css` own this layout. Keep the slot count, additional-slot purchase, and all active studies visible across the project, grape-library, and nursery tabs. Group current studies in one tinted ledger with fine dividers; each row has its own remaining game weeks and pause/resume and abandon controls. Show the slot purchase cost, affordability, and capacity limit beside its action. Paused studies retain their slots, and abandoning requires the existing no-refund confirmation for that named study. Keep discovery and investment costs separate. Grape-library climate and study terms must occupy separate columns; stack them under the grape name on narrow screens.

## Color and surfaces

The shared token definitions live in `:root` in [styles.css](../src/styles.css). Use these CSS variables for new interface styling. Keep the definitions there rather than maintaining a second palette in JSON or another stylesheet.

| Token     | Current value                | Role                                                               |
| --------- | ---------------------------- | ------------------------------------------------------------------ |
| `--paper` | `#f8f7f2`                    | Main warm paper background                                         |
| `--ink`   | `#3d4639`                    | Primary text and strong labels                                     |
| `--muted` | `#939586`                    | Subdued secondary accents; check readability before using for text |
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

The root text size is currently 13px. Existing section headings are commonly 23–34px; the region setup heading scales from 40–66px. These are reference ranges, not a demand to resize every screen. Reserve the largest type for onboarding and major page titles. Keep body copy comfortably readable, usually with 1.5–1.8 line height, and increase compact text where the screen needs it.

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

### Regional identity

[RegionLandscape.tsx](../src/RegionLandscape.tsx) owns the regional postcards. A selection must visibly change the composition and geography as well as the palette. Each region should be distinguishable at a glance even if its label is hidden.

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

### Vintage tasting notes

The shared [TastingNotes.tsx](../src/TastingNotes.tsx) keeps aromas above fine-divided Palate, Vintage, Origins, Ferment, Aging, and optional Cellar rows. Describe each vintage within its grape's character, using recorded picking conditions when available. State the recorded share in blends and mark missing harvest history as estimated. Keep saved release notes stable; do not imply that viewing or waiting changes the wine. See [tasting-notes.md](tasting-notes.md) for the model and save behavior.

## Motion and responsive behavior

Use short motion to explain a change: a selected row changes emphasis, a region scene enters, an inspector appears, or a score is revealed. Ordinary controls currently transition in roughly 160–200ms, region art in 400ms, and the special bottle arrival in 750ms. Match those relationships instead of applying the longest animation everywhere. Avoid scroll theatrics or continuous decorative motion on working screens.

Respect `prefers-reduced-motion`. CSS already disables animation and transitions globally for that preference; JavaScript-driven reveals must also make their result available without waiting for an animation.

Adapt to available space instead of scaling down the entire interface. Reuse the relevant stylesheet's breakpoints: setup changes at 1000, 780, and 620px; the reserve workspace stacks at 950px and has narrower adjustments at 600px. Other estate-shell breakpoints are defined in `styles.css`; there is no single universal breakpoint set to impose on every component.

Keep the task sequence and important actions available when columns stack. Let long estate and wine names wrap, keep quantities and units readable, and prevent controls from overflowing. The current body has a 360px minimum width; check changes at that narrow width when affected. The palette and illustration language should remain consistent across screen sizes.

## Implementation and review

The app uses React, TypeScript, and plain CSS. Shared styles live in [styles.css](../src/styles.css), region/research styles in [expansion.css](../src/expansion.css), and cellar/bottle styles in [winemaking.css](../src/winemaking.css). [main.tsx](../src/main.tsx) imports them in that order, followed by [prestige.css](../src/prestige.css) for the resource and tier dialog. Check later overrides before assuming an earlier rule is the rendered value.

Extend an existing component or class when its role matches. Keep new rules near the related feature and name classes by their role. Use inline styles for data-dependent values, such as composition proportions or grape colors; put reusable presentation rules in CSS. A routine feature should not introduce another CSS framework, font family, icon set, or animation dependency.

For each UI change:

1. Read this guide and the relevant source references. Identify the existing pattern the change should extend.
2. Inspect the affected screen before editing, then compare it with the result using the same state and viewport. Keep temporary screenshot evidence outside the product source unless requested otherwise.
3. Exercise the actual action and its relevant selected, empty, disabled, error, or completion states. For regional art, check every affected region, selection/details agreement, and frame coverage.
4. Check narrow layouts when affected, including long labels, touch access, focus, and reduced motion when changing animation. Do not sacrifice legibility to match an old screenshot.
5. Run `npm run build` for code or CSS changes and `npm test` when behavior changes. State any verification that could not be completed. Documentation-only changes need link and reference checks rather than a build.

When a requested change establishes a new convention, update this guide and the relevant shared implementation together. Keep historical rationale in [design-notes.md](design-notes.md). Prefer a small set of maintained rules and concrete source examples over another parallel design system.
