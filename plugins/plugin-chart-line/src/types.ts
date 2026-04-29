export enum LineChartType {
  Line = 'Line',
  SmoothLine = 'SmoothLine',
  StepLine = 'StepLine',
}

export interface LineChartProps {
  data: any[];
  width: number;
  height: number;
  colorScale: (val: string) => string;
  xAxis: string;
  yAxis: string[];
  type?: LineChartType;
}
