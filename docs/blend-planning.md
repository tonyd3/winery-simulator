# Blend planning and trials

In **Cellar → Reserves & blending**, select at least two source lots. The original liter inputs remain available. **Set percentages & batch size** opens an optional recipe editor in the bench.

## Proportions and batch size

- Assign each selected lot a positive percentage, with up to two decimal places. Shares must total exactly 100%.
- **Equal shares** splits the recipe evenly, assigning any rounding remainder in lot order. Two-lot recipes also offer 60/40 and 80/20 presets.
- Enter the intended liters, with up to three decimal places, or choose **Use maximum available**. The maximum uses the most constrained source at the selected proportions, capped at the existing 100,000 L recipe limit.
- **Apply proportions** updates the bench's liter inputs. It does not transfer wine. Draft changes inside the editor affect the bench only after applying them.
- Percentage allocation preserves the requested total to the milliliter, using largest remainders for fractions. Every selected source must contribute at least 1 mL. Percentages derived from an existing liter recipe are rounded to two decimals, so a recipe using all of one source may need a slightly smaller batch after conversion.

The bench previews full 750 mL bottle yield and the remaining liquid, likely aromas and palate, weighted source quality, compatibility, and estimated tasting range. Yield describes the liquid; normal kits and warehouse requirements still apply when bottling. Taste uses the existing grape, vintage, estate, harvest, fermentation, and maturation model. These controls do not change the quality formula or award bonuses.

## The tasting notebook

**Save bench trial** records the current bench recipe under the blend name, or a default trial name when blank. An estate can hold three trials. Compare them with the current recipe in the ledger below the bench; remove a trial to free a slot.

A trial uses no wine, cash, kits, research, or game time. It records the source lot IDs, exact volumes, component history, name, and game week. It does not create a reserve, consume an inventory ID, change the random seed, or fix a tasting score. Trials can be planned before unlocking blending research.

**Use [trial name]** restores the saved source amounts and name to the bench. It rechecks current stock and calculates the current preview from that wine. **Create blend in reserves** performs the actual transfer, with all existing research and reserve-capacity requirements. It preserves the source grapes, vintages, estates, production history, costs, and exact liquid volume.

Trials retain their recorded composition after the sources are bottled, blended, or discarded. Such recipes remain useful for comparison; their use button is disabled when a required lot is gone or lacks the requested volume. Trial notes never replenish stock. Estimated notes and scores are calculated from the recorded composition under the current game rules, rather than being final tasting records.

## Saves and implementation

The version-six save schema adds a default-empty `blendTrials` field, so older saves still load. Trials export, import, and autosave with the estate. Validation checks the three-slot limit, unique slots and source IDs, volume consistency, bounded components, known grapes and estates, and valid inventory/date references. A source need not remain in reserves for a saved trial to be valid. The existing overall save-size limit still applies.

- [blendPlanning.ts](../src/blendPlanning.ts): shared read-only planning, trial schema, exact percentage allocation, and source availability.
- [game.ts](../src/game.ts): trial actions, production action, and save validation.
- [BlendProportions.tsx](../src/BlendProportions.tsx), [BlendTrials.tsx](../src/BlendTrials.tsx), and [Reserves.tsx](../src/Reserves.tsx): editor, notebook, and bench integration.
- [blend-planning.test.ts](../tests/blend-planning.test.ts): allocation, stock limits, no-cost planning, research gates, trial persistence, malformed saves, and volume/cost conservation through production and bottling.

See also [blend compatibility](blend-compatibility.md) and [tasting notes](tasting-notes.md).
