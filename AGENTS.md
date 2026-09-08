# Working on Terroir

## UI and design

Before changing UI, CSS, illustration, animation, or player-facing copy, read [docs/style-guide.md](docs/style-guide.md) and inspect the relevant existing component and stylesheet. That guide records the project's visual decisions and names the implementation references.

Preserve these defaults:

- Warm paper surfaces, green-black ink, muted vineyard greens, and one wine-colored action accent.
- Fraunces for expressive headings and selected display numbers; DM Sans for controls, body text, and data.
- Spacious composition with fine dividers, compact controls, and ledger-like rows. Add a panel when it groups an interaction, rather than boxing every piece of content.
- Original SVG artwork with flat shapes and restrained shading. Regional landscapes must differ in terrain, composition, architecture, and vegetation as well as color.
- Clear action labels, visible focus, keyboard access, readable text, and reduced-motion support.

Reuse the tokens in `src/styles.css` and shared primitives in `src/components.tsx`. Follow the neighboring screen's layout and interaction patterns before introducing a new one. Generic design suggestions should be adapted to this house style; they are not a reason to replace its fonts, illustration medium, or page composition.

Explicit user requests can change the direction. Implement the requested change and update the style guide when it establishes a lasting convention. Routine work within the existing direction needs no separate design approval.

## Scope and verification

- Preserve unrelated working changes. Keep visual work separate from simulation and save-format changes unless the task requires both.
- For visual changes, inspect the actual affected screen before and after, and exercise the changed interaction. Check narrow layouts when responsive behavior is affected; see the guide's review checklist.
- Run `npm run build` for code or CSS changes. Run `npm test` when behavior or game logic changes. For documentation-only work, verify links and implementation references; a build is unnecessary.
- Report what was verified and any remaining limitation. Do not describe an untested screen as verified.

## Documentation

[README.md](README.md) covers setup and the code map. [docs/style-guide.md](docs/style-guide.md) is the current design reference. [docs/design-notes.md](docs/design-notes.md) preserves historical research and early gameplay decisions; its initial feature scope and balance numbers are not a current specification.
