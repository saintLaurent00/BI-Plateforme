import { DashboardItemData } from './types';
import { findParentInfo, updateNode, findNode } from './treeUtils';

export const TOTAL_GRID_COLS = 12;
export const MIN_ITEM_COLS = 1;
export const DEFAULT_MIN_COLS = 2;

export interface CollisionResult {
  hasCollision: boolean;
  totalSpan: number;
  excess: number;
  pushedItemIds: string[];
}

/**
 * Calculates the sum of column widths for a list of items
 */
export const getSiblingsTotalWidth = (items: DashboardItemData[]): number => {
  return items.reduce((sum, item) => sum + (item.meta?.width || (item.type === 'row' ? 12 : 6)), 0);
};

/**
 * Resolves grid collision when resizing an item within its sibling group.
 * Automatically pushes adjacent items aside by reducing their widths to prevent overlap.
 * 
 * @param siblings - Sibling items within the same container
 * @param resizingId - ID of the item being resized
 * @param targetWidth - Desired new width (1 to 12)
 * @returns Updated siblings array with collision resolved and adjacent items pushed aside
 */
export const pushAdjacentItemsOnResize = (
  siblings: DashboardItemData[],
  resizingId: string,
  targetWidth: number
): { updatedSiblings: DashboardItemData[]; pushedIds: string[]; clampedWidth: number } => {
  const index = siblings.findIndex(s => s.id === resizingId);
  if (index === -1) {
    return { updatedSiblings: siblings, pushedIds: [], clampedWidth: targetWidth };
  }

  const currentItem = siblings[index];
  const oldWidth = currentItem.meta?.width || (currentItem.type === 'row' ? 12 : 6);

  // If there's only 1 item, it can take up to 12 cols without collision
  if (siblings.length === 1) {
    const clamped = Math.max(MIN_ITEM_COLS, Math.min(TOTAL_GRID_COLS, targetWidth));
    return {
      updatedSiblings: [{
        ...currentItem,
        meta: { ...currentItem.meta, width: clamped }
      }],
      pushedIds: [],
      clampedWidth: clamped
    };
  }

  // Calculate available space from other siblings (each must retain at least MIN_ITEM_COLS)
  const otherSiblings = siblings.filter(s => s.id !== resizingId);
  const minRequiredByOthers = otherSiblings.length * MIN_ITEM_COLS;
  const maxPossibleWidth = Math.max(MIN_ITEM_COLS, TOTAL_GRID_COLS - minRequiredByOthers);

  // Clamp the target width to what can physically fit if all others are pushed to minimum
  const desiredWidth = Math.max(MIN_ITEM_COLS, Math.min(maxPossibleWidth, targetWidth));
  const widthDelta = desiredWidth - oldWidth;

  // If width is shrinking or staying same, no push needed
  if (widthDelta <= 0) {
    const updated = siblings.map(s => 
      s.id === resizingId 
        ? { ...s, meta: { ...s.meta, width: desiredWidth } } 
        : s
    );
    return { updatedSiblings: updated, pushedIds: [], clampedWidth: desiredWidth };
  }

  // Width is expanding: check if total exceeds 12
  const currentTotal = getSiblingsTotalWidth(siblings);
  const newTotal = currentTotal + widthDelta;

  if (newTotal <= TOTAL_GRID_COLS) {
    // Fits without pushing others
    const updated = siblings.map(s => 
      s.id === resizingId 
        ? { ...s, meta: { ...s.meta, width: desiredWidth } } 
        : s
    );
    return { updatedSiblings: updated, pushedIds: [], clampedWidth: desiredWidth };
  }

  // Collision detected! Excess columns to absorb from adjacent items
  let excess = newTotal - TOTAL_GRID_COLS;
  const pushedIds: string[] = [];

  // Clone siblings
  const result = siblings.map(s => ({
    ...s,
    meta: { ...s.meta, width: s.meta?.width || (s.type === 'row' ? 12 : 6) }
  }));

  // Set the resized item's new width
  result[index].meta.width = desiredWidth;

  // Priority for pushing: First adjacent items to the right, then items to the left
  const pushOrder: number[] = [];
  // Right siblings (from index + 1 to end)
  for (let i = index + 1; i < result.length; i++) {
    pushOrder.push(i);
  }
  // Left siblings (from index - 1 down to 0)
  for (let i = index - 1; i >= 0; i--) {
    pushOrder.push(i);
  }

  // Push each adjacent sibling by reducing its width down to MIN_ITEM_COLS
  for (const i of pushOrder) {
    if (excess <= 0) break;
    const currentSiblingWidth = result[i].meta.width;
    const canYield = currentSiblingWidth - MIN_ITEM_COLS;
    if (canYield > 0) {
      const take = Math.min(excess, canYield);
      result[i].meta.width -= take;
      excess -= take;
      pushedIds.push(result[i].id);
    }
  }

  return {
    updatedSiblings: result,
    pushedIds,
    clampedWidth: desiredWidth
  };
};

