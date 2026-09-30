import React from 'react';
import { useEditorDrag } from './EditorDragContext';
import { cn } from '../../core/utils/utils';
import { Magnet } from 'lucide-react';

interface GridOverlayProps {
  className?: string;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({ className }) => {
  const {
    draggedItemId,
    showGridGuides,
    isSnapToGridEnabled,
    activeSnapGuide,
    resizingItemId,
    resizingColWidth
  } = useEditorDrag();

  const isInteracting = Boolean(draggedItemId || resizingItemId);
  const isVisible = showGridGuides || isInteracting;

  if (!isVisible) return null;

  // Determine active columns from activeSnapGuide or resizingColWidth
  const activeStart = activeSnapGuide?.colStart ?? 1;
  const activeSpan = resizingColWidth ?? activeSnapGuide?.colSpan ?? 0;
  const activeEnd = activeStart + activeSpan - 1;
  const hasActiveHighlight = isInteracting && activeSpan > 0;

  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-0 transition-opacity duration-200 select-none",
        isInteracting ? "opacity-100" : "opacity-40 hover:opacity-75",
        className
      )}
      aria-hidden="true"
    >
      {/* Top Floating Grid Snapping Banner (when dragging or resizing with snapping) */}
      {isInteracting && isSnapToGridEnabled && (
        <div className="sticky top-2 z-30 flex justify-center mb-2 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/90 text-white rounded-full shadow-lg border border-slate-700/60 backdrop-blur-xs text-xs font-semibold">
            <Magnet className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>
              {activeSnapGuide?.label || (
                resizingColWidth
                  ? `Aimantation active : ${resizingColWidth}/12 colonnes (${Math.round((resizingColWidth / 12) * 100)}%)`
                  : 'Aimantation à la grille 12 colonnes active'
              )}
            </span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.2 rounded-full font-mono">
              Pas de 8.33%
            </span>
          </div>
        </div>
      )}

      {/* Grid Ruler Header Bar */}
      <div className="grid grid-cols-12 gap-6 px-1 mb-2">
        {Array.from({ length: 12 }, (_, i) => {
          const colNum = i + 1;
          const isColActive = hasActiveHighlight && colNum >= activeStart && colNum <= activeEnd;
          const isEdge = hasActiveHighlight && (colNum === activeStart || colNum === activeEnd);

          return (
            <div
              key={colNum}
              className={cn(
                "h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-100 border",
                isColActive
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-xs scale-105"
                  : isEdge
                  ? "bg-indigo-500 text-white border-indigo-400"
                  : "bg-white/80 text-slate-400 border-slate-200/80 shadow-2xs"
              )}
            >
              <span>{colNum}</span>
            </div>
          );
        })}
      </div>

      {/* 12 Vertical Column Tracks */}
      <div className="grid grid-cols-12 gap-6 h-full min-h-[650px]">
        {Array.from({ length: 12 }, (_, i) => {
          const colNum = i + 1;
          const isColActive = hasActiveHighlight && colNum >= activeStart && colNum <= activeEnd;
          const isFirstCol = colNum === activeStart;
          const isLastCol = colNum === activeEnd;

          return (
            <div
              key={colNum}
              className={cn(
                "h-full rounded-xl transition-all duration-100 flex flex-col justify-between p-2 relative",
                isColActive
                  ? "bg-indigo-500/10 border-2 border-indigo-500/60 shadow-xs"
                  : "bg-indigo-500/[0.02] border border-dashed border-indigo-300/30"
              )}
            >
              {/* Top Column Identifier */}
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <span className={cn(isColActive ? "text-indigo-600 font-bold" : "opacity-40")}>
                  Col {colNum}
                </span>
                {isColActive && isFirstCol && (
                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono shadow-2xs">
                    Début
                  </span>
                )}
                {isColActive && isLastCol && activeSpan > 1 && (
                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-mono shadow-2xs">
                    Fin
                  </span>
                )}
              </div>

              {/* Center Magnetic Guidelines Indicator */}
              {isColActive && (
                <div className="flex-1 flex items-center justify-center my-auto">
                  <div className="w-1 h-12 bg-indigo-400/40 rounded-full animate-pulse" />
                </div>
              )}

              {/* Bottom Column Width indicator */}
              <div className="text-[9px] font-mono text-center text-slate-400/70">
                {Math.round((colNum / 12) * 100)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
