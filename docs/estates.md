# Estate expansion

The wine business now owns a portfolio of estates, sharing funds, research, equipment, kits, cellar inventory, wine lines, reputation, and a single 12-week calendar. The first property remains the home estate and the bottling business retains its existing brand name.

## Land and capacity

| Purchase | Cost | Land included | Shared tank capacity | Added weekly upkeep |
| --- | ---: | --- | ---: | ---: |
| First additional estate | $28,000 | 3 empty parcels / 3.0 ha | Purchased separately | $175 |
| Later estates | Prior acquisition price + $8,000 | 3 empty parcels / 3.0 ha | Purchased separately | $175 |
| Second district at an estate | $18,000 | 6 empty parcels / 6.8 ha | Purchased separately | $185 |
| Third district | $27,000 | 6 empty parcels / 6.8 ha | Purchased separately | $185 |
| Fourth district | $36,000 | 6 empty parcels / 6.8 ha | Purchased separately | $185 |

Each original vineyard has three additional neighboring parcels available at the existing land prices, adding $25 weekly upkeep apiece. New vines cost extra. Buying land never grants ripe grapes, research points, supplies, or starting capital. All purchases are atomic and reject invalid, duplicate, unaffordable, or over-limit requests.

Each estate can have four districts. There is one estate per region, up to eight. Each district has six individually managed parcels. At full ownership this is 192 parcels / 217.6 ha before individual plot enlargement. Four expansions per parcel can triple this to 652.8 ha. Select an owned parcel on the Estate map to enlarge it; see [plot expansion](plot-expansion.md) for costs and next-spring production timing. Land purchases supply no cellar equipment. Buy floor space and 150 L tanks separately, up to 256 installed tanks; see [cellar equipment](cellar-equipment.md). The shared cellar can hold 256 reserve lots; fresh-grape capacity and save validation support the larger portfolio. Existing release, recipe, and total-save-size limits still apply.

Upkeep adds $100 for each estate beyond the home estate, $25 for each owned parcel, and $35 for each district beyond an estate's original vineyard. Each individual plot expansion adds another $15 per week. Existing base upkeep, equipment fees, and debt charges continue.

## Regional simulation

Plot addresses identify their estate, district, and local parcel. The first estate's original IDs 1–6 stay unchanged. Climate, soil fit, local planting discounts, regional grape access, and weather-driven health are resolved from the plot's estate rather than whichever estate is on screen. All planted estates advance on every week. Visiting consumes neither resources nor random numbers and cannot change simulation results.

Districts cycle the regional soil palette across the familiar six parcel shapes. Legacy home-estate soils are retained in the original district. New districts use the region's current soil palette. Acquiring an estate does not unlock its grapes: every non-founding variety needs an individual field study, and learned varieties are available to the shared nursery. Climate-focused breeding continues to target the home region, as shown in the research interface.

Seasons remain synchronized across all regions, matching the game's existing abstract calendar. Equipment applies to the whole business; this iteration does not add transportation delays, local staff, separate winery accounts, or estate sales.

## Wine provenance and saves

Fresh grapes record an estate ID. Fermentation and reserve transfer preserve it, and recipe grouping includes origin alongside variety, vintage, and intrinsic quality. The same grape and year from two estates remains two identifiable sources. Compatibility still aggregates by grape, so acquiring estates cannot manufacture a diversity bonus. Composition displays and source-quality tables identify origins once there is more than one estate.

Version-six saves persist the entire portfolio, every parcel and district, selected estate, wine origins, and individual research progression. Versions one through three migrate into a single home estate without changing existing funds, assets, crop state, source qualities, final scores, or history. Missing origin IDs refer to the home estate. Version-four portfolios migrate with all prior 400 L tanks preserved. Existing grape access through version five is retained when migrating to individual research; see [research progression](regions-and-research.md). The storage key stays `terroir.save.v1`. Export/import validation rejects impossible plot coverage, duplicate regional estates, unknown origins, and excess occupied tanks.

The map selector chooses the estate; district tabs choose which six parcels are on the map. The selected estate is saved; a reload opens its original district. **Build → Land & estates** contains expansion purchases. **Start a new game** in settings is the separate reset flow.
