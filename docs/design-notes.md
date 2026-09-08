# Design and mechanics

## Direction

**Visual thesis:** warm paper, muted vineyard greens, burgundy controls, and flat isometric illustrations create the atmosphere of a small countryside estate.

**Content plan:** the estate map is the main workspace; a parcel inspector exposes immediate choices; the cellar, shop, upgrades, and journal progressively reveal the production and business systems. New estates begin with a region picker; saved estates resume directly on the playable map.

**Interaction thesis:** selecting a parcel highlights its land and reveals its controls; ripeness and health animate when changed; harvest markers and fermentation bubbles gently identify active work. Transitions respect reduced-motion preferences. Mobile parcel selection scrolls to its inspector.

## References reviewed September 7, 2026

### Winery Simulator's published description

[Steam store page](https://store.steampowered.com/app/1533060/Winery_Simulator/)

The store describes restoring a neglected vineyard through vine care, harvest and processing choices, production upgrades, new grapes, labels, pricing, and reinvestment. It currently lists its release as “To be announced,” so this prototype draws on the published description rather than claiming to reproduce hands-on gameplay.

### Winemaking community feedback

[Original Reddit discussion](https://www.reddit.com/r/winemaking/comments/lt3f8h/winery_simulator_game_about_managing_your_own/)

Comments suggest tank availability as a planning constraint; the need to purchase bottling supplies before production stalls; quick wholesale sales versus higher margins; expensive equipment that changes workflow; the importance of tasting rooms and customer relationships; and geographically distinct vineyard parcels. Other ideas include graded wine, aging, blends, and an in-game encyclopedia.

These are community suggestions and anecdotes, not verified industry requirements. Game numbers below are invented for pacing and balance.

## Implemented decisions

| Decision                  | Tradeoff in this prototype                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Tend vines or save cash   | $90 improves health, which improves yield and harvest quality.                                                   |
| Harvest now or wait       | At least 80% ripe to harvest; more ripeness improves quality, but all unpicked fruit is lost at winter's start.  |
| Choose the right grape    | 24 varieties have soil, climate, resilience, finesse, and yield traits; matching soil adds 8 quality points.     |
| Sell grapes or make wine  | Grape wholesale supplies instant cash; winemaking requires fees, time, tank space, and bottles.                  |
| Steel or oak              | Steel costs $140; oak costs $320 and gains quality faster during aging.                                          |
| Bottle now or age         | Aging improves quality for up to 8 weeks but occupies a tank and incurs estate overhead.                         |
| Order ahead               | Bottling kits arrive a week after purchase.                                                                      |
| Retail or wholesale       | Retail gives price control and gradual sales; wholesale moves the stock at 60% of suggested price.               |
| Expand land or operations | More land increases harvest and upkeep; upgrades improve vine growth, tank capacity, quality, or visitor income. |
| Recover from low funds    | Neighbor work, a repayable loan, and emergency work prevent a permanent economic dead end.                       |

## Deliberately outside the first playable version

Blending, staff scheduling, contracts, equipment breakdowns, racking between tanks, oxidation/headspace management, wine-club subscriptions, arbitrary building placement, detailed chemistry, cloud accounts, and multiplayer are not implemented.

Useful next layers would be a blend workbench, rotating restaurant contracts, and hireable cellar staff. Each should deepen an existing decision before adding more navigation or currencies.

## Region and grape expansion

The second playable slice adds eight selectable regions, a 24-variety library, timed research, and persistent custom grape breeding. See [region sources and simulation rules](regions-and-research.md).
