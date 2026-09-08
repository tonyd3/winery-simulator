# Wine warehouse and shop shelves

Bottled wine uses two shared capacities across all estates. New estates start with **600 warehouse spaces** and **120 shop shelf spaces**. Unbottled reserves, fermentation tanks, fresh grapes, and empty bottling kits have their own existing rules and do not use bottle space.

## Warehouse

Every unsold bottle counts toward warehouse capacity, including bottles assigned to shop shelves. Listing or pausing a wine does not create more storage. Bottling is limited by the smallest of available wine, kits, and free warehouse space; unused wine stays in reserves. Retail and wholesale sales free space immediately.

Add warehouse space in any Cellar department or in the Wine shop. Each expansion adds **600 bottles**, starting at **$2,400**, with the next purchase costing **$1,200 more**. Up to 199 expansions provide 120,000 total bottle spaces.

## Shop shelves

Each release has a shelf allocation. Set its bottle count and choose **List in the wine shop**, or adjust an active release with **Update shelf space**. The initial suggestion is up to 60 bottles, subject to stock and free shelf space. All active allocations share the shop capacity. A release cannot take space occupied by another wine.

Shelves refill automatically from the release's stored bottles for each game week. Retail sales cannot exceed that release's shelf stock in one week, even when demand is higher. Unsold bottles stay in stock; refilling moves no money and creates no bottles. When fewer bottles remain than the allocation, only those bottles occupy shelf space. A sold-out release uses none. Pausing frees its allocation and keeps every bottle in storage.

Sales and marketing forecasts respect shelf availability. Shelf space is a sales ceiling, not guaranteed demand. Existing shared customer groups still prevent splitting one wine into many releases from creating more shoppers.

Add shelving in the Wine shop: **60 spaces for $900**, with each later purchase costing **$450 more**. Up to 198 expansions provide 12,000 total shelf spaces. Warehouse and shelving purchases are permanent capital investments with no added weekly upkeep or research requirement.

**Sell all wholesale** sells a release's entire remaining stock, including its shelf stock, at the existing distributor price. Wholesale does not use retail shelf capacity.

## Existing saves

The save version and browser key remain supported. Missing capacity fields start at the new base capacities. Every saved bottle, score, price, account, and listing is retained. Older listings share the available shelves; if there are more listings than spaces, some keep their listing with zero shelf stock until the player assigns space. Existing explicit allocations are retained and overbooked imports are rejected.

An older estate above warehouse capacity can still load, save, advance, and sell. No wine is discarded. Its warehouse shows the excess and blocks additional bottling until sales or expansions create room.

Implementation: [capacity and migration helpers](../src/bottleStorage.ts), [game actions and sales](../src/game.ts), [capacity panel](../src/BottleStoragePanel.tsx), [shelf controls](../src/ShelfAllocation.tsx), and [simulation tests](../tests/bottle-storage.test.ts).
