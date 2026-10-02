import type { ChartQuery, ChartResult } from '@/services/query/models';
import type { DatasetMetadata } from '@/services/data/models';

export interface QueryExecutor {
  execute(dataset: DatasetMetadata, query: ChartQuery): Promise<ChartResult>;
}