/**
 * Resolves grid collision when inserting or dropping an item among siblings.
 * Automatically pushes adjacent items aside and reduces widths harmoniously
 * so that total column span does not exceed 12.
 */
export const pushAdjacentItemsOnInsert = (
  siblings: DashboardItemData[],
  newItem: DashboardItemData,
  insertIndex: number
): { updatedSiblings: DashboardItemData[]; pushedIds: string[] } => {
  const itemWidth = newItem.meta?.width || (newItem.type === 'row' ? 12 : 6);

  // If container is empty, item takes its width (capped at 12)
  if (siblings.length === 0) {
    return {
      updatedSiblings: [{
        ...newItem,
        meta: { ...newItem.meta, width: Math.min(TOTAL_GRID_COLS, Math.max(MIN_ITEM_COLS, itemWidth)) }
      }],
      pushedIds: []
    };
  }

  const currentTotal = getSiblingsTotalWidth(siblings);
  const totalWithNew = currentTotal + itemWidth;

  // If it fits within 12 columns, simply insert
  if (totalWithNew <= TOTAL_GRID_COLS) {
    const list = [...siblings];
    list.splice(insertIndex, 0, newItem);
    return { updatedSiblings: list, pushedIds: [] };
  }

  // Collision detected! Auto-push adjacent items aside.
  // Calculate total items after insertion
  const totalItems = siblings.length + 1;
  const pushedIds: string[] = [];

  // Make a working copy of siblings with explicit widths
  const cloned = siblings.map(s => ({
    ...s,
    meta: { ...s.meta, width: s.meta?.width || (s.type === 'row' ? 12 : 6) }
  }));

  // Target width for the inserted item
  // If many items, give fair share: max(2, floor(12 / totalItems))
  const fairWidth = Math.max(DEFAULT_MIN_COLS, Math.floor(TOTAL_GRID_COLS / totalItems));
  const effectiveNewWidth = Math.min(itemWidth, Math.max(DEFAULT_MIN_COLS, TOTAL_GRID_COLS - (siblings.length * MIN_ITEM_COLS)));

  // Insert the item first
  const inserted = {
    ...newItem,
    meta: { ...newItem.meta, width: effectiveNewWidth }
  };
  cloned.splice(insertIndex, 0, inserted);

  // Recalculate excess after initial insertion
  let excess = getSiblingsTotalWidth(cloned) - TOTAL_GRID_COLS;

  if (excess > 0) {
    // Identify adjacent items to push aside (nearest to insertion point first)
    const indicesByDistance = cloned
      .map((_, idx) => idx)
      .filter(idx => idx !== insertIndex)
      .sort((a, b) => Math.abs(a - insertIndex) - Math.abs(b - insertIndex));

    for (const idx of indicesByDistance) {
      if (excess <= 0) break;
      const curW = cloned[idx].meta.width;
      const canYield = curW - DEFAULT_MIN_COLS;
      if (canYield > 0) {
        const take = Math.min(excess, canYield);
        cloned[idx].meta.width -= take;
        excess -= take;
        pushedIds.push(cloned[idx].id);
      }
    }

    // If still excess, allow reducing down to MIN_ITEM_COLS (1)
    if (excess > 0) {
      for (const idx of indicesByDistance) {
        if (excess <= 0) break;
        const curW = cloned[idx].meta.width;
        const canYield = curW - MIN_ITEM_COLS;
        if (canYield > 0) {
          const take = Math.min(excess, canYield);
          cloned[idx].meta.width -= take;
          excess -= take;
          if (!pushedIds.includes(cloned[idx].id)) {
            pushedIds.push(cloned[idx].id);
          }
        }
      }
    }

    // If still excess (extreme case), reduce inserted item's width
    if (excess > 0) {
      const curW = cloned[insertIndex].meta.width;
      const canYield = curW - MIN_ITEM_COLS;
      if (canYield > 0) {
        const take = Math.min(excess, canYield);
        cloned[insertIndex].meta.width -= take;
        excess -= take;
      }
    }
  }

  return {
    updatedSiblings: cloned,
    pushedIds
  };
};

