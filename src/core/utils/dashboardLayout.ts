import update from 'immutability-helper';

export const DASHBOARD_ROOT_ID = 'ROOT_ID';
export const DASHBOARD_GRID_ID = 'GRID_ID';

export interface LayoutItem {
  id: string;
  type: string;
  children: string[];
  parents: string[];
  meta: any;
  content?: any;
}

export type Layout = Record<string, LayoutItem>;

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Normalizes a nested layout into a flat object.
 */
export const normalizeLayout = (nestedLayout: any[]): Layout => {
  const layout: Layout = {
    [DASHBOARD_ROOT_ID]: {
      id: DASHBOARD_ROOT_ID,
      type: 'ROOT',
      children: [DASHBOARD_GRID_ID],
      parents: [],
      meta: {}
    },
    [DASHBOARD_GRID_ID]: {
      id: DASHBOARD_GRID_ID,
      type: 'GRID',
      children: [],
      parents: [DASHBOARD_ROOT_ID],
      meta: {}
    }
  };

  const traverse = (elements: any[], parentId: string) => {
    elements.forEach(el => {
      const id = el.id || generateId();
      layout[id] = {
        id,
        type: el.type,
        children: [],
        parents: [parentId],
        meta: el.meta || {},
        content: el.content
      };
      
      if (parentId && layout[parentId]) {
        layout[parentId].children.push(id);
      }

      if (el.children && el.children.length > 0) {
        traverse(el.children, id);
      }
    });
  };

  traverse(nestedLayout, DASHBOARD_GRID_ID);
  return layout;
};

/**
 * Denormalizes a flat layout into a nested structure for rendering or saving.
 */
export const denormalizeLayout = (layout: Layout, rootId: string = DASHBOARD_GRID_ID): any[] => {
  const item = layout[rootId];
  if (!item) return [];

  return item.children.map(childId => {
    const child = layout[childId];
    return {
      id: child.id,
      type: child.type,
      meta: child.meta,
      content: child.content,
      children: denormalizeLayout(layout, childId)
    };
  });
};

/**
 * Validation rules for dropping elements.
 */
export const isValidChild = (type: string, parentType: string): boolean => {
  const t = type?.toLowerCase();
  const p = parentType?.toLowerCase();

  const allElements = ['row', 'column', 'header', 'markdown', 'divider', 'tabs', 'chart'];

  const rules: Record<string, string[]> = {
    'root': ['grid'],
    'grid': allElements,
    'row': allElements,
    'column': allElements,
    'tabs': ['tab'],
    'tab': allElements
  };

  return rules[p]?.includes(t) || false;
};

/**
 * Creates a new layout item.
 */
export const createItem = (type: string, content?: any): LayoutItem => {
  const id = generateId();
  return {
    id,
    type,
    children: [],
    parents: [],
    meta: {
      width: 12,
      height: type === 'chart' ? 300 : (type === 'row' || type === 'column' ? 150 : undefined),
      backgroundColor: 'transparent',
      title: type === 'tab' ? 'Tab title' : (type === 'tabs' ? 'Tabs' : undefined)
    },
    content
  };
};

/**
 * Moves an item within the layout.
 */
export const moveItem = (
  layout: Layout,
  id: string,
  sourceParentId: string,
  targetParentId: string,
  targetIndex: number,
  newItem?: LayoutItem
): Layout => {
  console.log(`Moving item ${id} from ${sourceParentId} to ${targetParentId} at index ${targetIndex}`);
  
  const targetParent = layout[targetParentId];
  if (!targetParent) {
    console.error(`Target parent ${targetParentId} not found`);
    return layout;
  }

  let nextLayout = { ...layout };
  let itemId = id;

  // 1. Handle new item creation
  if (sourceParentId === 'NEW' && newItem) {
    itemId = newItem.id;
    nextLayout[itemId] = { ...newItem, parents: [targetParentId] };
    console.log(`Created new item ${itemId} of type ${newItem.type}`);
    
    // Special case for Tabs: add a default tab
    if (newItem.type.toLowerCase() === 'tabs') {
      const tabId = generateId();
      nextLayout[tabId] = {
        id: tabId,
        type: 'tab',
        children: [],
        parents: [itemId],
        meta: { title: 'Tab 1' }
      };
      nextLayout[itemId].children = [tabId];
    }
  } else {
    const sourceParent = layout[sourceParentId];
    if (!sourceParent) {
      console.error(`Source parent ${sourceParentId} not found`);
      return layout;
    }

    const sourceIndex = sourceParent.children.indexOf(id);
    if (sourceIndex === -1) {
      console.error(`Item ${id} not found in source parent ${sourceParentId}`);
      return layout;
    }

    // Remove from source
    const newSourceChildren = [...sourceParent.children];
    newSourceChildren.splice(sourceIndex, 1);
    nextLayout[sourceParentId] = { ...sourceParent, children: newSourceChildren };
    
    // Adjust target index if same parent
    if (sourceParentId === targetParentId && targetIndex > sourceIndex) {
      targetIndex--;
    }
  }

  // 2. Add to target
  const finalTargetParent = nextLayout[targetParentId];
  const newTargetChildren = [...finalTargetParent.children];
  newTargetChildren.splice(targetIndex, 0, itemId);
  
  nextLayout[targetParentId] = { ...finalTargetParent, children: newTargetChildren };
  nextLayout[itemId] = { ...nextLayout[itemId], parents: [targetParentId] };

  console.log(`Move successful. New layout keys: ${Object.keys(nextLayout).length}`);
  return nextLayout;
};
