import type { DatasetMetadata, MetricMetadata, CalculatedColumnMetadata } from '@/services/data/models';
import { SAMPLE_SALES_COLUMNS, SAMPLE_SALES_DATA, type SampleSalesRecord } from './SampleSalesData';

export const SAMPLE_SALES_DATASET: DatasetMetadata = {
  id: 'sample-sales',
  name: 'sample_sales',
  label: 'Sample Sales Analytics',
  description: 'Deterministic reference dataset for Dataviz development.',
  kind: 'physical',
  tableName: 'sample_sales',
  columns: [...SAMPLE_SALES_COLUMNS],
  metrics: [
    { id:'sales.total_revenue', name:'total_revenue', label:'Revenue', expression:'SUM(revenue)', type:'sql', format:'currency' },
    { id:'sales.total_profit', name:'total_profit', label:'Profit', expression:'SUM(profit)', type:'sql', format:'currency' },
    { id:'sales.profit_margin', name:'profit_margin', label:'Profit Margin', expression:'SUM(profit) / NULLIF(SUM(revenue), 0) * 100', type:'sql', format:'percent' },
    { id:'sales.average_rating', name:'average_rating', label:'Average Rating', expression:'AVG(rating)', type:'sql', format:'decimal' },
  ] satisfies MetricMetadata[],
  calculatedColumns: [
    { id:'sales.gross_value', name:'gross_value', label:'Gross Value', expression:'quantity * unit_price', dataType:'number', groupable:false, filterable:true },
    { id:'sales.net_value', name:'net_value', label:'Net Value', expression:'quantity * unit_price * (1 - discount)', dataType:'number', groupable:false, filterable:true },
    { id:'sales.profit_per_unit', name:'profit_per_unit', label:'Profit per Unit', expression:'profit / NULLIF(quantity, 0)', dataType:'number', groupable:false, filterable:true },
  ] satisfies CalculatedColumnMetadata[],
  time: { column:'date', supportedGrains:['year','quarter','month','week','day'], defaultGrain:'month' },
  capabilities: {
    supportsFilters:true,
    supportsGroupBy:true,
    supportsMetrics:true,
    supportsCalculatedColumns:true,
    supportsTimeGrain:true,
    supportsSamples:true,
  },
  statistics: { rowCount:SAMPLE_SALES_DATA.length },
};

export type SampleSalesDataset = typeof SAMPLE_SALES_DATASET;
