import { ChartPluginProps } from '../../types';

export default function transformProps(chartProps: ChartPluginProps) {
  return {
    ...chartProps,
  };
}
