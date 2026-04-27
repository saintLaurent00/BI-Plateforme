import * as d3 from 'd3';
import { ChartType } from '../../components/D3Chart';

export interface ChartPluginProps {
  data: any[];
  xAxis: string;
  yAxis: string[];
  type: ChartType;
  config: any;
  width: number;
  height: number;
  colorScale: d3.ScaleOrdinal<string, string, never>;
  showTooltip: (event: any, label: string, value: any, seriesName?: string) => void;
  moveTooltip: (event: any) => void;
  hideTooltip: () => void;
}

export interface ChartPlugin {
  type: ChartType;
  name: string;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) => void;
}
