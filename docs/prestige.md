# Prestige

Prestige is the winery business's shared standing, replacing the former Reputation stat. It starts at 12 and has no gameplay ceiling. The current tier appears beneath the score in the resource bar; clicking it pauses time and opens the full tier ladder.

## Earning and losing Prestige

Sales now build trust according to the wine's quality. Shop buyers can lose confidence in disappointing wine; wholesale does not penalize Prestige.

| Quality | Response      | Shop Prestige per bottle | Wholesale per bottle |
| ------- | ------------- | -----------------------: | -------------------: |
| 0–59    | Disappointing |                    -0.01 |                    0 |
| 60–69   | Everyday wine |                    +0.01 |                    0 |
| 70–79   | Well made     |                    +0.03 |                +0.01 |
| 80–89   | Fine wine     |                    +0.06 |                +0.02 |
| 90–94   | Outstanding   |                    +0.10 |                +0.03 |
| 95–100  | Exceptional   |                    +0.16 |                +0.04 |

Sales earnings are rounded to two decimal places and Prestige cannot fall below zero. Bankruptcy ends the estate; it provides no emergency payment or Prestige penalty. The shop describes the buyer response for each release. The Journal records average quality weighted by bottles sold through either channel. Older sales are not reconstructed, and existing Prestige is preserved.

Titles are descriptive. Crossing a threshold gives no cash award, purchase unlock, or additional modifier. Prestige continues accumulating beyond the final title. Wine quality and independent judging retain their separate 100-point scales.

## Tier ladder

| Tier | Minimum Prestige | Name                  |
| ---- | ---------------: | --------------------- |
| 1    |                0 | Two-Buck Beginning    |
| 2    |               25 | Grocery Aisle Darling |
| 3    |               60 | Weeknight Hero        |
| 4    |              120 | House Pour            |
| 5    |              250 | Bistro Favorite       |
| 6    |              500 | Wine-Bar Whisper      |
| 7    |              900 | Sommelier’s Secret    |
| 8    |            1,500 | Cellar Staple         |
| 9    |            2,500 | Critic’s Darling      |
| 10   |            4,000 | Cult Following        |
| 11   |            6,500 | Allocation Only       |
| 12   |           10,000 | Auction Magnet        |
| 13   |           16,000 | Grand Cru Gravity     |
| 14   |           25,000 | First-Growth Royalty  |
| 15   |           40,000 | Unicorn Vintage       |
| 16   |           65,000 | Pétrus Pantheon       |

## Economic influence

The score remains uncapped, while its economic influence grows more slowly above 100:

```text
Prestige <= 100: influence = Prestige
Prestige > 100:  influence = 100 + 25 × log2(Prestige / 100)
```

This preserves the previous economy through 100. Afterward, each doubling adds 25 influence: 200 gives 125, 400 gives 150, and 800 gives 175. Suggested wine prices, retail demand, and hospitality attendance use this influence. The score itself is never replaced by the reduced value.

Shelf prices start at $1–$1,000. The first actual 98+ point bottling permanently unlocks Collector pricing up to $10,000 for every release, including wines made earlier. Existing lifetime best bottling scores count; reserve estimates and judging scores do not. Higher Prestige alone cannot unlock the ceiling, change saved wine quality, or automatically change a player's chosen shelf price. Remaining bottle stock, hospitality capacity, seasonal effects, and operating bills still apply.

## Saves and implementation

The serialized `reputation` field deliberately retains its name for compatibility. It accepts any finite nonnegative number, without the previous maximum of 100. Existing scores and estate assets load unchanged; save version six and the storage key are unchanged. Negative, infinite, and nonnumeric scores are rejected. Display uses compact notation for large resource totals and scientific notation for exceptionally large values.

[prestige.ts](../src/prestige.ts) owns the tiers, earnings, formatting, and influence curve. [EstatePrestige.tsx](../src/EstatePrestige.tsx) renders the resource and shared-modal ladder. [prestige.test.ts](../tests/prestige.test.ts) covers boundaries, sales, price and capacity limits, quality responses, and save round trips.
