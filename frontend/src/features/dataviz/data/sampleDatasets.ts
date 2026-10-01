import type { Dataset } from '../types';
import {
  SAMPLE_SALES_DATA,
  SAMPLE_SALES_FIELDS,
  type SampleSalesRecord,
} from './sampleSalesData';

export const SAMPLE_SALES_DATASET: Dataset<SampleSalesRecord> = {
  id: 'sample-sales',
  name: 'Sample Sales Analytics',
  description:
    'Deterministic frontend dataset used as the reference source for Dataviz development and chart previews.',
  fields: SAMPLE_SALES_FIELDS,
  rows: SAMPLE_SALES_DATA,
  metrics: [
    {
      id: 'sales.total_revenue',
      name: 'total_revenue',
      label: 'Revenue',
      expression: 'SUM(revenue)',
      format: 'currency',
    },
    {
      id: 'sales.total_profit',
      name: 'total_profit',
      label: 'Profit',
      expression: 'SUM(profit)',
      format: 'currency',
    },
    {
      id: 'sales.profit_margin',
      name: 'profit_margin',
      label: 'Profit Margin',
      expression: 'SUM(profit) / NULLIF(SUM(revenue), 0) * 100',
      format: 'percent',
    },
    {
      id: 'sales.average_rating',
      name: 'average_rating',
      label: 'Average Rating',
      expression: 'AVG(rating)',
      format: 'decimal',
    },
  ],
  calculatedColumns: [
    {
      id: 'sales.gross_value',
      name: 'gross_value',
      label: 'Gross Value',
      expression: 'quantity * unitPrice',
      type: 'number',
    },
    {
      id: 'sales.net_value',
      name: 'net_value',
      label: 'Net Value',
      expression: 'quantity * unitPrice * (1 - discount)',
      type: 'number',
    },
    {
      id: 'sales.profit_per_unit',
      name: 'profit_per_unit',
      label: 'Profit per Unit',
      expression: 'profit / NULLIF(quantity, 0)',
      type: 'number',
    },
  ],
};

export const SAMPLE_DATASETS = {
  sales: SAMPLE_SALES_DATASET,
} as const;
