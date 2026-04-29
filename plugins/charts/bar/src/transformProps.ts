import { ChartPluginProps } from '../../types';

export default function transformProps(chartProps: ChartPluginProps) {
  const { width, height, data, xAxis, yAxis } = chartProps;

  return {
    ...chartProps,
    width,
    height,
    data,
    xAxis,
    yAxis,
  };
}
