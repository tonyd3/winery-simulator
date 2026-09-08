# Prestige

Prestige is the winery business's shared standing, replacing the former Reputation stat. It starts at 12 and has no gameplay ceiling. The current tier appears beneath the score in the resource bar; clicking it pauses time and opens the full tier ladder.

## Earning and losing Prestige

- Shop sales earn **0.04 per bottle** when the week advances.
- Wholesale sales earn **0.01 per bottle** when the remaining release is sold.
- The existing automatic emergency-work payment reduces Prestige by up to **2**, floored at zero.
- Sales earnings are rounded to two decimal places. Tier changes follow the current total, including downward changes after financial trouble.

Titles are descriptive. Crossing a threshold gives no cash award, purchase unlock, or additional modifier. Prestige continues accumulating beyond the final title. Wine quality and independent judging retain their separate 100-point scales.

## Tier ladder

| Tier | Minimum Prestige | Name |
| --- | ---: | --- |
| 1 | 0 | Two-Buck Beginning |
| 2 | 25 | Grocery Aisle Darling |
| 3 | 60 | Weeknight Hero |
| 4 | 120 | House Pour |
| 5 | 250 | Bistro Favorite |
| 6 | 500 | Wine-Bar Whisper |
| 7 | 900 | Sommelier’s Secret |
| 8 | 1,500 | Cellar Staple |
| 9 | 2,500 | Critic’s Darling |
| 10 | 4,000 | Cult Following |
| 11 | 6,500 | Allocation Only |
| 12 | 10,000 | Auction Magnet |
| 13 | 16,000 | Grand Cru Gravity |
| 14 | 25,000 | First-Growth Royalty |
| 15 | 40,000 | Unicorn Vintage |
| 16 | 65,000 | Pétrus Pantheon |

## Economic influence

The score remains uncapped, while its economic influence grows more slowly above 100:

```text
Prestige <= 100: influence = Prestige
Prestige > 100:  influence = 100 + 25 × log2(Prestige / 100)
```

This preserves the previous economy through 100. Afterward, each doubling adds 25 influence: 200 gives 125, 400 gives 150, and 800 gives 175. Suggested wine prices, retail demand, and hospitality attendance use this influence. The score itself is never replaced by the reduced value.

The existing $1–$1,000 shelf-price range, remaining bottle stock, hospitality capacity, seasonal effects, and operating bills still apply. Higher Prestige does not change saved wine quality or automatically change a player's chosen shelf price.

## Saves and implementation

The serialized `reputation` field deliberately retains its name for compatibility. It accepts any finite nonnegative number, without the previous maximum of 100. Existing scores and estate assets load unchanged; save version six and the storage key are unchanged. Negative, infinite, and nonnumeric scores are rejected. Display uses compact notation for large resource totals and scientific notation for exceptionally large values.

[prestige.ts](../src/prestige.ts) owns the tiers, earnings, formatting, and influence curve. [EstatePrestige.tsx](../src/EstatePrestige.tsx) renders the resource and shared-modal ladder. [prestige.test.ts](../tests/prestige.test.ts) covers boundaries, sales, price and capacity limits, penalties, and save round trips.
