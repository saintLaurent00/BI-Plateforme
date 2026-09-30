import { ChartPlugin } from './types';
import { BarChartPlugin } from '../../plugins/plugin-chart-bar/src';
import { LineChartPlugin } from '../../plugins/plugin-chart-line/src';
import { PieChartPlugin } from '../../plugins/plugin-chart-pie/src';
import { RadarChartPlugin } from '../../plugins/plugin-chart-radar/src';
import { ScatterChartPlugin } from '../../plugins/plugin-chart-scatter/src';
import { HeatmapPlugin } from '../../plugins/plugin-chart-heatmap/src';
import { SankeyPlugin } from '../../plugins/plugin-chart-sankey/src';
import { TreemapPlugin } from '../../plugins/plugin-chart-treemap/src';
import { BoxPlotPlugin } from '../../plugins/plugin-chart-boxplot/src';
import { FunnelPlugin } from '../../plugins/plugin-chart-funnel/src';
import { SunburstPlugin } from '../../plugins/plugin-chart-sunburst/src';
import { WaterfallPlugin } from '../../plugins/plugin-chart-waterfall/src';

export const chartPlugins: ChartPlugin[] = [
  BarChartPlugin,
  LineChartPlugin,
  PieChartPlugin,
  RadarChartPlugin,
  ScatterChartPlugin,
  HeatmapPlugin,
  SankeyPlugin,
  TreemapPlugin,
  BoxPlotPlugin,
  FunnelPlugin,
  SunburstPlugin,
  WaterfallPlugin,
  { ...BarChartPlugin, type: 'StackedBar', metadata: { 
    ...BarChartPlugin.metadata, 
    name: 'Stacked Bar', 
    description: 'Compares parts of a whole across categories using stacked segments.'
  } },
  { ...BarChartPlugin, type: 'GroupedBar', metadata: { 
    ...BarChartPlugin.metadata, 
    name: 'Grouped Bar', 
    description: 'Compares multiple metrics side-by-side across categories.'
  } },
  { ...PieChartPlugin, type: 'Donut', metadata: { 
    ...PieChartPlugin.metadata, 
    name: 'Donut Chart', 
    description: 'A variation of the pie chart with a hollow center, often used for KPIs.'
  } },
  { ...LineChartPlugin, type: 'Area', metadata: { 
    ...LineChartPlugin.metadata, 
    name: 'Area Chart', 
    description: 'Visualizes quantitative data over time with a shaded area below the line.'
  } },
];

export const getChartPlugin = (type: string): ChartPlugin | undefined => {
  return chartPlugins.find(p => p.type === type);
};
