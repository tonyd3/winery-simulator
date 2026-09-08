# Individual plot expansion

Select any owned parcel on the Estate map and use **Grow more here → Expand plot**. This grows the area devoted to that parcel's grape without adding a vineyard district or acquiring another estate. Unowned parcels must be purchased first. Empty parcels can also be enlarged before planting.

Each purchase adds 50% of the parcel's original acreage and base yield. Four purchases reach three times its original size. The cost is the original hectares × $3,000 × the current size multiplier, rounded to whole dollars. Prices are game balance values.

| South slope expansion | Area | Purchase cost | Healthy, established Merlot yield |
| --- | ---: | ---: | ---: |
| Original | 1.2 ha | — | 360 kg |
| First | 1.8 ha | $3,600 | 540 kg |
| Second | 2.4 ha | $5,400 | 720 kg |
| Third | 3.0 ha | $7,200 | 900 kg |
| Fourth | 3.6 ha | $9,000 | 1,080 kg |

## Production and costs

Expanding planted land includes more vines of its existing grape. The new rows become productive at the next spring transition, including estates that are offscreen. The current crop's ripeness, health, grape, quality model, and annual harvest flag stay unchanged. Buying expansion cannot increase ripe fruit immediately or enable another harvest that year. The inspector distinguishes productive rows from pending rows and previews the future crop using the current variety and health.

On empty land, planting purchases vines for the entire enlarged parcel and starts its crop at the normal 15% ripeness. Removing and replacing vines preserves purchased acreage and the annual harvest flag. The calendar remains the game's compressed 12-week year; establishment is a game simplification.

Each expansion adds $15 weekly upkeep. Vine care ($90), removal ($120), and regional planting costs are multiplied by the parcel's total size multiplier. Harvest crew costs ($180) use only the size currently producing fruit. Pending rows therefore incur care and upkeep without increasing the current harvest charge. Soil, climate, research, and grape traits continue to determine quality and actual yield; additional acreage gives no quality bonus.

The map remains schematic. Acreage badges, parcel details, and estate/portfolio totals show the enlarged area without stretching neighboring map shapes.

## Cellar planning

The preview shows future kilograms, wine liters, and the number of new 150 L tanks that crop would require. It is a planning estimate at current vine health, not a purchase of equipment. Actual fermentation uses the available installed tanks, including preserved 400 L tanks in old games. A fully enlarged, healthy Merlot South slope produces 1,080 kg → 756 L → six new tanks. The existing whole-harvest capacity check and per-tank processing fees apply.

Fresh-grape validation now allows 1,800 kg per lot, and fermentation allows 1,260 L across up to nine tanks per batch. All assigned tanks are released together on reserve transfer. Wine volume and provenance continue through blending and bottling unchanged.

## Saving and limits

Version-five plots record purchased `expansions` and productive `bearingExpansions`. Both default to zero for older saves, with no charges or changes to existing crops and assets. Pending rows survive reloads and activate on the same spring transition. Invalid fractional, negative, over-limit, unowned, or inconsistent expansion states are rejected on import.

The cap applies independently to every parcel in every district and estate: 192 fully owned parcels can reach 652.8 ha. Unaffordable, unowned, or over-limit purchases fail atomically. Expansion does not advance time, change random seeds, grant knowledge, or add cellar equipment.
