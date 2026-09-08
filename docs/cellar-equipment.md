# Cellar equipment

Cellar floor space and fermentation tanks are separate investments shared by all estates. Vineyard districts and estate acquisitions now add land only.

| Item | Starting provision / purchase | Effect |
| --- | --- | --- |
| Starting cellar | Four bays, two 150 L tanks | 300 L across two harvest-reserved vessels |
| Tank | $1,200 each | One 150 L tank; occupies one existing empty bay |
| Floor extension | $3,200 first; +$1,600 for each later extension | Four empty bays; +$15 weekly upkeep |
| Steel processing | $140 per tank used | Two-week fermentation |
| French oak processing | $320 per tank used | Two-week fermentation with wood character; maturation chosen separately |
| Steel maturation | $0 per reserved tank | Freshness route after fermentation and techniques |
| Neutral oak maturation | $80 per reserved tank | Barrel service with little wood flavor |
| French oak maturation | $180 per reserved tank | Barrel service with wood flavor and over-oaking risk |

Players can buy several tanks at once. New tank purchases add no recurring upkeep; floor extensions do. There is a limit of 256 bays and installed tanks. Prices are game balance values, not equipment market estimates.

Maturation charges are paid once when a finished batch starts its plan. All three choices reserve its existing cellar capacity until transfer; a wood plan includes barrel service without removing or replacing owned tanks. Separate barrel inventories are outside this equipment model. See [maturation](aging.md) for grape-specific release windows, scheduled transfers, and older batches.

## Harvest allocation

The fermentation preview and action use the same deterministic allocation. It considers only completely empty tanks, orders larger legacy tanks first and then stable tank IDs, and processes as much of the harvest as fits. When capacity is limited, the action shows the volume that will start, its processing cost, and the grapes that will remain. It rejects zero empty capacity or insufficient cash before consuming grapes, spending money, allocating inventory IDs, or changing randomness. Processing is charged only for the tanks used.

For example, 360 kg yields 252 L. Two 150 L tanks hold 150 L and 102 L, costing $280 in steel or $640 in oak. A 600 kg lot yields 420 L: with two empty tanks, 300 L starts immediately and 172 kg remains to yield the other 120 L. The remainder keeps its inventory ID, variety, quality, origin, and original harvest date. It can be processed after buying or freeing tanks, or sold; partial processing does not extend its spoilage deadline. Remaining kilograms are rounded up from the unprocessed whole-liter yield so repeated batches conserve the harvest's total wine yield without fractional save quantities.

Fully expanding South slope can yield 1,080 kg of healthy Merlot: 756 L across six new tanks, with $840 steel processing when started together. Partially filled tanks remain reserved for their current batch and cannot be topped up, including with another portion of the same harvest.

Each fermentation action creates one batch with multiple assigned tank IDs. Its quality, origin, vintage, aging treatment, and progress stay together. The cellar depicts each occupied vessel and its fill. Aging affects the batch; moving it to reserves preserves all liquid and provenance and releases every assigned tank. Blending and bottling continue from reserves. A batch spanning multiple tanks does not receive extra quality bonuses or separate tasting rolls. Portions started later become separate batches with their own processing treatment and progress.

## Persistence

Version-five saves record cellar bays, the number of paid extensions, each tank's stable ID and capacity, and the tank IDs occupied by each batch. Import validation checks capacity, unique and known tank assignments, bay limits, and equipment IDs. Processing supports up to 1,260 L across nine assigned tanks per batch, matching the maximum valid 1,800 kg fresh-grape lot after individual plot enlargement. These limits preserve every existing smaller lot and batch.

Versions one through four migrate through the existing estate/recipe migrations. The prior implicit equipment becomes explicit 400 L tanks: two per vineyard district, plus two for the old cellar upgrade. Existing batches each occupy one of these tanks. Floor space is rounded up to four-bay increments, with at least four bays. The old cellar upgrade's upkeep remains in the historical upgrades array; new extensions add their own upkeep. Migration does not charge money, grant supplies, alter crop state, change wine quality, or discard any liquid. Newly purchased tanks always hold 150 L; preserved 400 L tanks remain usable.

The storage key is unchanged. Loading pauses time as before. Equipment actions are available through **Cellar → Space & tanks** and **Build → Buildings & equipment → Cellar space & tanks**.

Research can unlock optional [cellar techniques](cellar-techniques.md) for new batches. Their charges apply only to the tanks filled, and their extra weeks extend occupancy until the whole plan completes. Empty-tank allocation, partial-grape yield, and the remainder’s original spoilage deadline still apply.
