import type { ChartResult } from '../../../domain/query';

export type { ChartResult };

export interface ChartVisualizationAdapter<TConfig = Record<string, unknown>> {
  transform(
    result: ChartResult,
    config: TConfig,
  ): Record<string, unknown>;
}
