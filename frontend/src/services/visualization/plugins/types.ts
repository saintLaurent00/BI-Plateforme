export type ChartType = string;

export interface ChartMetadata {
  name: string;
  description: string;
  category?: string;
}

export interface ChartPluginProps {
  data: Array<Record<string, any>>;
  xAxis: string;
  yAxis: string[];
  type: ChartType;
  config?: Record<string, unknown>;
}

export interface ChartPlugin {
  type: ChartType;
  metadata: ChartMetadata;
  buildQuery?: (formData: Record<string, any>) => unknown;
  controlPanel?: unknown;
  getOptions: (props: ChartPluginProps) => Record<string, unknown>;
}
