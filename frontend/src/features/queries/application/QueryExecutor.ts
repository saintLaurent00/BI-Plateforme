import type { ChartQuery, ChartResult } from '@/features/queries/models';
import type { DatasetMetadata } from '@/features/datasets';

export interface QueryExecutor {
  execute(dataset: DatasetMetadata, query: ChartQuery): Promise<ChartResult>;
}
