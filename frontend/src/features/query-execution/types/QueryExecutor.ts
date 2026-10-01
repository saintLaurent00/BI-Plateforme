import type { ChartQuery, ChartResult } from '../../../domain/query';
import type { DatasetMetadata } from '../../../domain/dataset';

export interface QueryExecutor {
  execute(dataset: DatasetMetadata, query: ChartQuery): Promise<ChartResult>;
}
