import { DashboardItemData } from './types';
import { pushAdjacentItemsOnInsert } from './collisionUtils';

/**
 * Finds a node anywhere in the tree by ID
 */
export const findNode = (nodes: DashboardItemData[], id: string): DashboardItemData | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children && node.children.length > 0) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Finds the parent container and siblings of a node
 */
export const findParentInfo = (
  nodes: DashboardItemData[], 
  id: string, 
  parent: DashboardItemData | null = null
): { parent: DashboardItemData | null; index: number; siblings: DashboardItemData[] } | null => {
  const index = nodes.findIndex(n => n.id === id);
  if (index !== -1) {
    return { parent, index, siblings: nodes };
  }
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      const res = findParentInfo(node.children, id, node);
      if (res) return res;
    }
  }
  return null;
};

/**
 * Recursively adds a child to a specific container
 */
export const addChildNode = (
  nodes: DashboardItemData[], 
  containerId: string, 
  child: DashboardItemData
): DashboardItemData[] => {
  return nodes.map(node => {
    if (node.id === containerId) {
      return {
        ...node,
        children: [...(node.children || []), child]
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: addChildNode(node.children, containerId, child)
      };
    }
    return node;
  });
};

/**
 * Recursively updates a node in the tree
 */
export const updateNode = (
  nodes: DashboardItemData[], 
  id: string, 
  updater: (node: DashboardItemData) => DashboardItemData
): DashboardItemData[] => {
  return nodes.map(node => {
    if (node.id === id) {
      return updater(node);
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateNode(node.children, id, updater)
      };
    }
    return node;
  });
};

/**
 * Recursively deletes a node by ID from anywhere in the tree
 */
export const deleteNode = (
  nodes: DashboardItemData[], 
  id: string
): DashboardItemData[] => {
  return nodes
    .filter(node => node.id !== id)
    .map(node => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteNode(node.children, id)
        };
      }
      return node;
    });
};

/**
 * Reorders a node relative to its siblings
 */
export const moveNode = (
  nodes: DashboardItemData[], 
  id: string, 
  direction: 'prev' | 'next'
): DashboardItemData[] => {
  const index = nodes.findIndex(n => n.id === id);
  if (index !== -1) {
    const targetIdx = direction === 'prev' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= nodes.length) return nodes;
    const copy = [...nodes];
    const temp = copy[targetIdx];
    copy[targetIdx] = copy[index];
    copy[index] = temp;
    return copy;
  }
  return nodes.map(node => {
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: moveNode(node.children, id, direction)
      };
    }
    return node;
  });
};

/**
 * Returns a flat list of all container nodes (rows, columns, tabs, and tab items) with breadcrumb path names
 */
export const getAllContainers = (
  nodes: DashboardItemData[], 
  prefix = ''
): { id: string; name: string; type: 'row' | 'column' | 'tabs' | 'tab' }[] => {
  let list: { id: string; name: string; type: 'row' | 'column' | 'tabs' | 'tab' }[] = [];
  let rowCount = 0;
  let colCount = 0;
  let tabCount = 0;

  nodes.forEach(node => {
    if (node.type === 'row' || node.type === 'column' || node.type === 'tabs' || node.type === 'tab') {
      let label = '';
      if (node.type === 'row') {
        rowCount++;
        label = `Ligne ${rowCount}`;
      } else if (node.type === 'column') {
        colCount++;
        label = `Colonne ${colCount}`;
      } else if (node.type === 'tabs') {
        tabCount++;
        label = node.meta?.title || `Onglets ${tabCount}`;
      } else if (node.type === 'tab') {
        label = node.meta?.title || 'Onglet';
      }

      const fullName = prefix ? `${prefix} › ${label}` : label;

      list.push({
        id: node.id,
        name: fullName,
        type: node.type
      });

      if (node.children && node.children.length > 0) {
        list = list.concat(getAllContainers(node.children, fullName));
      }
    }
  });

  return list;
};

/**
 * Checks if targetId is the same as parentId or one of its descendants
 */
export const isDescendant = (
  nodes: DashboardItemData[], 
  parentId: string, 
  targetId: string
): boolean => {
  if (parentId === targetId) return true;
  const parent = findNode(nodes, parentId);
  if (!parent || !parent.children) return false;

  const queue = [...parent.children];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.id === targetId) return true;
    if (current.children && current.children.length > 0) {
      queue.push(...current.children);
    }
  }
  return false;
};

/**
 * Moves a node relative to another node ('before', 'after', or 'inside' if target is a container)
 * with collision detection: automatically pushes adjacent items aside to prevent overlapping in grid layouts.
 */
