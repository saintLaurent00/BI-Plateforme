import type { Chart } from '@/services/visualization/models/chart-index';

export interface ChartCollection {
  items: Chart[];
  total: number;
}