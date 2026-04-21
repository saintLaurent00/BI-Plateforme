import React, { useState, useEffect } from 'react';
import { executeQuery } from '../lib/db';
import { supersetService } from '../services/supersetService';
import { isConfigured as isSupersetConfigured } from '../lib/supersetClient';
import { D3Chart } from './D3Chart';
import { DataTable } from './DataTable';
import { PivotTable } from './PivotTable';
import { AlertCircle, Loader2 } from 'lucide-react';

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
      const isSupersetId = typeof chart.id === 'number' || (typeof chart.id === 'string' && !isNaN(Number(chart.id)));
      
      if (isSupersetId && isSupersetConfigured) {
        // Superset chart
        const chartId = Number(chart.id);
        
        const chartMetadata = await supersetService.getChart(chartId);
        
        let queryContext = {};
        if (chartMetadata.params) {
          const params = JSON.parse(chartMetadata.params);
          queryContext = {
            datasource: { id: chartMetadata.datasource_id, type: 'table' },
            force: false,
            queries: [{
              groupby: params.groupby || [],
              metrics: params.metrics || [],
              filters: params.adhoc_filters || [],
              row_limit: params.row_limit || 1000,
              order_desc: true,
            }],
            result_format: 'json',
            result_type: 'full',
          };
        }

        const res = await supersetService.getChartData(chartId, queryContext);
        setData(res.result?.[0]?.data || []);
      } else {
        // Local chart or Superset not configured
        const x = Array.isArray(chart.x_axis) ? chart.x_axis[0] : (chart.x_axis || 'id');
        let metrics = [];
        if (Array.isArray(chart.y_axis)) {
          metrics = chart.y_axis.filter((m: any) => m && m.toString().length > 0);
        } else if (chart.y_axis) {
          metrics = [chart.y_axis];
        }

        if (metrics.length === 0) {
          const sql = `SELECT "${x}" FROM "${chart.table_name || 'charts'}" LIMIT 100;`;
          const res = await executeQuery(sql);
          setData(res);
        } else {
          const y = metrics.map((col: string) => `SUM("${col}") as "${col}"`).join(', ');
          const sql = `SELECT "${x}", ${y} FROM "${chart.table_name || 'charts'}" GROUP BY "${x}" LIMIT 100;`;
          const res = await executeQuery(sql);
          setData(res);
        }
      }
    } catch (err: any) {
      if (isSupersetConfigured) {
        console.error('Failed to load chart data:', err);
        setError(err.message);
      } else {
        // If not configured, just try local fallback if not already there
        setData([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-slate-100 border-t-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
        </div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Analyzing Data</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-rose-50/30 rounded-2xl p-8 text-center border border-rose-100/50">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
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
    <D3Chart 
      data={data}
      type={chart.chart_type}
      xAxis={chart.x_axis}
      yAxis={chart.y_axis}
      config={chart.config}
    />
  );
};
