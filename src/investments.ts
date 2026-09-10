import { RESEARCH } from './catalog';
import { prestigeInfluence } from './prestige';
import type { ResearchId } from './catalog';
import type { GameState, Plot, Wine } from './game';

export const UPGRADE_IDS = [
  'irrigation',
  'compost',
  'canopy',
  'precisionIrrigation',
  'cellar',
  'tasting',
  'lab',
  'visitorCenter',
  'tastingRoom',
  'sommelier',
  'restaurant',
  'guesthouse',
  'wineClub',
  'exportOffice',
  'sorting',
  'selectiveHarvest',
  'viticulturist',
  'researchLab',
  'coldStorage',
] as const;
export type Upgrade = (typeof UPGRADE_IDS)[number];
export const INVESTMENT_DEPARTMENTS = {
  vineyard: 'Vineyard & cellar',
  hospitality: 'Visitors & hospitality',
  sales: 'Sales & membership',
  research: 'Research & nursery',
} as const;
export type InvestmentDepartment = keyof typeof INVESTMENT_DEPARTMENTS;
type Investment = {
  name: string;
  cost: number;
  upkeep: number;
  text: string;
  category: InvestmentDepartment;
  kind: 'facility' | 'team';
  requires?: Upgrade;
  research?: ResearchId;
  legacy?: boolean;
  harvest?: {
    quality: number;
    minHealth?: number;
    minRipeness?: number;
    yieldMultiplier?: number;
  };
};
export const UPGRADES: Record<Upgrade, Investment> = {
  irrigation: {
    research: 'soil_mapping',
    name: 'Drip irrigation',
    cost: 6000,
    upkeep: 180,
    category: 'vineyard',
    kind: 'facility',
    text: '+3 growth each week and protection from dry spells across your vineyards.',
  },
  compost: {
    research: 'ampelography',
    name: 'Compost program',
    cost: 12000,
    upkeep: 180,
    category: 'vineyard',
    kind: 'facility',
    text: 'Enrich vineyard soils with estate compost. +1 quality point on new harvests across every estate.',
    harvest: { quality: 1 },
  },
  canopy: {
    research: 'soil_mapping',
    name: 'Canopy management team',
    cost: 30000,
    upkeep: 320,
    category: 'vineyard',
    kind: 'team',
    text: 'Balance shade and airflow around the fruit. +2 harvest quality points when vine health is at least 80%. Tend weaker vines to benefit.',
    harvest: { quality: 2, minHealth: 80 },
  },
  precisionIrrigation: {
    research: 'precision_viticulture',
    name: 'Precision irrigation controls',
    cost: 250000,
    upkeep: 600,
    category: 'vineyard',
    kind: 'facility',
    requires: 'irrigation',
    text: 'Fine-tune water delivery as fruit matures. +2 harvest quality points at 95%+ ripeness. Requires operating drip irrigation; its running cost is separate.',
    harvest: { quality: 2, minRipeness: 95 },
  },
  cellar: {
    name: 'Legacy cellar extension',
    cost: 3200,
    upkeep: 15,
    category: 'vineyard',
    kind: 'facility',
    legacy: true,
    text: 'Existing cellar equipment. Buy new bays and tanks separately.',
  },
  tasting: {
    research: 'tourism',
    name: 'Tasting terrace',
    cost: 8000,
    upkeep: 280,
    category: 'hospitality',
    kind: 'facility',
    text: '24 visitor places, $18 admission, and +12 base shoppers per grape and vintage customer group. Visitor attendance varies with Prestige and season.',
  },
  lab: {
    research: 'cellar_control',
    name: 'Winemaker’s bench',
    cost: 60000,
    upkeep: 550,
    category: 'vineyard',
    kind: 'facility',
    text: 'Temperature control adds 3 quality points to new fermentations. Existing batches keep their quality.',
  },
  visitorCenter: {
    research: 'visitor_services',
    name: 'Visitor center',
    cost: 24000,
    upkeep: 450,
    category: 'hospitality',
    kind: 'facility',
    text: '60 visitor places, $18 admission, and 25% more potential visitors. Opens the way to larger hospitality facilities.',
  },
  tastingRoom: {
    research: 'hospitality',
    name: 'Tasting room',
    cost: 40000,
    upkeep: 1400,
    category: 'hospitality',
    kind: 'facility',
    requires: 'visitorCenter',
    text: '80 more visitor places and +$8 admission per visitor. Hosted tastings increase shop demand by 15%.',
  },
  sommelier: {
    research: 'sommelier_training',
    name: 'Sommelier team',
    cost: 24000,
    upkeep: 1400,
    category: 'hospitality',
    kind: 'team',
    requires: 'tastingRoom',
    text: '+$12 admission per visitor. Wines rated 80+ gain 20% shop demand and 8% suggested retail value; bottle scores stay unchanged.',
  },
  restaurant: {
    research: 'culinary_tourism',
    name: 'Estate restaurant',
    cost: 95000,
    upkeep: 2800,
    category: 'hospitality',
    kind: 'facility',
    requires: 'visitorCenter',
    text: '+$20 dining income per visitor, serving up to 100 visitors each week. Also adds 20% shop demand. Quiet seasons still carry the full kitchen bill.',
  },
  guesthouse: {
    research: 'estate_lodging',
    name: 'Vineyard guesthouse',
    cost: 180000,
    upkeep: 3000,
    category: 'hospitality',
    kind: 'facility',
    requires: 'visitorCenter',
    text: 'Up to 24 room bookings each week at $220. Occupancy follows Prestige and season; rooms can sit empty.',
  },
  wineClub: {
    research: 'direct_sales',
    name: 'Wine club team',
    cost: 45000,
    upkeep: 1200,
    category: 'sales',
    kind: 'team',
    requires: 'tasting',
    text: '35% more shop demand for releases at least 12 weeks old. Keep older wines in stock to benefit.',
  },
  exportOffice: {
    research: 'export_trade',
    name: 'Export sales team',
    cost: 85000,
    upkeep: 2200,
    category: 'sales',
    kind: 'team',
    text: 'Wines rated 85+ gain 45% shop demand and 8% wholesale value. A large premium inventory is needed to cover salaries.',
  },
  sorting: {
    research: 'fruit_selection',
    name: 'Optical sorting line',
    cost: 150000,
    upkeep: 700,
    category: 'vineyard',
    kind: 'facility',
    text: '+2 quality points on new harvests. Improves selection of fruit; it cannot repair stored wine.',
    harvest: { quality: 2 },
  },
  selectiveHarvest: {
    research: 'fruit_selection',
    name: 'Selective harvest crew',
    cost: 400000,
    upkeep: 1000,
    category: 'vineyard',
    kind: 'team',
    text: 'Pick only the best bunches. +3 quality points on new harvests, with 10% fewer kilograms picked. Applies across every estate while operating.',
    harvest: { quality: 3, yieldMultiplier: 0.9 },
  },
  viticulturist: {
    research: 'precision_viticulture',
    name: 'Viticulture team',
    cost: 120000,
    upkeep: 1600,
    category: 'vineyard',
    kind: 'team',
    text: '+2 weekly growth and 1 less weekly health loss on every growing plot. Larger vineyard portfolios make better use of the team.',
  },
  researchLab: {
    research: 'research_methods',
    name: 'Research & nursery lab',
    cost: 350000,
    upkeep: 1400,
    category: 'research',
    kind: 'facility',
    requires: 'lab',
    text: '+10 knowledge each week. Studies and breeding trials progress twice as fast while the lab operates.',
  },
  coldStorage: {
    research: 'cold_chain',
    name: 'Refrigerated grape store',
    cost: 90000,
    upkeep: 900,
    category: 'vineyard',
    kind: 'facility',
    text: 'Fresh grapes keep for 5 game weeks instead of 3. Suspending refrigeration restores the 3-week limit at the next weekly check.',
  },
};

