import { ChartPlugin } from './types';
import { BarChartPlugin } from './plugin-chart-bar/src';
import { LineChartPlugin } from './plugin-chart-line/src';
import { PieChartPlugin } from './plugin-chart-pie/src';
import { RadarChartPlugin } from './plugin-chart-radar/src';
import { ScatterChartPlugin } from './plugin-chart-scatter/src';
import { HeatmapPlugin } from './plugin-chart-heatmap/src';
import { SankeyPlugin } from './plugin-chart-sankey/src';
import { TreemapPlugin } from './plugin-chart-treemap/src';

export const chartPlugins: ChartPlugin[] = [
  BarChartPlugin,
  LineChartPlugin,
  PieChartPlugin,
  RadarChartPlugin,
  ScatterChartPlugin,
  HeatmapPlugin,
  SankeyPlugin,
  TreemapPlugin,
  { ...BarChartPlugin, type: 'StackedBar', metadata: { 
    ...BarChartPlugin.metadata, 
    name: 'Stacked Bar', 
    description: 'Compares parts of a whole across categories using stacked segments.',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/legacy-plugin-chart-bar/src/images/thumbnail.png' 
  } },
  { ...BarChartPlugin, type: 'GroupedBar', metadata: { 
    ...BarChartPlugin.metadata, 
    name: 'Grouped Bar', 
    description: 'Compares multiple metrics side-by-side across categories.',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/legacy-plugin-chart-bar/src/images/thumbnail.png' 
  } },
  { ...PieChartPlugin, type: 'Donut', metadata: { 
    ...PieChartPlugin.metadata, 
    name: 'Donut Chart', 
    description: 'A variation of the pie chart with a hollow center, often used for KPIs.',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Pie/images/thumbnail.png' 
  } },
  { ...LineChartPlugin, type: 'Area', metadata: { 
    ...LineChartPlugin.metadata, 
    name: 'Area Chart', 
    description: 'Visualizes quantitative data over time with a shaded area below the line.',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Line/images/thumbnail.png' 
  } },
  { ...LineChartPlugin, type: 'StepLine', metadata: { 
    ...LineChartPlugin.metadata, 
    name: 'Step Line', 
    description: 'A line chart where points are connected by vertical and horizontal segments.',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Line/images/thumbnail.png' 
  } },
  { ...LineChartPlugin, type: 'SmoothLine', metadata: { 
    ...LineChartPlugin.metadata, 
    name: 'Smooth Line', 
    description: 'A line chart with spline interpolation for a continuous, smooth curve.',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Line/images/thumbnail.png' 
  } },
];

export const getChartPlugin = (type: string): ChartPlugin | undefined => {
  return chartPlugins.find(p => p.type === type);
};