export const moveNodeRelativeTo = (
  nodes: DashboardItemData[],
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): DashboardItemData[] => {
  if (sourceId === targetId) return nodes;

  // Prevent dragging an element into itself or into any of its own children/descendants
  if (isDescendant(nodes, sourceId, targetId)) return nodes;

  const sourceNode = findNode(nodes, sourceId);
  if (!sourceNode) return nodes;

  // 1. Remove the source node from the tree
  const treeWithoutSource = deleteNode(nodes, sourceId);

  // 2. If 'inside' target container
  if (position === 'inside') {
    const targetNode = findNode(treeWithoutSource, targetId);
    const existingChildren = targetNode?.children || [];
    const insertIdx = existingChildren.length;

    const { updatedSiblings } = pushAdjacentItemsOnInsert(
      existingChildren,
      sourceNode,
      insertIdx
    );

    return updateNode(treeWithoutSource, targetId, container => ({
      ...container,
      children: updatedSiblings
    }));
  }

  // 3. Otherwise, target position is 'before' or 'after' targetId
  const targetParentInfo = findParentInfo(treeWithoutSource, targetId);
  if (!targetParentInfo) return nodes;

  const { parent: targetParent, index: targetIdx, siblings } = targetParentInfo;
  const insertIdx = position === 'before' ? targetIdx : targetIdx + 1;

  if (!targetParent) {
    // Target is at root
    const newRoot = [...treeWithoutSource];
    newRoot.splice(insertIdx, 0, sourceNode);
    return newRoot;
  }

  // Target is inside a container (e.g. Row or Column)
  // Apply collision detection to push adjacent siblings aside so total grid cols <= 12
  const { updatedSiblings } = pushAdjacentItemsOnInsert(
    siblings,
    sourceNode,
    insertIdx
  );

  return updateNode(treeWithoutSource, targetParent.id, parent => ({
    ...parent,
    children: updatedSiblings
  }));
};

/**
 * Checks if an item can be moved to a specific target container without circular dependency
 */
export const canMoveToContainer = (
  nodes: DashboardItemData[],
  sourceId: string,
  targetContainerId: string | 'root'
): boolean => {
  if (targetContainerId === 'root') return true;
  if (sourceId === targetContainerId) return false;
  return !isDescendant(nodes, sourceId, targetContainerId);
};

/**
 * Moves a node directly to a target container (or root) with collision detection
 */
export const moveNodeToContainer = (
  nodes: DashboardItemData[],
  sourceId: string,
  targetContainerId: string | 'root',
  position: 'start' | 'end' | number = 'end'
): DashboardItemData[] => {
  if (targetContainerId !== 'root' && !canMoveToContainer(nodes, sourceId, targetContainerId)) {
    return nodes;
  }

  const sourceNode = findNode(nodes, sourceId);
  if (!sourceNode) return nodes;

  const treeWithoutSource = deleteNode(nodes, sourceId);

  if (targetContainerId === 'root') {
    if (position === 'start') {
      return [sourceNode, ...treeWithoutSource];
    } else if (typeof position === 'number') {
      const copy = [...treeWithoutSource];
      copy.splice(position, 0, sourceNode);
      return copy;
    }
    return [...treeWithoutSource, sourceNode];
  }

  // Move into target container with collision detection
  return updateNode(treeWithoutSource, targetContainerId, container => {
    const existingChildren = container.children || [];
    let insertIdx = existingChildren.length;
    if (position === 'start') {
      insertIdx = 0;
    } else if (typeof position === 'number') {
      insertIdx = Math.max(0, Math.min(existingChildren.length, position));
    }

    const { updatedSiblings } = pushAdjacentItemsOnInsert(
      existingChildren,
      sourceNode,
      insertIdx
    );

    return {
      ...container,
      children: updatedSiblings
    };
  });
};

/**
 * Extracts a nested layout or item out of its container and places it at root right next to the container
 */
export const extractNodeToRoot = (
  nodes: DashboardItemData[],
  sourceId: string
): DashboardItemData[] => {
  const parentInfo = findParentInfo(nodes, sourceId);
  if (!parentInfo || !parentInfo.parent) {
    return nodes; // Already at root
  }

  const sourceNode = findNode(nodes, sourceId);
  if (!sourceNode) return nodes;

  const parentId = parentInfo.parent.id;
  const treeWithoutSource = deleteNode(nodes, sourceId);

  // Find where parent is in the tree
  const rootParentInfo = findParentInfo(treeWithoutSource, parentId);
  if (!rootParentInfo || !rootParentInfo.parent) {
    // Parent is at root: place extracted node right after parent
    const parentIdx = treeWithoutSource.findIndex(n => n.id === parentId);
    const newRoot = [...treeWithoutSource];
    newRoot.splice(parentIdx + 1, 0, sourceNode);
    return newRoot;
  }

  // Parent is also nested, extract up one level
  const grandParentId = rootParentInfo.parent.id;
  return updateNode(treeWithoutSource, grandParentId, gp => {
    const children = [...(gp.children || [])];
    const parentIdx = children.findIndex(c => c.id === parentId);
    children.splice(parentIdx + 1, 0, sourceNode);
    return {
      ...gp,
      children
    };
  });
};

/**
 * Moves a node to root level (e.g. at the beginning or end of root)
 */
export const moveNodeToRoot = (
  nodes: DashboardItemData[],
  sourceId: string,
  atBeginning = false
): DashboardItemData[] => {
  const sourceNode = findNode(nodes, sourceId);
  if (!sourceNode) return nodes;

  const treeWithoutSource = deleteNode(nodes, sourceId);
  if (atBeginning) {
    return [sourceNode, ...treeWithoutSource];
  }
  return [...treeWithoutSource, sourceNode];
};
