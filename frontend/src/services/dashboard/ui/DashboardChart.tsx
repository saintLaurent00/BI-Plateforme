import React, { useState, useEffect } from 'react';
import { executeQuery } from '../../core/utils/db';
import { hifadihService } from '../../lib/hifadihService';
import { EChartsChart } from '../charts/EChartsChart';
import { DataTable } from '../ui/DataTable';
import { PivotTable } from '../charts/PivotTable';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ChartSkeleton } from '../ui/Skeleton';

interface DashboardChartProps {
  chart: any;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({ chart }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [chart]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Logic for local chart or Hifadih-hosted charts
      const x = Array.isArray(chart.x_axis) ? chart.x_axis[0] : (chart.x_axis || 'id');
      let metrics = [];
      if (Array.isArray(chart.y_axis)) {
        metrics = chart.y_axis.filter((m: any) => m && m.toString().length > 0);
      } else if (chart.y_axis) {
        metrics = [chart.y_axis];
      }

      // If we have a connected data source that isn't local SQL, we could use hifadihService.execute(...)
      // For now, we still support local execution via executeQuery for existing charts
      
      if (metrics.length === 0) {
        const sql = `SELECT "${x}" FROM "${chart.table_name || 'charts'}" LIMIT 100;`;
        const res = await executeQuery(sql);
        setData(res);
      } else {
        const y = metrics.map((col: any) => {
          const colName = typeof col === 'object' && col !== null ? col.column : col;
          const aggNum = typeof col === 'object' && col !== null ? col.agg : 'SUM';
          const aliasName = typeof col === 'object' && col !== null ? col.alias : col;
          if (aggNum === 'NONE') return `"${colName}" as "${aliasName}"`;
          return `${aggNum || 'SUM'}("${colName}") as "${aliasName}"`;
        }).join(', ');
        const sql = `SELECT "${x}", ${y} FROM "${chart.table_name || 'charts'}" GROUP BY "${x}" LIMIT 100;`;
        const res = await executeQuery(sql);
        setData(res);
      }
    } catch (err: any) {
      console.error('Failed to load chart data:', err);
      // Quietly set empty data if error
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center">
        <ChartSkeleton 
          type={chart.chart_type || chart.viz_type} 
          showHeader={false} 
          className="p-2 bg-transparent"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50/30 rounded-none p-8 text-center border border-rose-100/50">
        <div className="w-12 h-12 rounded-none bg-rose-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-xs font-bold text-rose-900 tracking-tight">Intelligence Interrupted</p>
        <p className="text-[10px] text-rose-500 mt-2 font-serif italic leading-relaxed max-w-[200px] mx-auto">{error}</p>
      </div>
    );
  }

  if (chart.chart_type === 'Table') {
    return <DataTable data={data} columns={[chart.x_axis, ...chart.y_axis]} />;
  }

  if (chart.chart_type === 'PivotTable') {
    return (
      <PivotTable 
        data={data} 
        rowDimension={chart.x_axis} 
        colDimension={chart.y_axis[0]} 
        valueMetric={chart.y_axis[1] || chart.y_axis[0]} 
      />
    );
  }

  return (
    <EChartsChart 
      data={data}
      type={chart.chart_type}
      xAxis={chart.x_axis}
      yAxis={chart.y_axis}
      config={chart.config}
    />
  );
};