// Ownership persists when an investment is suspended. Dependencies also need
// to operate, so a closed visitor center cannot power a restaurant's revenue.
export function upgradeActive(
  s: Pick<GameState, 'upgrades' | 'suspendedUpgrades'>,
  id: Upgrade,
): boolean {
  if (!s.upgrades.includes(id) || s.suspendedUpgrades?.includes(id))
    return false;
  const prerequisite = UPGRADES[id].requires;
  return !prerequisite || upgradeActive(s, prerequisite);
}

// Apply the same operating and crop conditions to both the preview and picking.
// Scores and quantities already recorded on harvested lots are never recalculated.
export function harvestInvestmentEffects(s: GameState, p: Plot) {
  let quality = 0;
  let yieldMultiplier = 1;
  if (p.variety) {
    for (const id of s.upgrades) {
      const effect = UPGRADES[id].harvest;
      if (
        !effect ||
        !upgradeActive(s, id) ||
        p.health < (effect.minHealth ?? 0) ||
        p.growth < (effect.minRipeness ?? 0)
      )
        continue;
      quality += effect.quality;
      yieldMultiplier *= effect.yieldMultiplier ?? 1;
    }
  }
  return { quality, yieldMultiplier };
}
export const investmentBill = (s: GameState, id: Upgrade) =>
  Math.ceil(
    UPGRADES[id].upkeep *
      (upgradeActive(s, id) || s.operatedUpgrades?.includes(id) ? 1 : 0.25),
  );
