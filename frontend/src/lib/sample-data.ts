export type SampleSalesRecord = {
  id: string;
  date: string;
  year: number;
  quarter: string;
  month: string;
  monthIndex: number;
  region: string;
  country: string;
  city: string;
  category: string;
  subcategory: string;
  product: string;
  customerSegment: string;
  salesChannel: string;
  campaign: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  orders: number;
  rating: number;
  latitude: number;
  longitude: number;
};

const months = [
  '2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
  '2025-07','2025-08','2025-09','2025-10','2025-11','2025-12',
  '2026-01','2026-02','2026-03','2026-04','2026-05','2026-06',
  '2026-07','2026-08','2026-09','2026-10','2026-11','2026-12',
] as const;

const regions = [
  { region: 'West Africa', country: "Côte d'Ivoire", city: 'Abidjan', lat: 5.36, lng: -4.01 },
  { region: 'East Africa', country: 'Kenya', city: 'Nairobi', lat: -1.29, lng: 36.82 },
  { region: 'North Africa', country: 'Morocco', city: 'Casablanca', lat: 33.57, lng: -7.59 },
  { region: 'Central Africa', country: 'Cameroon', city: 'Douala', lat: 4.05, lng: 9.70 },
] as const;

const products = [
  { category: 'Electronics', subcategory: 'Smartphones', product: 'Smartphone Pro X', unitPrice: 650 },
  { category: 'Electronics', subcategory: 'Laptops', product: 'Notebook Air 14', unitPrice: 980 },
  { category: 'Software', subcategory: 'Analytics', product: 'Analytics Suite', unitPrice: 420 },
  { category: 'Services', subcategory: 'Consulting', product: 'Data Advisory', unitPrice: 760 },
] as const;

const segments = ['Enterprise', 'SMB', 'Consumer', 'Public Sector'] as const;
const channels = ['Online', 'Retail', 'Partner', 'Direct'] as const;
const campaigns = ['Growth', 'Retention', 'Launch', 'Seasonal'] as const;

const monthName = (month: number) =>
  new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(Date.UTC(2026, month - 1, 1)));

export const SAMPLE_SALES_DATA: SampleSalesRecord[] = months.flatMap((value, monthIndex) => {
  const [yearText, monthText] = value.split('-');
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const quarter = `Q${Math.ceil(monthNumber / 3)}`;

  return regions.map((location, regionIndex) => {
    const product = products[(monthIndex + regionIndex) % products.length];
    const segment = segments[(monthIndex + regionIndex) % segments.length];
    const channel = channels[(monthIndex * 2 + regionIndex) % channels.length];
    const campaign = campaigns[(monthIndex + regionIndex * 2) % campaigns.length];

    const quantity = 8 + ((monthIndex * 5 + regionIndex * 7) % 28);
    const discount = Number((0.02 + ((monthIndex + regionIndex) % 5) * 0.01).toFixed(2));
    const unitPrice = product.unitPrice + ((monthIndex % 3) * 15);
    const revenue = Number((quantity * unitPrice * (1 - discount)).toFixed(2));
    const cost = Number((revenue * (0.58 + ((regionIndex + monthIndex) % 4) * 0.025)).toFixed(2));
    const profit = Number((revenue - cost).toFixed(2));
    const margin = Number(((profit / revenue) * 100).toFixed(2));
    const rating = Number((3.7 + ((monthIndex * 3 + regionIndex) % 13) / 10).toFixed(1));

    return {
      id: `SMP-${String(monthIndex * regions.length + regionIndex + 1).padStart(4, '0')}`,
      date: `${value}-15`,
      year,
      quarter,
      month: monthName(monthNumber),
      monthIndex: monthNumber,
      region: location.region,
      country: location.country,
      city: location.city,
      category: product.category,
      subcategory: product.subcategory,
      product: product.product,
      customerSegment: segment,
      salesChannel: channel,
      campaign,
      quantity,
      unitPrice,
      discount,
      revenue,
      cost,
      profit,
      margin,
      orders: 1,
      rating,
      latitude: location.lat,
      longitude: location.lng,
    };
  });
});

