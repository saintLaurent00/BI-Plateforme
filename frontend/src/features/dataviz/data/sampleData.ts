import { SAMPLE_SALES_DATASET } from './sampleDatasets';

export const SAMPLE_DATA = SAMPLE_SALES_DATASET.rows;

export const SAMPLE_CHART_DATA = {
  revenueByRegion: () =>
    SAMPLE_DATA.reduce<Record<string, number>>((result, row) => {
      result[row.region] = (result[row.region] ?? 0) + row.revenue;
      return result;
    }, {}),

  revenueByCategory: () =>
    SAMPLE_DATA.reduce<Record<string, number>>((result, row) => {
      result[row.category] = (result[row.category] ?? 0) + row.revenue;
      return result;
    }, {}),

  profitByMonth: () =>
    SAMPLE_DATA.reduce<Record<string, number>>((result, row) => {
      result[row.month] = (result[row.month] ?? 0) + row.profit;
      return result;
    }, {}),
} as const;
