import { ChartPlugin } from './types';
import { BarChartPlugin } from './BarChart';
import { LineChartPlugin } from './LineChart';
import { PieChartPlugin } from './PieChart';
import { RadarChartPlugin } from './RadarChart';
import { HierarchicalChartPlugin } from './HierarchicalCharts';
import { CommonPlotsPlugin } from './CommonPlots';

export const chartPlugins: ChartPlugin[] = [
  BarChartPlugin,
  LineChartPlugin,
  PieChartPlugin,
  RadarChartPlugin,
  HierarchicalChartPlugin,
  CommonPlotsPlugin,
  { ...BarChartPlugin, type: 'StackedBar', name: 'Stacked Bar' },
  { ...BarChartPlugin, type: 'GroupedBar', name: 'Grouped Bar' },
  { ...PieChartPlugin, type: 'Donut', name: 'Donut Chart' },
  { ...LineChartPlugin, type: 'Area', name: 'Area Chart' },
  { ...LineChartPlugin, type: 'StepLine', name: 'Step Line' },
  { ...LineChartPlugin, type: 'SmoothLine', name: 'Smooth Line' },
  { ...RadarChartPlugin, type: 'PolarArea', name: 'Polar Area' },
  { ...HierarchicalChartPlugin, type: 'Sunburst', name: 'Sunburst' },
  { ...HierarchicalChartPlugin, type: 'CirclePacking', name: 'Circle Packing' },
  { ...HierarchicalChartPlugin, type: 'Tree', name: 'Tree Diagram' },
  { ...HierarchicalChartPlugin, type: 'Dendrogram', name: 'Dendrogram' },
  { ...HierarchicalChartPlugin, type: 'RadialTree', name: 'Radial Tree' },
  { ...CommonPlotsPlugin, type: 'Bubble', name: 'Bubble Chart' },
  { ...CommonPlotsPlugin, type: 'Scatter', name: 'Scatter Plot' },
  { ...CommonPlotsPlugin, type: 'Heatmap', name: 'Heatmap' },
  { ...CommonPlotsPlugin, type: 'Gauge', name: 'Gauge' },
];

export const getChartPlugin = (type: string): ChartPlugin | undefined => {
  return chartPlugins.find(p => p.type === type);
};
