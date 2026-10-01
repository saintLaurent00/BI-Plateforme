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
};

export const SAMPLE_DATASETS = {
  sales: SAMPLE_SALES_DATASET,
} as const;
