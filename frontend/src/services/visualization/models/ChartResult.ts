import type { ChartResult } from '../@/services/query/models';

export type { ChartResult };

export interface ChartVisualizationAdapter<TConfig = Record<string, unknown>> {
  transform(
    result: ChartResult,
    config: TConfig,
  ): Record<string, unknown>;
}
