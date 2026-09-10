// Deterministic parcel addresses keep old IDs 1–6 intact as estates grow.
export const ESTATE_LIMITS = {
  estates: 8,
  districts: 4,
  plotsPerDistrict: 6,
  reserves: 256,
};
export const DISTRICTS = [
  'Original vineyard',
  'Upper vineyard',
  'Valley vineyard',
  'Far vineyard',
];
export const estateIdForPlot = (id: number) => Math.floor((id - 1) / 24) + 1;
export const districtForPlot = (id: number) => Math.floor(((id - 1) % 24) / 6);
export const localPlotId = (id: number) => ((id - 1) % 6) + 1;
export const plotId = (estate: number, district = 0, local = 1) =>
  (estate - 1) * 24 + district * 6 + local;
// Founding vineyards are included with each estate. Added districts share one
// price curve so opening a new region cannot reset expansion prices.
export const districtCost = (estates: readonly { districts: number }[]) =>
  75000 *
  (1 + estates.reduce((total, estate) => total + estate.districts - 1, 0)) ** 2;
export const acquisitionCost = (estates: number) => 250000 * estates ** 2;
