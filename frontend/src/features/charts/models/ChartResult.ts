import type { ChartResult } from '@/features/queries/models';

export type { ChartResult };

export interface ChartVisualizationAdapter<TConfig = Record<string, unknown>> {
  transform(
    result: ChartResult,
    config: TConfig,
  ): Record<string, unknown>;
}