/**
 * Updates an item's width in the tree and applies collision detection
 * to automatically push adjacent sibling items aside if in a container.
 */
export const updateItemWidthWithCollision = (
  nodes: DashboardItemData[],
  itemId: string,
  newWidth: number
): { updatedNodes: DashboardItemData[]; pushedIds: string[]; clampedWidth: number } => {
  const parentInfo = findParentInfo(nodes, itemId);
  
  if (!parentInfo || !parentInfo.parent) {
    // Root level: items are generally full rows or independent
    const clamped = Math.max(MIN_ITEM_COLS, Math.min(TOTAL_GRID_COLS, newWidth));
    const updated = updateNode(nodes, itemId, item => ({
      ...item,
      meta: { ...item.meta, width: clamped }
    }));
    return { updatedNodes: updated, pushedIds: [], clampedWidth: clamped };
  }

  // Parent container found (e.g. Row containing columns/charts)
  const { parent, siblings } = parentInfo;

  const { updatedSiblings, pushedIds, clampedWidth } = pushAdjacentItemsOnResize(
    siblings,
    itemId,
    newWidth
  );

  // Update the parent's children with the collision-resolved siblings
  const updatedNodes = updateNode(nodes, parent.id, p => ({
    ...p,
    children: updatedSiblings
  }));

  return { updatedNodes, pushedIds, clampedWidth };
};

/**
 * Moves a node relative to another with collision detection.
 * When an item is moved or dropped, adjacent items are automatically pushed aside.
 */
export const moveNodeWithCollision = (
  nodes: DashboardItemData[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): { updatedNodes: DashboardItemData[]; pushedIds: string[] } => {
  if (sourceId === targetId) return { updatedNodes: nodes, pushedIds: [] };

  const sourceNode = findNode(nodes, sourceId);
  if (!sourceNode) return { updatedNodes: nodes, pushedIds: [] };

  // 1. Remove source from tree
  const treeWithoutSource = deleteNodeFromTree(nodes, sourceId);

  // 2. If 'inside' target container
  if (position === 'inside') {
    const targetNode = findNode(treeWithoutSource, targetId);
    const existingChildren = targetNode?.children || [];
    const insertIdx = existingChildren.length;

    const { updatedSiblings, pushedIds } = pushAdjacentItemsOnInsert(
      existingChildren,
      sourceNode,
      insertIdx
    );

    const updatedTree = updateNode(treeWithoutSource, targetId, node => ({
      ...node,
      children: updatedSiblings
    }));

    return { updatedNodes: updatedTree, pushedIds };
  }

  // 3. Otherwise position is 'before' or 'after' targetId
  const targetParentInfo = findParentInfo(treeWithoutSource, targetId);
  if (!targetParentInfo) return { updatedNodes: nodes, pushedIds: [] };

  const { parent: targetParent, index: targetIdx, siblings } = targetParentInfo;
  const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;

  if (!targetParent) {
    // Target is at root
    const newRoot = [...treeWithoutSource];
    newRoot.splice(insertIdx, 0, sourceNode);
    return { updatedNodes: newRoot, pushedIds: [] };
  }

  // Target is inside a container (e.g. Row or Column)
  const { updatedSiblings, pushedIds } = pushAdjacentItemsOnInsert(
    siblings,
    sourceNode,
    insertIdx
  );

  const updatedTree = updateNode(treeWithoutSource, targetParent.id, p => ({
    ...p,
    children: updatedSiblings
  }));

  return { updatedNodes: updatedTree, pushedIds };
};

/**
 * Helper to delete a node without circular dependency
 */
function deleteNodeFromTree(nodes: DashboardItemData[], id: string): DashboardItemData[] {
  return nodes
    .filter(node => node.id !== id)
    .map(node => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteNodeFromTree(node.children, id)
        };
      }
      return node;
    });
}
