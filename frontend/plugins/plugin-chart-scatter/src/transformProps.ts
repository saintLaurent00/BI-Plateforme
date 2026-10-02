import { ChartPluginProps } from '@/services/visualization/plugins/types';

export default function transformProps(chartProps: ChartPluginProps) {
  return {
    ...chartProps,
  };
}
