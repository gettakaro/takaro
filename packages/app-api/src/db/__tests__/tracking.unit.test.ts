import { expect } from '@takaro/test';
import { describe, it } from 'node:test';

/**
 * These are pure function implementations extracted for unit testing.
 * They mirror the logic in TrackingRepo but don't require database dependencies.
 */
interface AggregatedItem {
  amount: number;
  quality?: string;
  itemId: string;
}

interface InventoryDiff {
  itemId: string;
  changeType: 'added' | 'removed' | 'changed';
  previousQuantity?: number;
  newQuantity?: number;
  previousQuality?: string;
  newQuality?: string;
}

function aggregateByCode(
  items: { code: string; amount?: number; quality?: string }[],
  itemDefs: { id: string; code: string }[],
): Map<string, AggregatedItem> {
  const map = new Map<string, AggregatedItem>();
  for (const item of items) {
    const itemDef = itemDefs.find((def) => def.code === item.code);
    if (!itemDef) continue;

    const existing = map.get(item.code);
    if (existing) {
      existing.amount += item.amount ?? 0;
    } else {
      map.set(item.code, {
        amount: item.amount ?? 0,
        quality: item.quality,
        itemId: itemDef.id,
      });
    }
  }
  return map;
}

function calculateDiffs(
  previousMap: Map<string, AggregatedItem>,
  currentMap: Map<string, AggregatedItem>,
): InventoryDiff[] {
  const diffs: InventoryDiff[] = [];

  // Added and changed
  for (const [code, curr] of currentMap) {
    const prev = previousMap.get(code);
    if (!prev) {
      diffs.push({
        itemId: curr.itemId,
        changeType: 'added',
        newQuantity: curr.amount,
        newQuality: curr.quality,
      });
    } else if (prev.amount !== curr.amount || prev.quality !== curr.quality) {
      diffs.push({
        itemId: curr.itemId,
        changeType: 'changed',
        previousQuantity: prev.amount,
        newQuantity: curr.amount,
        previousQuality: prev.quality,
        newQuality: curr.quality,
      });
    }
  }

  // Removed
  for (const [code, prev] of previousMap) {
    if (!currentMap.has(code)) {
      diffs.push({
        itemId: prev.itemId,
        changeType: 'removed',
        previousQuantity: prev.amount,
        previousQuality: prev.quality,
      });
    }
  }

  return diffs;
}

