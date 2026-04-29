import * as d3 from 'd3';
export type ChartType = 
  | 'Line' | 'Bar' | 'Pie' | 'Area' | 'Scatter' | 'Bubble' 
  | 'Radar' | 'Funnel' | 'Waterfall' | 'Heatmap' | 'Donut' 
  | 'StackedBar' | 'GroupedBar' | 'StepLine' | 'SmoothLine'
  | 'HorizontalBar' | 'StackedHorizontalBar' | 'GroupedHorizontalBar'
  | 'StackedArea' | 'Streamgraph' | 'Treemap' | 'Sunburst'
  | 'CirclePacking' | 'Sankey' | 'Chord' | 'BoxPlot' | 'ViolinPlot'
  | 'Candlestick' | 'Gauge' | 'Bullet' | 'Sparkline' | 'ParallelCoordinates'
  | 'Marimekko' | 'Tree' | 'Dendrogram' | 'Voronoi' | 'Hexbin'
  | 'Contour' | 'Horizon' | 'Slope' | 'Dumbbell' | 'Lollipop'
  | 'DotPlot' | 'Rose' | 'PolarArea' | 'Pyramid' | 'Calendar'
  | 'MultiLine' | 'PercentStackedBar' | 'PercentStackedArea'
  | 'WaterfallHorizontal' | 'BulletVertical'
  | 'Table' | 'PivotTable' | 'CustomD3' | 'RadialTree';

export interface ChartPluginProps {
  data: any[];
  xAxis: string;
  yAxis: string[];
  type: ChartType;
  config: any;
  width: number;
  height: number;
  colorScale: d3.ScaleOrdinal<string, string, never>;
  showTooltip: (event: any, label: string, value: any, seriesName?: string, rawData?: any) => void;
  moveTooltip: (event: any) => void;
  hideTooltip: () => void;
  onItemClick?: (data: any) => void;
}

export interface ChartMetadata {
  name: string;
  description?: string;
  thumbnail?: string;
  category?: string;
}

export interface ChartPlugin {
  type: string;
  metadata: ChartMetadata;
  buildQuery?: (formData: any) => any;
  controlPanel?: any;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) => void;
}
