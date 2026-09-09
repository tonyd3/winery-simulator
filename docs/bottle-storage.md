# Wine warehouse and shop shelves

Bottled wine uses two shared capacities across all estates. New estates start with **600 warehouse spaces** and **120 shop shelf spaces**. Unbottled reserves, fermentation tanks, fresh grapes, and empty bottling kits have their own existing rules and do not use bottle space.

## Warehouse

Every unsold bottle counts toward warehouse capacity, including bottles assigned to shop shelves and the Private Collection. Listing or pausing a wine does not create more storage. Bottling is limited by the smallest of available wine, kits, and free warehouse space; unused wine stays in reserves. Retail and wholesale sales free space immediately.

Add warehouse space in any Cellar department or in the Wine shop. Each expansion adds **600 bottles**, starting at **$2,400**, with the next purchase costing **$1,200 more**. Up to 199 expansions provide 120,000 total bottle spaces.

## Shop shelves

Each release has a shelf allocation. Set its bottle count and choose **List in the wine shop**, or edit an active release’s count to save its allocation automatically. The initial suggestion is up to 60 bottles, subject to stock and free shelf space. All active allocations share the shop capacity. A release cannot take space occupied by another wine.

Shelves refill automatically from the release's bottles available for sale for each game week. Retail sales cannot exceed that release's shelf stock in one week, even when demand is higher. Unsold bottles stay in stock; refilling moves no money and creates no bottles. When fewer bottles remain than the allocation, only those bottles occupy shelf space. A sold-out release uses none. Pausing frees its allocation and keeps every bottle in storage.

Sales and marketing forecasts respect shelf availability. Shelf space is a sales ceiling, not guaranteed demand. Existing shared customer groups still prevent splitting one wine into many releases from creating more shoppers.

Add shelving in the Wine shop: **60 spaces for $900**, with each later purchase costing **$450 more**. Up to 198 expansions provide 12,000 total shelf spaces. Warehouse and shelving purchases are permanent capital investments with no added weekly upkeep or research requirement.

The **Sell wholesale** action sells every bottle available for sale in that release, including its shelf stock, at the existing distributor price. Its label shows the exact bottle count and offer; private bottles are excluded. Wholesale does not use retail shelf capacity.

## Private Collection

**Keep bottles** moves a chosen quantity into the player's Private Collection; **Return bottles** makes a chosen quantity available for sale again. Both require positive whole numbers within the available count. These free transfers preserve total inventory, production totals, accounts, quality, artwork and provenance. Each release stores an optional `privateBottles` count as a subset of its total unsold `bottles`. Missing counts mean zero, so old saves retain their existing behavior without a version change. Imports reject negative, fractional or excessive private counts.

Retail checkout, weekly replenishment, demand forecasts, shared customer weights, shelf allocation and wholesale all use selling stock (`bottles - privateBottles`). Keeping bottles trims shelf allocations if needed and pauses a listing when no selling stock remains. Returning never increases shelf allocation or automatically lists a wine. A private-only release remains in the collection and cannot be compacted out of release history. Private bottles still occupy warehouse space; there is no extra upkeep or quality gain from keeping them.

## Existing saves

The save version and browser key remain supported. Missing capacity fields start at the new base capacities. Every saved bottle, score, price, account, and listing is retained. Older listings share the available shelves; if there are more listings than spaces, some keep their listing with zero shelf stock until the player assigns space. Existing explicit allocations are retained and overbooked imports are rejected.

An older estate above warehouse capacity can still load, save, advance, and sell. No wine is discarded. Its warehouse shows the excess and blocks additional bottling until sales or expansions create room.

Implementation: [capacity and migration helpers](../src/bottleStorage.ts), [game actions and sales](../src/game.ts), [capacity panel](../src/BottleStoragePanel.tsx), [shelf controls](../src/ShelfAllocation.tsx), and [simulation tests](../tests/bottle-storage.test.ts), [private controls](../src/PrivateCollectionControls.tsx), and [private inventory tests](../tests/private-collection.test.ts).
