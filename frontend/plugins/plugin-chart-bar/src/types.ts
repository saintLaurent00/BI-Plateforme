export enum BarChartType {
  Bar = 'Bar',
  StackedBar = 'StackedBar',
  GroupedBar = 'GroupedBar',
}

export interface BarChartProps {
  data: any[];
  width: number;
  height: number;
  colorScheme?: string[];
  xField: string;
  yField: string;
}