export type SampleFunnelRecord = {
  stage: string;
  stageOrder: number;
  visitors: number;
  conversionRate: number;
};

export const SAMPLE_FUNNEL_DATA: SampleFunnelRecord[] = [
  { stage: 'Visitors', stageOrder: 1, visitors: 24000, conversionRate: 100 },
  { stage: 'Product View', stageOrder: 2, visitors: 15200, conversionRate: 63.33 },
  { stage: 'Add to Cart', stageOrder: 3, visitors: 6800, conversionRate: 28.33 },
  { stage: 'Checkout', stageOrder: 4, visitors: 4100, conversionRate: 17.08 },
  { stage: 'Payment', stageOrder: 5, visitors: 3200, conversionRate: 13.33 },
  { stage: 'Completed', stageOrder: 6, visitors: 2860, conversionRate: 11.92 },
];

export type SampleFlowRecord = {
  source: string;
  target: string;
  value: number;
};

export const SAMPLE_FLOW_DATA: SampleFlowRecord[] = [
  { source: 'Online', target: 'West Africa', value: 820 },
  { source: 'Online', target: 'East Africa', value: 640 },
  { source: 'Online', target: 'North Africa', value: 520 },
  { source: 'Retail', target: 'West Africa', value: 710 },
  { source: 'Retail', target: 'Central Africa', value: 480 },
  { source: 'Partner', target: 'East Africa', value: 560 },
  { source: 'Partner', target: 'North Africa', value: 430 },
  { source: 'Direct', target: 'West Africa', value: 620 },
  { source: 'Direct', target: 'Central Africa', value: 390 },
];

export type SampleHierarchyRecord = {
  category: string;
  subcategory: string;
  product: string;
  revenue: number;
};

export const SAMPLE_HIERARCHY_DATA: SampleHierarchyRecord[] = [
  { category: 'Electronics', subcategory: 'Smartphones', product: 'Smartphone Pro X', revenue: 182000 },
  { category: 'Electronics', subcategory: 'Laptops', product: 'Notebook Air 14', revenue: 156000 },
  { category: 'Software', subcategory: 'Analytics', product: 'Analytics Suite', revenue: 128000 },
  { category: 'Software', subcategory: 'Analytics', product: 'Reporting Pro', revenue: 94000 },
  { category: 'Services', subcategory: 'Consulting', product: 'Data Advisory', revenue: 113000 },
  { category: 'Services', subcategory: 'Implementation', product: 'Platform Setup', revenue: 87000 },
  { category: 'Hardware', subcategory: 'Displays', product: 'Business Display 27', revenue: 72000 },
  { category: 'Hardware', subcategory: 'Accessories', product: 'Dock Station', revenue: 51000 },
];

export type SampleFinancialRecord = {
  label: string;
  type: 'increase' | 'decrease' | 'total';
  amount: number;
  order: number;
};

export const SAMPLE_FINANCIAL_DATA: SampleFinancialRecord[] = [
  { label: 'Opening Revenue', type: 'total', amount: 420000, order: 1 },
  { label: 'New Sales', type: 'increase', amount: 185000, order: 2 },
  { label: 'Expansion', type: 'increase', amount: 72000, order: 3 },
  { label: 'Discounts', type: 'decrease', amount: -28000, order: 4 },
  { label: 'Refunds', type: 'decrease', amount: -19000, order: 5 },
  { label: 'Operating Costs', type: 'decrease', amount: -146000, order: 6 },
  { label: 'Other Income', type: 'increase', amount: 32000, order: 7 },
  { label: 'Closing Result', type: 'total', amount: 516000, order: 8 },
];

export const SAMPLE_DATASET_NAMES = [
  'sample_sales',
  'sample_funnel',
  'sample_flow',
  'sample_hierarchy',
  'sample_financial',
] as const;
