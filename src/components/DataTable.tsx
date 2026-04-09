import React, { useState } from 'react';

interface DataTableProps {
  data: any[];
  columns: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full h-full resizable-container custom-scrollbar border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse min-w-max">
        <thead className="sticky top-0 bg-slate-50 z-10">
          <tr>
            {columns.map((col) => (
              <th 
                key={col}
                onClick={() => requestSort(col)}
                className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {col}
                  {sortConfig?.key === col && (
                    <span className="text-prism-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedData.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2.5 text-sm text-slate-600 border-b border-slate-100">
                  {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
