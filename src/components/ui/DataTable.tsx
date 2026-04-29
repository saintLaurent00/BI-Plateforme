import React, { useState } from 'react';
import { cn } from '../../core/utils/utils';

interface DataTableProps {
  data: any[];
  columns: { key: string; label: string; render?: (val: any, row: any) => React.ReactNode }[];
  onRowClick?: (row: any) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  columns, 
  onRowClick,
  searchPlaceholder = "Rechercher...",
  showSearch = true
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.keys(row).some(key => 
        String(row[key]).toLowerCase().includes(lowerSearch)
      )
    );
  }, [data, searchTerm]);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full space-y-4">
      {showSearch && (
        <div className="relative group max-w-sm">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-2 bg-background border border-border rounded-xl text-xs focus:ring-4 ring-accent/5 focus:border-accent transition-all shadow-sm"
          />
        </div>
      )}
      <div className="overflow-hidden border border-border rounded-[24px] bg-background shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col, index) => (
                <th 
                  key={`${col.key}-${index}`}
                  onClick={() => requestSort(col.key)}
                  className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortConfig?.key === col.key && (
                      <span className="text-accent">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData.map((row, i) => (
              <tr 
                key={i} 
                className={cn(
                  "hover:bg-muted/30 transition-all",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, index) => (
                  <td key={`${col.key}-${index}`} className="px-6 py-4 text-sm text-foreground/80">
                    {col.render ? col.render(row[col.key], row) : (typeof row[col.key] === 'object' ? JSON.stringify(row[col.key]) : String(row[col.key] ?? ''))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  );
};
