export enum PieChartType {
  Pie = 'Pie',
  Donut = 'Donut',
}

export interface PieChartProps {
  data: any[];
  width: number;
  height: number;
  colorScale: (val: string) => string;
  xAxis: string;
  yAxis: string[];
  type?: PieChartType;
}
