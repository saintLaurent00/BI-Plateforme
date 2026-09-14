import React, { useState } from 'react';
import {
  X,
  Move,
  Rows,
  Columns,
  BarChart,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  CornerUpLeft,
  Check,
  FolderTree
} from 'lucide-react';
import { DashboardItemData } from './types';
import { getAllContainers, canMoveToContainer } from './treeUtils';
import { cn } from '../../core/utils/utils';

interface MoveLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DashboardItemData | null;
  allItems: DashboardItemData[];
  onMoveToContainer: (sourceId: string, targetContainerId: string | 'root', position?: 'start' | 'end' | number) => void;
  onMoveStep: (sourceId: string, direction: 'prev' | 'next') => void;
  onExtractToRoot: (sourceId: string) => void;
  isNested: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const MoveLayoutModal: React.FC<MoveLayoutModalProps> = ({
  isOpen,
  onClose,
  item,
  allItems,
  onMoveToContainer,
  onMoveStep,
  onExtractToRoot,
  isNested,
  canMoveUp,
  canMoveDown
}) => {
  if (!isOpen || !item) return null;

  const isRow = item.type === 'row';
  const isCol = item.type === 'column';
  const itemName = item.meta?.title || (isRow ? 'Ligne' : isCol ? 'Colonne' : item.content?.name || 'Composant');

  // Filter out containers that are the item itself or descendants of the item
  const allContainers = getAllContainers(allItems);
  const eligibleContainers = allContainers.filter(c => canMoveToContainer(allItems, item.id, c.id));

  const [selectedTarget, setSelectedTarget] = useState<string>('root');
  const [targetPosition, setTargetPosition] = useState<'start' | 'end'>('end');

  const handleApplyMove = () => {
    onMoveToContainer(item.id, selectedTarget, targetPosition);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs",
              isRow ? "bg-indigo-600 text-white" : isCol ? "bg-emerald-600 text-white" : "bg-slate-800 text-white"
            )}>
              <Move className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Déplacer le layout
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {itemName} • <span className="font-semibold">{isRow ? 'Ligne' : isCol ? 'Colonne' : 'Composant'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Quick Actions (Move Up / Down / Extract to Root) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Déplacement rapide
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  onMoveStep(item.id, 'prev');
                  onClose();
                }}
                disabled={!canMoveUp}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
              >
                <ArrowUp className="w-4 h-4 text-indigo-600" />
                <span>Monter</span>
              </button>

              <button
                onClick={() => {
                  onMoveStep(item.id, 'next');
                  onClose();
                }}
                disabled={!canMoveDown}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none rounded-xl text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
              >
                <ArrowDown className="w-4 h-4 text-indigo-600" />
                <span>Descendre</span>
              </button>

              {isNested && (
                <button
                  onClick={() => {
                    onExtractToRoot(item.id);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold transition-colors col-span-2 sm:col-span-1 shadow-2xs"
                  title="Extraire cet élément hors de son conteneur actuel vers le niveau principal"
                >
                  <CornerUpLeft className="w-4 h-4" />
                  <span>Vers racine</span>
                </button>
              )}
            </div>
          </div>

          {/* Target Container Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span>Choisir le conteneur de destination</span>
              <span className="text-slate-400 font-normal">Collision gérée auto</span>
            </label>

            <div className="space-y-1.5 border border-slate-200 rounded-xl p-2 bg-slate-50/60 max-h-52 overflow-y-auto custom-scrollbar">
              {/* Option: Racine */}
              <div
                onClick={() => setSelectedTarget('root')}
                className={cn(
                  "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs font-semibold",
                  selectedTarget === 'root'
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70"
                )}
              >
                <div className="flex items-center gap-2">
                  <FolderTree className={cn("w-4 h-4", selectedTarget === 'root' ? "text-indigo-200" : "text-indigo-600")} />
                  <span>Niveau principal (Racine du tableau de bord)</span>
                </div>
                {selectedTarget === 'root' && <Check className="w-4 h-4 text-white" />}
              </div>

              {/* Containers in tree */}
              {eligibleContainers.map(c => {
                const isTargetSelected = selectedTarget === c.id;
                const isCRow = c.type === 'row';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedTarget(c.id)}
                    className={cn(
                      "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs font-semibold",
                      isTargetSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {isCRow ? (
                        <Rows className={cn("w-4 h-4 shrink-0", isTargetSelected ? "text-indigo-200" : "text-indigo-600")} />
                      ) : (
                        <Columns className={cn("w-4 h-4 shrink-0", isTargetSelected ? "text-emerald-200" : "text-emerald-600")} />
                      )}
                      <span className="truncate">{c.name}</span>
                    </div>
                    {isTargetSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Position in Target */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Position dans le conteneur
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetPosition('start')}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2",
                  targetPosition === 'start'
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>Au début (1er élément)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetPosition('end')}
                className={cn(
                  "py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2",
                  targetPosition === 'end'
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>À la fin (Dernier élément)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 italic mt-1">
              * Si le conteneur dépasse 12 colonnes, les éléments adjacents seront automatiquement repoussés sans chevauchement.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleApplyMove}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Déplacer maintenant</span>
          </button>
        </div>
      </div>
    </div>
  );
};
