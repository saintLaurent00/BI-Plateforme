import React, { createContext, useContext, useState, useCallback } from 'react';
import { DashboardItemData } from './types';
import { isDescendant } from './treeUtils';

export interface DragOverTarget {
  targetId: string;
  position: 'before' | 'after' | 'inside';
  snapColumn?: number; // 1 to 12
  snapSpan?: number; // width in columns
  isSnapped?: boolean;
}

export interface ActiveSnapGuide {
  colStart: number; // 1 to 12
  colSpan: number; // 1 to 12
  isSnapped: boolean;
  label?: string;
}

interface EditorDragContextType {
  draggedItemId: string | null;
  draggedItemType: string | null;
  draggedItemWidth: number;
  dragOverTarget: DragOverTarget | null;
  startDrag: (id: string, type: string, width?: number) => void;
  endDrag: () => void;
  setDragOverTarget: (target: DragOverTarget | null) => void;
  canDropOn: (targetId: string) => boolean;
  onDropItem: (targetId: string, position: 'before' | 'after' | 'inside') => void;
  // Snapping & Grid guides
  isSnapToGridEnabled: boolean;
  setSnapToGrid: (enabled: boolean) => void;
  toggleSnapToGrid: () => void;
  showGridGuides: boolean;
  setShowGridGuides: (show: boolean) => void;
  toggleGridGuides: () => void;
  activeSnapGuide: ActiveSnapGuide | null;
  setActiveSnapGuide: (guide: ActiveSnapGuide | null) => void;
  resizingItemId: string | null;
  setResizingItemId: (id: string | null) => void;
  resizingColWidth: number | null;
  setResizingColWidth: (w: number | null) => void;
}

const EditorDragContext = createContext<EditorDragContextType | null>(null);

export interface EditorDragProviderProps {
  children: React.ReactNode;
  items: DashboardItemData[];
  onDropItem: (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => void;
}

export const EditorDragProvider: React.FC<EditorDragProviderProps> = ({
  children,
  items,
  onDropItem
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedItemType, setDraggedItemType] = useState<string | null>(null);
  const [draggedItemWidth, setDraggedItemWidth] = useState<number>(6);
  const [dragOverTarget, setDragOverTarget] = useState<DragOverTarget | null>(null);

  // Snapping & Grid guides
  const [isSnapToGridEnabled, setIsSnapToGridEnabled] = useState<boolean>(true);
  const [showGridGuides, setShowGridGuides] = useState<boolean>(false);
  const [activeSnapGuide, setActiveSnapGuide] = useState<ActiveSnapGuide | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [resizingColWidth, setResizingColWidth] = useState<number | null>(null);

  const startDrag = useCallback((id: string, type: string, width?: number) => {
    setDraggedItemId(id);
    setDraggedItemType(type);
    setDraggedItemWidth(width || (type === 'row' ? 12 : 6));
  }, []);

  const endDrag = useCallback(() => {
    setDraggedItemId(null);
    setDraggedItemType(null);
    setDragOverTarget(null);
    setActiveSnapGuide(null);
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setIsSnapToGridEnabled(prev => !prev);
  }, []);

  const toggleGridGuides = useCallback(() => {
    setShowGridGuides(prev => !prev);
  }, []);

  const canDropOn = useCallback((targetId: string) => {
    if (!draggedItemId) return false;
    if (draggedItemId === targetId) return false;
    // New items from sidebar can be dropped anywhere
    if (draggedItemId.startsWith('new-')) return true;
    // Cannot drop on own descendant
    if (isDescendant(items, draggedItemId, targetId)) return false;
    return true;
  }, [draggedItemId, items]);

  const handleDropItem = useCallback((targetId: string, position: 'before' | 'after' | 'inside') => {
    if (!draggedItemId || draggedItemId === targetId) {
      endDrag();
      return;
    }
    if (!draggedItemId.startsWith('new-') && isDescendant(items, draggedItemId, targetId)) {
      endDrag();
      return;
    }

    const currentSourceId = draggedItemId;
    endDrag();
    onDropItem(currentSourceId, targetId, position);
  }, [draggedItemId, items, onDropItem, endDrag]);

  return (
    <EditorDragContext.Provider
      value={{
        draggedItemId,
        draggedItemType,
        draggedItemWidth,
        dragOverTarget,
        startDrag,
        endDrag,
        setDragOverTarget,
        canDropOn,
        onDropItem: handleDropItem,
        isSnapToGridEnabled,
        setSnapToGrid: setIsSnapToGridEnabled,
        toggleSnapToGrid,
        showGridGuides,
        setShowGridGuides,
        toggleGridGuides,
        activeSnapGuide,
        setActiveSnapGuide,
        resizingItemId,
        setResizingItemId,
        resizingColWidth,
        setResizingColWidth,
      }}
    >
      {children}
    </EditorDragContext.Provider>
  );
};

export const useEditorDrag = () => {
  const context = useContext(EditorDragContext);
  if (!context) {
    throw new Error('useEditorDrag must be used within an EditorDragProvider');
  }
  return context;
};
