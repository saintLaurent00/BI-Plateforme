import React, { useState, useEffect } from 'react';
import { EChartsChart, PivotTable } from '@/features/charts/ui';
import { DataTable } from '@/ui/components/DataTable';
import { AlertCircle } from 'lucide-react';
import { ChartSkeleton } from '@/ui/components/Skeleton';
import { visualizationService } from '@/features/charts/application/VisualizationService';

interface DashboardChartProps {
  chart: any;
}

const VIZ_TYPE_MAP: Record<string, string> = {
  echarts_timeseries_bar: 'Bar',
  echarts_timeseries_line: 'Line',
  echarts_area: 'Area',
  echarts_timeseries_area: 'Area',
  echarts_pie: 'Pie',
  table: 'Table',
  pivot_table_v2: 'PivotTable',
  echarts_scatter: 'Scatter',
  echarts_radar: 'Radar',
};

export const DashboardChart: React.FC<DashboardChartProps> = ({ chart }) => {
  const [data, setData] = useState<any[]>([]);
  const [chartConfig, setChartConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!chart?.id) throw new Error('Aucun identifiant de graphique Superset n’est associé à ce composant.');
        const [details, response] = await Promise.all([
          visualizationService.getChart(chart.id),
          visualizationService.getChartData(chart.id),
        ]);
        const params: Record<string, any> = typeof details.params === 'string'
          ? JSON.parse(details.params || '{}')
          : ((details.params || {}) as Record<string, any>);
        const payload: any = response;
        const result = Array.isArray(payload?.result) ? payload.result[0] : (payload?.result ?? payload);
        const rows = Array.isArray(result?.data) ? result.data : Array.isArray(payload?.data) ? payload.data : [];
        if (active) {
          setData(rows);
          setChartConfig({
            type: VIZ_TYPE_MAP[details.viz_type || ''] || details.viz_type || 'Bar',
            xAxis: Array.isArray(params.groupby) ? params.groupby : params.x_axis ? [params.x_axis] : [],
            yAxis: Array.isArray(params.metrics) ? params.metrics.map((metric: any) =>
              typeof metric === 'string' ? metric : metric.label || metric.column?.column_name || '',
            ).filter(Boolean) : [],
            config: params,
          });
          if (!rows.length) setError('Superset n’a renvoyé aucune donnée pour ce graphique.');
        }
      } catch (err) {
        if (active) {
          setData([]);
          setError(err instanceof Error ? err.message : 'Impossible de charger les données du graphique Superset.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadData();
    return () => { active = false; };
  }, [chart?.id]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center">
        <ChartSkeleton type={chart?.viz_type || chart?.chart_type} showHeader={false} className="p-2 bg-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="w-full h-full min-h-[180px] flex flex-col items-center justify-center bg-rose-50/30 p-8 text-center border border-rose-100/50">
        <AlertCircle className="w-6 h-6 text-rose-500 mb-3" />
        <p className="text-xs font-bold text-rose-900">Graphique indisponible</p>
        <p className="text-[10px] text-rose-600 mt-2 leading-relaxed max-w-xs">{error}</p>
      </div>
    );
  }

  if (chartConfig?.type === 'Table') {
    const columns = Object.keys(data[0] || {}).map(key => ({ key, label: key }));
    return <DataTable data={data} columns={columns} />;
  }

  if (chartConfig?.type === 'PivotTable') {
    return <PivotTable data={data} rowDimension={chartConfig.xAxis[0]} colDimension={chartConfig.yAxis[0]} valueMetric={chartConfig.yAxis[1] || chartConfig.yAxis[0]} />;
  }

  return (
    <EChartsChart
      data={data}
      type={chartConfig?.type || 'Bar'}
      xAxis={chartConfig?.xAxis || []}
      yAxis={chartConfig?.yAxis || []}
      config={chartConfig?.config || {}}
    />
  );
};
