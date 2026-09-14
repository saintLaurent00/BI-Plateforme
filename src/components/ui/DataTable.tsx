import React, { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '../../core/utils/utils';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Table as TableIcon,
  Check,
  Rows,
  RotateCcw
} from 'lucide-react';

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  render?: (val: any, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: (DataTableColumn<T> | string)[];
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  pageSize?: number;
  enablePagination?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
  actions?: React.ReactNode;
  storageKey?: string;
}

export function DataTable<T = any>({ 
  data = [], 
  columns = [], 
  onRowClick,
  searchPlaceholder = "Rechercher...",
  showSearch = true,
  pageSize: initialPageSize = 10,
  enablePagination = true,
  exportable = true,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  title,
  subtitle,
  emptyMessage = "Aucune donnée disponible",
  className,
  actions,
  storageKey
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Normalize column definitions in case strings are passed
  const normalizedColumns = useMemo<DataTableColumn<T>[]>(() => {
    return (columns || []).map((col: any) => {
      if (typeof col === 'string') {
        return { key: col, label: col };
      }
      if (typeof col === 'object' && col !== null) {
        const key = col.key || col.column || col.alias || col.name || String(col);
        const label = col.label || col.alias || col.column || col.name || key;
        return {
          ...col,
          key,
          label
        };
      }
      return { key: String(col), label: String(col) };
    });
  }, [columns]);

  // Derive stable storage key for tracking and persisting column widths in localStorage
  const resolvedStorageKey = useMemo(() => {
    if (storageKey) return `hifadih_dt_widths_${storageKey}`;
    if (title) return `hifadih_dt_widths_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const keysSignature = normalizedColumns.map(c => c.key).join('_');
    return `hifadih_dt_widths_${keysSignature.slice(0, 50)}`;
  }, [storageKey, title, normalizedColumns]);

  // Load initial column widths from localStorage
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(resolvedStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load column widths from localStorage:', e);
    }
    return {};
  });

  // Re-sync if storage key changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(resolvedStorageKey);
      if (saved) {
        setColumnWidths(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, [resolvedStorageKey]);

  // Column header resizing states and refs
  const [resizingColKey, setResizingColKey] = useState<string | null>(null);
  const isResizingRef = useRef(false);
  const justResizedRef = useRef(false);

  // onMouseDown handler on column headers with onMouseMove and onMouseUp tracking
  const handleColumnHeaderResizeMouseDown = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    justResizedRef.current = false;
    setResizingColKey(colKey);

    const startX = e.clientX;
    const thElement = (e.currentTarget.closest('th') as HTMLElement);
    const startWidth = thElement ? thElement.getBoundingClientRect().width : (columnWidths[colKey] || 150);
    let latestWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      moveEvent.preventDefault();
      justResizedRef.current = true;

      const deltaX = moveEvent.clientX - startX;
      latestWidth = Math.max(60, Math.round(startWidth + deltaX));

      // Update state for real-time visual feedback
      setColumnWidths(prev => {
        const updated = { ...prev, [colKey]: latestWidth };
        // Continuously update localStorage so width changes are tracked and saved
        try {
          localStorage.setItem(resolvedStorageKey, JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to write column widths to localStorage:', err);
        }
        return updated;
      });
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      upEvent.preventDefault();
      isResizingRef.current = false;
      setResizingColKey(null);

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Final commit of column width changes to localStorage
      try {
        setColumnWidths(prev => {
          const final = { ...prev, [colKey]: latestWidth };
          localStorage.setItem(resolvedStorageKey, JSON.stringify(final));
          return final;
        });
      } catch (err) {
        console.error('Failed to save column widths to localStorage:', err);
      }

      // Prevent onClick sorting from triggering on release
      setTimeout(() => {
        justResizedRef.current = false;
      }, 150);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Reset custom column widths
  const handleResetColumnWidths = () => {
    setColumnWidths({});
    try {
      localStorage.removeItem(resolvedStorageKey);
    } catch (e) {
      console.error('Failed to clear column widths from localStorage:', e);
    }
  };

  // Filter logic
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => {
      if (!row) return false;
      return Object.keys(row).some(key => {
        const val = row[key];
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(lowerSearch);
        return String(val).toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, searchTerm]);

  // Sort logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Reset page on search or sort change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, pageSize]);

  // Pagination bounds
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!data.length) return;
    const headers = normalizedColumns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
    const rows = sortedData.map(row => {
      return normalizedColumns.map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        else if (typeof val === 'object') val = JSON.stringify(val);
        else val = String(val);
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title ? title.toLowerCase().replace(/\s+/g, '_') : 'export'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Selection logic
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(r => selectedRows.includes(r));
  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      onSelectionChange(selectedRows.filter(r => !paginatedData.includes(r)));
    } else {
      const combined = [...new Set([...selectedRows, ...paginatedData])];
      onSelectionChange(combined);
    }
  };

  const toggleSelectRow = (e: React.MouseEvent, row: T) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedRows.includes(row)) {
      onSelectionChange(selectedRows.filter(r => r !== row));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Header bar & Search controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-3 rounded-2xl border border-border/60">
        <div className="flex items-center gap-3">
          {(title || subtitle) && (
            <div>
              {title && <h4 className="text-sm font-bold text-foreground tracking-tight">{title}</h4>}
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {showSearch && (
            <div className="relative group max-w-sm w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-background border border-border/80 rounded-xl text-xs font-medium focus:ring-4 ring-accent/10 focus:border-accent transition-all shadow-xs"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Badge count */}
          <span className="text-[11px] font-semibold text-muted-foreground bg-background px-3 py-1 rounded-lg border border-border/60">
            {filteredData.length} {filteredData.length > 1 ? 'entrées' : 'entrée'}
          </span>

          {/* Reset column widths button if any custom widths are saved */}
          {Object.keys(columnWidths).length > 0 && (
            <button
              type="button"
              onClick={handleResetColumnWidths}
              title="Réinitialiser la largeur des colonnes mémorisée"
              className="p-2 bg-background border border-border/80 hover:bg-muted text-muted-foreground hover:text-accent rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-semibold">Réinit. colonnes</span>
            </button>
          )}

          {/* Density Toggle */}
          <button
            type="button"
            onClick={() => setDensity(density === 'comfortable' ? 'compact' : 'comfortable')}
            title="Densité d'affichage"
            className="p-2 bg-background border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl text-xs transition-all flex items-center gap-1"
          >
            <Rows className="w-3.5 h-3.5" />
          </button>

          {/* CSV Export */}
          {exportable && (
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={!data.length}
              title="Exporter au format CSV"
              className="p-2 bg-background border border-border/80 hover:bg-accent/10 hover:border-accent/30 text-muted-foreground hover:text-accent rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-bold uppercase tracking-wider">CSV</span>
            </button>
          )}

          {actions}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden border border-border/80 rounded-2xl bg-background shadow-xs">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse data-table table-fixed">
            <thead>
              <tr className="bg-muted/40 border-b border-border/80">
                {selectable && (
                  <th className="px-4 py-3.5 w-10 text-center select-none" style={{ width: '44px', minWidth: '44px', maxWidth: '44px' }}>
                    <input 
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-border text-accent focus:ring-accent/20 accent-accent cursor-pointer"
                    />
                  </th>
                )}
                {normalizedColumns.map((col, index) => {
                  const isSorted = sortConfig?.key === col.key;
                  const isResizingThis = resizingColKey === col.key;
                  const customPx = columnWidths[col.key];
                  const colWidth = customPx ? `${customPx}px` : (col.width || undefined);

                  return (
                    <th 
                      key={`${col.key}-${index}`}
                      onClick={() => {
                        if (justResizedRef.current) return;
                        requestSort(col.key);
                      }}
                      style={{ 
                        width: colWidth,
                        minWidth: colWidth || '70px',
                        maxWidth: colWidth || undefined
                      }}
                      className={cn(
                        "px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] cursor-pointer hover:bg-muted/80 transition-colors select-none relative group/th",
                        isResizingThis && "bg-accent/10 text-accent",
                        col.align === 'center' && "text-center",
                        col.align === 'right' && "text-right"
                      )}
                    >
                      <div className={cn("flex items-center gap-1.5 pr-2", col.align === 'center' && "justify-center", col.align === 'right' && "justify-end")}>
                        <span className="truncate">{col.label}</span>
                        <span className="text-muted-foreground/60 shrink-0">
                          {isSorted ? (
                            sortConfig?.direction === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-accent" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-accent" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/th:opacity-100 transition-opacity" />
                          )}
                        </span>
                      </div>

                      {/* Right Edge: onMouseDown Column Header Resize Grip */}
                      <div
                        onMouseDown={(e) => handleColumnHeaderResizeMouseDown(e, col.key)}
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          // Double click to reset this specific column width
                          setColumnWidths(prev => {
                            const next = { ...prev };
                            delete next[col.key];
                            try {
                              localStorage.setItem(resolvedStorageKey, JSON.stringify(next));
                            } catch (err) {}
                            return next;
                          });
                        }}
                        className={cn(
                          "absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center group/handle z-20 select-none",
                          isResizingThis ? "opacity-100 bg-accent/20" : "opacity-0 group-hover/th:opacity-100 hover:bg-accent/20"
                        )}
                        title="Glisser pour ajuster la largeur (double-clic pour réinitialiser)"
                      >
                        <div className={cn(
                          "w-[2px] h-4 bg-border/80 group-hover/handle:bg-accent rounded transition-colors",
                          isResizingThis && "bg-accent h-full"
                        )} />
                      </div>

                      {/* Live Width Pill while dragging */}
                      {isResizingThis && (
                        <div className="absolute -top-7 right-0 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-30 whitespace-nowrap">
                          {customPx}px
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={normalizedColumns.length + (selectable ? 1 : 0)} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <TableIcon className="w-8 h-8 stroke-[1.5] text-muted-foreground/40" />
                      <p className="text-xs font-semibold">{emptyMessage}</p>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="text-[11px] text-accent font-bold hover:underline mt-1"
                        >
                          Réinitialiser la recherche
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, i) => {
                  const isSelected = selectedRows.includes(row);
                  return (
                    <tr 
                      key={i} 
                      className={cn(
                        "transition-all group",
                        density === 'comfortable' ? 'py-3.5' : 'py-2',
                        isSelected ? "bg-accent/5 hover:bg-accent/10" : "hover:bg-muted/30",
                        onRowClick && "cursor-pointer"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="px-4 py-3 text-center" style={{ width: '44px', minWidth: '44px', maxWidth: '44px' }} onClick={(e) => toggleSelectRow(e, row)}>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-border text-accent focus:ring-accent/20 accent-accent cursor-pointer"
                          />
                        </td>
                      )}
                      {normalizedColumns.map((col, index) => {
                        const val = row[col.key];
                        const customPx = columnWidths[col.key];
                        const colWidth = customPx ? `${customPx}px` : (col.width || undefined);

                        return (
                          <td 
                            key={`${col.key}-${index}`} 
                            style={{ 
                              width: colWidth,
                              minWidth: colWidth || '70px',
                              maxWidth: colWidth || undefined
                            }}
                            className={cn(
                              "px-4 text-xs text-foreground/80 font-medium truncate",
                              density === 'comfortable' ? 'py-3.5' : 'py-2',
                              col.align === 'center' && "text-center",
                              col.align === 'right' && "text-right"
                            )}
                          >
                            {col.render ? (
                              col.render(val, row)
                            ) : typeof val === 'object' && val !== null ? (
                              JSON.stringify(val)
                            ) : (
                              String(val ?? '')
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer & Pagination */}
        {enablePagination && sortedData.length > 0 && (
          <div className="px-5 py-3 bg-muted/20 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span>
                Affichage de <strong className="text-foreground">{Math.min((currentPage - 1) * pageSize + 1, sortedData.length)}</strong> à <strong className="text-foreground">{Math.min(currentPage * pageSize, sortedData.length)}</strong> sur <strong className="text-foreground">{sortedData.length}</strong>
              </span>

              {/* Rows per page selector */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
                <span className="text-[11px]">Par page:</span>
                <select 
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-background border border-border/80 rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-accent"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, idx) => {
                  let p = idx + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    p = currentPage - 2 + idx;
                    if (p > totalPages) p = totalPages - (4 - idx);
                  }
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center",
                        currentPage === p 
                          ? "bg-accent text-accent-foreground font-black shadow-xs" 
                          : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
