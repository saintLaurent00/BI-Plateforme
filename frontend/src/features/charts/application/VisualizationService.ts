import { supersetRequest } from '@/platform/api/superset-client';

export interface SupersetChart {
  id: number | string;
  slice_name: string;
  viz_type?: string;
  datasource_id?: number;
  datasource_type?: string;
  description?: string | null;
  changed_on_delta_humanized?: string;
  created_on_delta_humanized?: string;
  owners?: Array<{ id?: number; username?: string; first_name?: string; last_name?: string }>;
  [key: string]: unknown;
}

interface ListResponse<T> { count?: number; result?: T[]; }
const listQuery = (page = 0, pageSize = 100) => `?q=${encodeURIComponent(`(page:${page},page_size:${pageSize})`)}`;

export const visualizationService = {
  async listCharts(): Promise<SupersetChart[]> {
    const response = await supersetRequest<ListResponse<SupersetChart>>(`/api/v1/chart/${listQuery()}`);
    return Array.isArray(response?.result) ? response.result : [];
  },
  async getChart(id: string | number): Promise<SupersetChart> {
    const response = await supersetRequest<{ result: SupersetChart }>(`/api/v1/chart/${encodeURIComponent(String(id))}`);
    return response.result;
  },
  async saveChart(input: {
    id?: string | number;
    name: string;
    datasetId: string | number;
    chartType: string;
    xAxis: string[];
    yAxis: Array<{ column: string; agg?: string; alias?: string }>;
    config?: Record<string, unknown>;
  }): Promise<SupersetChart> {
    const vizTypeMap: Record<string, string> = {
      bar: 'echarts_timeseries_bar',
      stackedbar: 'echarts_timeseries_bar',
      groupedbar: 'echarts_timeseries_bar',
      line: 'echarts_timeseries_line',
      area: 'echarts_area',
      pie: 'echarts_pie',
      donut: 'echarts_pie',
      radar: 'echarts_radar',
      scatter: 'echarts_scatter',
      heatmap: 'echarts_heatmap',
      sankey: 'echarts_sankey',
      treemap: 'treemap_v2',
      boxplot: 'echarts_box_plot',
      funnel: 'echarts_funnel',
      sunburst: 'sunburst',
      waterfall: 'echarts_waterfall',
      table: 'table',
    };
    const normalizedType = String(input.chartType).toLowerCase();
    const vizType = vizTypeMap[normalizedType] ?? input.chartType;
    const params = {
      datasource: `${input.datasetId}__table`,
      viz_type: vizType,
      slice_name: input.name,
      groupby: input.xAxis,
      metrics: input.yAxis.map(metric => ({
        expressionType: 'SIMPLE',
        column: { column_name: metric.column },
        aggregate: metric.agg || 'SUM',
        label: metric.alias || metric.column,
        optionName: `metric_${metric.column}`,
      })),
      row_limit: 1000,
      show_legend: input.config?.showLegend ?? true,
      show_legend_on_hover: true,
    };
    const payload = {
      slice_name: input.name,
      datasource_id: Number(input.datasetId),
      datasource_type: 'table',
      viz_type: vizType,
      params: JSON.stringify(params),
    };
    const response = input.id
      ? await supersetRequest<{ result?: SupersetChart }>(`/api/v1/chart/${encodeURIComponent(String(input.id))}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      : await supersetRequest<{ id?: number; result?: SupersetChart }>('/api/v1/chart/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
    if (response.result) return response.result;
    if ('id' in response && response.id !== undefined) {
      return { id: response.id, slice_name: input.name, viz_type: vizType, datasource_id: Number(input.datasetId), datasource_type: 'table' };
    }
    throw new Error('Superset n’a pas renvoyé les informations du graphique enregistré.');
  },
  async deleteChart(id: string | number): Promise<void> {
    await supersetRequest<unknown>(`/api/v1/chart/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
  },
  async getChartData(id: string | number): Promise<unknown> {
    return supersetRequest<unknown>(`/api/v1/chart/${encodeURIComponent(String(id))}/data/`);
  },
};