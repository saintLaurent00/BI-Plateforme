export type ChartType = string;

export interface ChartMetadata {
  name: string;
  description: string;
  category?: string;
  thumbnail?: string;
}

export interface ChartPluginProps {
  data: Array<Record<string, any>>;
  xAxis: string;
  yAxis: string[];
  type: ChartType;
  config?: Record<string, unknown>;
  width?: number;
  height?: number;
  onItemClick?: (data: any) => void;
}

export interface ChartPluginRenderProps extends ChartPluginProps {
  width: number;
  height: number;
  colorScale: any;
  showTooltip: (...args: any[]) => void;
  moveTooltip: (...args: any[]) => void;
  hideTooltip: () => void;
}

export type ChartOptions = Record<string, any>;

export interface ChartPlugin {
  type: ChartType;
  metadata: ChartMetadata;
  buildQuery?: (formData: Record<string, any>) => unknown;
  controlPanel?: unknown;
  getOptions: (props: ChartPluginProps) => ChartOptions;
  /** Optional legacy D3 renderer; option-based plugins use getOptions instead. */
  render?: (group: any, props: ChartPluginRenderProps) => void;
}
