import React from 'react';

interface PivotTableProps {
  data: any[];
  rowDimension: string;
  colDimension: string;
  valueMetric: string;
}

export const PivotTable: React.FC<PivotTableProps> = ({ data, rowDimension, colDimension, valueMetric }) => {
  const rows = Array.from(new Set(data.map(d => String(d[rowDimension]))));
  const cols = Array.from(new Set(data.map(d => String(d[colDimension]))));

  const pivotData: Record<string, Record<string, number>> = {};

  data.forEach(d => {
    const row = String(d[rowDimension]);
    const col = String(d[colDimension]);
    const val = Number(d[valueMetric]) || 0;

    if (!pivotData[row]) pivotData[row] = {};
    if (!pivotData[row][col]) pivotData[row][col] = 0;
    pivotData[row][col] += val;
  });

  return (
    <div className="w-full h-full resizable-container custom-scrollbar border border-slate-200 rounded-xl bg-white shadow-sm">
      <table className="w-full text-left border-collapse min-w-max">
        <thead className="sticky top-0 bg-slate-50 z-10">
          <tr>
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
              {rowDimension} \ {colDimension}
            </th>
            {cols.map(col => (
              <th key={col} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200">
                {col}
              </th>
            ))}
            <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 bg-slate-100">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(row => {
            let rowTotal = 0;
            return (
              <tr key={row} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 text-sm font-bold text-slate-700 border-b border-slate-100 bg-slate-50">
                  {row}
                </td>
                {cols.map(col => {
                  const val = pivotData[row]?.[col] || 0;
                  rowTotal += val;
                  return (
                    <td key={col} className="px-4 py-2.5 text-sm text-slate-600 border-b border-slate-100">
                      {val.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-4 py-2.5 text-sm font-bold text-prism-600 border-b border-slate-100 bg-prism-50">
                  {rowTotal.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