export const investmentUpkeep = (s: GameState) =>
  s.upgrades.reduce((sum, id) => sum + investmentBill(s, id), 0);
export function upgradeBlocked(s: GameState, id: Upgrade) {
  const u = UPGRADES[id];
  if (!u) return 'Unknown investment';
  if (u.legacy) return 'Buy cellar space and tanks separately';
  if (s.upgrades.includes(id)) return 'Already owned';
  if (u.research && !s.research.includes(u.research))
    return `Study ${RESEARCH[u.research].name} first`;
  if (u.requires && !upgradeActive(s, u.requires))
    return `Requires an operating ${UPGRADES[u.requires].name}`;
  if (s.cash < u.cost)
    return `Need $${(u.cost - s.cash).toLocaleString('en-US')} more`;
  return null;
}
export const grapeStorageWeeks = (s: GameState) =>
  upgradeActive(s, 'coldStorage') ? 5 : 3;
export function investmentDemand(wine: Wine, s: GameState) {
  return (
    (upgradeActive(s, 'tastingRoom') ? 1.15 : 1) *
    (upgradeActive(s, 'restaurant') ? 1.2 : 1) *
    (upgradeActive(s, 'sommelier') && wine.quality >= 80 ? 1.2 : 1) *
    (upgradeActive(s, 'wineClub') && s.week - wine.bottled >= 12 ? 1.35 : 1) *
    (upgradeActive(s, 'exportOffice') && wine.quality >= 85 ? 1.45 : 1)
  );
}
export function hospitalityForecast(s: GameState) {
  const active = (id: Upgrade) => upgradeActive(s, id);
  const seasonIndex = Math.floor(((s.week - 1) % 12) / 3);
  const season = ['Spring', 'Summer', 'Autumn', 'Winter'][seasonIndex];
  const seasonFactor = [0.85, 1.15, 1.35, 0.45][seasonIndex];
  const potential = Math.floor(
    (20 + prestigeInfluence(s.reputation) * 1.3) *
      seasonFactor *
      (active('visitorCenter') ? 1.25 : 1),
  );
  const capacity =
    (active('tasting') ? 24 : 0) +
    (active('visitorCenter') ? 60 : 0) +
    (active('tastingRoom') ? 80 : 0);
  const visitors = Math.min(capacity, potential);
  const admission =
    (active('tasting') || active('visitorCenter') ? 18 : 0) +
    (active('tastingRoom') ? 8 : 0) +
    (active('sommelier') ? 12 : 0);
  const dining = active('restaurant') ? Math.min(100, visitors) * 20 : 0;
  const rooms = active('guesthouse')
    ? Math.min(24, Math.floor(potential * 0.14))
    : 0;
  const revenue = visitors * admission + dining + rooms * 220;
  const bill = s.upgrades
    .filter((id) => UPGRADES[id].category === 'hospitality')
    .reduce((sum, id) => sum + investmentBill(s, id), 0);
  return {
    season,
    visitors,
    capacity,
    admission,
    dining,
    rooms,
    revenue,
    upkeep: bill,
    net: revenue - bill,
  };
}

export const studyWeeks = (s: GameState, remaining: number) =>
  Math.ceil(remaining / (upgradeActive(s, 'researchLab') ? 2 : 1));

// A full game year covers every season; Prestige and facilities stay fixed.
export function annualHospitalityForecast(s: GameState) {
  const weeks = Array.from({ length: 12 }, (_, i) =>
    hospitalityForecast({
      ...s,
      week: s.week + i,
      operatedUpgrades: i === 0 ? s.operatedUpgrades : [],
    }),
  );
  return {
    revenue: weeks.reduce((n, w) => n + w.revenue, 0),
    upkeep: weeks.reduce((n, w) => n + w.upkeep, 0),
    net: weeks.reduce((n, w) => n + w.net, 0),
  };
}