describe('TrackingRepo - Diff Calculation', function () {
  // Helper to create item definitions
  const createItemDefs = (codes: string[]) => codes.map((code) => ({ id: `item-${code}`, code, name: code }));

  describe('aggregateByCode', function () {
    it('aggregates single items correctly', function () {
      const items = [
        { code: 'wood', amount: 64 },
        { code: 'stone', amount: 32 },
      ];
      const itemDefs = createItemDefs(['wood', 'stone']);

      const result = aggregateByCode(items, itemDefs);

      expect(result.get('wood')?.amount).to.equal(64);
      expect(result.get('stone')?.amount).to.equal(32);
    });

    it('sums multiple stacks of same item', function () {
      const items = [
        { code: 'wood', amount: 64 },
        { code: 'wood', amount: 32 },
        { code: 'wood', amount: 10 },
      ];
      const itemDefs = createItemDefs(['wood']);

      const result = aggregateByCode(items, itemDefs);

      expect(result.get('wood')?.amount).to.equal(106); // 64 + 32 + 10
    });

    it('handles items with zero amount', function () {
      const items = [{ code: 'wood', amount: 0 }];
      const itemDefs = createItemDefs(['wood']);

      const result = aggregateByCode(items, itemDefs);

      expect(result.get('wood')?.amount).to.equal(0);
    });

    it('handles undefined amount as zero', function () {
      const items = [{ code: 'wood' }]; // no amount
      const itemDefs = createItemDefs(['wood']);

      const result = aggregateByCode(items, itemDefs);

      expect(result.get('wood')?.amount).to.equal(0);
    });

    it('keeps first quality when aggregating stacks', function () {
      const items = [
        { code: 'pickaxe', amount: 1, quality: '80%' },
        { code: 'pickaxe', amount: 1, quality: '50%' },
      ];
      const itemDefs = createItemDefs(['pickaxe']);

      const result = aggregateByCode(items, itemDefs);

      expect(result.get('pickaxe')?.quality).to.equal('80%'); // first one kept
      expect(result.get('pickaxe')?.amount).to.equal(2);
    });

    it('ignores items not in itemDefs', function () {
      const items = [
        { code: 'wood', amount: 64 },
        { code: 'unknown', amount: 10 },
      ];
      const itemDefs = createItemDefs(['wood']); // 'unknown' not defined

      const result = aggregateByCode(items, itemDefs);

      expect(result.size).to.equal(1);
      expect(result.has('wood')).to.be.true;
      expect(result.has('unknown')).to.be.false;
    });

    it('handles empty items array', function () {
      const items: { code: string; amount?: number }[] = [];
      const itemDefs = createItemDefs(['wood']);

      const result = aggregateByCode(items, itemDefs);

      expect(result.size).to.equal(0);
    });
  });

  describe('calculateDiffs', function () {
    const createAggMap = (items: { code: string; amount: number; quality?: string }[]) => {
      const map = new Map<string, AggregatedItem>();
      for (const item of items) {
        map.set(item.code, { amount: item.amount, quality: item.quality, itemId: `item-${item.code}` });
      }
      return map;
    };

    it('returns empty array when inventories are identical', function () {
      const inventory = createAggMap([
        { code: 'wood', amount: 64 },
        { code: 'stone', amount: 32 },
      ]);

      const diffs = calculateDiffs(inventory, inventory);

      expect(diffs).to.have.length(0);
    });

    it('detects added items', function () {
      const previous = createAggMap([{ code: 'wood', amount: 64 }]);
      const current = createAggMap([
        { code: 'wood', amount: 64 },
        { code: 'iron', amount: 16 },
      ]);

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('added');
      expect(diffs[0].itemId).to.equal('item-iron');
      expect(diffs[0].newQuantity).to.equal(16);
    });

    it('detects removed items', function () {
      const previous = createAggMap([
        { code: 'wood', amount: 64 },
        { code: 'stone', amount: 32 },
      ]);
      const current = createAggMap([{ code: 'wood', amount: 64 }]);

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('removed');
      expect(diffs[0].itemId).to.equal('item-stone');
      expect(diffs[0].previousQuantity).to.equal(32);
    });

    it('detects quantity changes (partial stack consumption)', function () {
      const previous = createAggMap([{ code: 'stone', amount: 64 }]);
      const current = createAggMap([{ code: 'stone', amount: 47 }]); // used 17

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('changed');
      expect(diffs[0].itemId).to.equal('item-stone');
      expect(diffs[0].previousQuantity).to.equal(64);
      expect(diffs[0].newQuantity).to.equal(47);
    });

    it('detects quantity changes (partial stack addition)', function () {
      const previous = createAggMap([{ code: 'iron', amount: 32 }]);
      const current = createAggMap([{ code: 'iron', amount: 64 }]); // collected more

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('changed');
      expect(diffs[0].previousQuantity).to.equal(32);
      expect(diffs[0].newQuantity).to.equal(64);
    });

    it('detects quality changes without quantity change', function () {
      const previous = createAggMap([{ code: 'pickaxe', amount: 1, quality: '50%' }]);
      const current = createAggMap([{ code: 'pickaxe', amount: 1, quality: '100%' }]); // repaired

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('changed');
      expect(diffs[0].previousQuality).to.equal('50%');
      expect(diffs[0].newQuality).to.equal('100%');
      expect(diffs[0].previousQuantity).to.equal(1);
      expect(diffs[0].newQuantity).to.equal(1);
    });

    it('handles stack split with same total (no diff)', function () {
      const previous = createAggMap([{ code: 'arrows', amount: 100 }]);
      const current = createAggMap([{ code: 'arrows', amount: 100 }]); // same total

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(0);
    });

    it('handles stack merge with same total (no diff)', function () {
      const previous = createAggMap([{ code: 'wood', amount: 64 }]);
      const current = createAggMap([{ code: 'wood', amount: 64 }]); // same total

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(0);
    });

    it('handles empty previous inventory (first observation)', function () {
      const previous = createAggMap([]);
      const current = createAggMap([
        { code: 'wood', amount: 10 },
        { code: 'stone', amount: 5 },
      ]);

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(2);
      expect(diffs.every((d) => d.changeType === 'added')).to.be.true;
    });

    it('handles empty current inventory (dropped everything)', function () {
      const previous = createAggMap([
        { code: 'wood', amount: 10 },
        { code: 'stone', amount: 5 },
      ]);
      const current = createAggMap([]);

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(2);
      expect(diffs.every((d) => d.changeType === 'removed')).to.be.true;
    });

    it('handles both empty inventories (no diff)', function () {
      const previous = createAggMap([]);
      const current = createAggMap([]);

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(0);
    });

    it('handles add, remove, and change in single diff', function () {
      const previous = createAggMap([
        { code: 'wood', amount: 64 },
        { code: 'stone', amount: 32 },
      ]);
      const current = createAggMap([
        { code: 'wood', amount: 48 }, // changed: 64 -> 48
        { code: 'iron', amount: 16 }, // added
        // stone removed
      ]);

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(3);

      const woodDiff = diffs.find((d) => d.itemId === 'item-wood');
      const ironDiff = diffs.find((d) => d.itemId === 'item-iron');
      const stoneDiff = diffs.find((d) => d.itemId === 'item-stone');

      expect(woodDiff?.changeType).to.equal('changed');
      expect(woodDiff?.previousQuantity).to.equal(64);
      expect(woodDiff?.newQuantity).to.equal(48);

      expect(ironDiff?.changeType).to.equal('added');
      expect(ironDiff?.newQuantity).to.equal(16);

      expect(stoneDiff?.changeType).to.equal('removed');
      expect(stoneDiff?.previousQuantity).to.equal(32);
    });

    it('handles quality undefined to defined', function () {
      const previous = createAggMap([{ code: 'sword', amount: 1 }]); // no quality
      const current = createAggMap([{ code: 'sword', amount: 1, quality: '90%' }]);

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('changed');
      expect(diffs[0].previousQuality).to.be.undefined;
      expect(diffs[0].newQuality).to.equal('90%');
    });

    it('handles quality defined to undefined', function () {
      const previous = createAggMap([{ code: 'sword', amount: 1, quality: '90%' }]);
      const current = createAggMap([{ code: 'sword', amount: 1 }]); // quality removed

      const diffs = calculateDiffs(previous, current);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('changed');
      expect(diffs[0].previousQuality).to.equal('90%');
      expect(diffs[0].newQuality).to.be.undefined;
    });
  });

  describe('aggregateByCode + calculateDiffs integration', function () {
    it('correctly handles multiple stacks becoming single stack', function () {
      // Previous: 2 stacks of wood (64 + 32 = 96)
      // Current: 1 stack of wood (64)
      const previousItems = [
        { code: 'wood', amount: 64 },
        { code: 'wood', amount: 32 },
      ];
      const currentItems = [{ code: 'wood', amount: 64 }];
      const itemDefs = createItemDefs(['wood']);

      const prevMap = aggregateByCode(previousItems, itemDefs);
      const currMap = aggregateByCode(currentItems, itemDefs);

      // Previous aggregated: wood = 96
      // Current aggregated: wood = 64
      expect(prevMap.get('wood')?.amount).to.equal(96);
      expect(currMap.get('wood')?.amount).to.equal(64);

      const diffs = calculateDiffs(prevMap, currMap);

      expect(diffs).to.have.length(1);
      expect(diffs[0].changeType).to.equal('changed');
      expect(diffs[0].previousQuantity).to.equal(96);
      expect(diffs[0].newQuantity).to.equal(64);
    });

    it('correctly handles single stack becoming multiple stacks with same total', function () {
      // Previous: 1 stack of arrows (100)
      // Current: 2 stacks of arrows (50 + 50 = 100)
      const previousItems = [{ code: 'arrows', amount: 100 }];
      const currentItems = [
        { code: 'arrows', amount: 50 },
        { code: 'arrows', amount: 50 },
      ];
      const itemDefs = createItemDefs(['arrows']);

      const prevMap = aggregateByCode(previousItems, itemDefs);
      const currMap = aggregateByCode(currentItems, itemDefs);

      // Both aggregate to 100
      expect(prevMap.get('arrows')?.amount).to.equal(100);
      expect(currMap.get('arrows')?.amount).to.equal(100);

      const diffs = calculateDiffs(prevMap, currMap);

      // No diff since total is the same
      expect(diffs).to.have.length(0);
    });
  });
});
