export type DashboardFilterOperator = 'equals' | 'not_equals' | 'in' | 'contains' | 'between';

export interface DashboardFilter {
  id: string;
  column: string;
  operator: DashboardFilterOperator;
  value: string | number | boolean | Array<string | number>;
  datasetId?: string;
}