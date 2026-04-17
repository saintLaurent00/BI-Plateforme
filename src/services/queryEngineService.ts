import axios from 'axios';

type QueryFilter = {
  field: string;
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between' | 'like';
  value: unknown;
};

export type QueryRequest = {
  dataset: string;
  metrics: string[];
  dimensions: string[];
  filters: QueryFilter[];
  limit?: number;
};

export type QueryResponse = {
  data: Record<string, unknown>[];
  meta: {
    dataset: string;
    execution_ms: number;
    row_count: number;
  };
  insights: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
};

const client = axios.create({
  baseURL: import.meta.env.VITE_BI_ENGINE_URL ?? 'http://localhost:8000',
});

export async function runBIQuery(payload: QueryRequest): Promise<QueryResponse> {
  const { data } = await client.post<QueryResponse>('/api/query', payload);
  return data;
}
