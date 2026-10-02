import type { ColumnMetadata } from '@/services/data/models';

export interface SampleSalesRecord {
  id: string;
  date: string;
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  month: string;
  monthIndex: number;
  region: 'West Africa' | 'East Africa' | 'North Africa' | 'Central Africa';
  country: string;
  city: string;
  category: 'Electronics' | 'Home' | 'Fashion' | 'Beauty';
  subcategory: string;
  product: string;
  customerSegment: 'Consumer' | 'SMB' | 'Enterprise';
  salesChannel: 'Online' | 'Retail' | 'Partner';
  quantity: number;
  unitPrice: number;
  discount: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  rating: number;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'] as const;
const REGIONS = [
  { region: 'West Africa' as const, country: 'Côte d’Ivoire', city: 'Abidjan', factor: 1.18 },
  { region: 'East Africa' as const, country: 'Kenya', city: 'Nairobi', factor: 1.04 },
  { region: 'North Africa' as const, country: 'Morocco', city: 'Casablanca', factor: 0.96 },
  { region: 'Central Africa' as const, country: 'Cameroon', city: 'Douala', factor: 0.88 },
];
const CATEGORIES = [
  { category: 'Electronics' as const, subcategory: 'Smartphones', product: 'Smartphone Pro X', price: 650, factor: 1.32 },
  { category: 'Home' as const, subcategory: 'Appliances', product: 'Smart Blender', price: 180, factor: 0.92 },
  { category: 'Fashion' as const, subcategory: 'Footwear', product: 'Urban Runner', price: 120, factor: 1.08 },
  { category: 'Beauty' as const, subcategory: 'Skincare', product: 'Daily Care Set', price: 75, factor: 0.84 },
];
const SEGMENTS = ['Consumer','SMB','Enterprise'] as const;
const CHANNELS = ['Online','Retail','Partner'] as const;

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function getQuarter(monthIndex: number): SampleSalesRecord['quarter'] {
  if (monthIndex <= 3) return 'Q1';
  if (monthIndex <= 6) return 'Q2';
  if (monthIndex <= 9) return 'Q3';
  return 'Q4';
}

export const SAMPLE_SALES_DATA: readonly SampleSalesRecord[] = Array.from(
  { length: 24 * REGIONS.length * CATEGORIES.length },
  (_, index) => {
    const monthIndex = index % 12;
    const year = 2025 + Math.floor(index / (12 * REGIONS.length * CATEGORIES.length));
    const regionIndex = Math.floor(index / 12) % REGIONS.length;
    const categoryIndex = Math.floor(index / (12 * REGIONS.length)) % CATEGORIES.length;
    const region = REGIONS[regionIndex];
    const category = CATEGORIES[categoryIndex];
    const segment = SEGMENTS[index % SEGMENTS.length];
    const channel = CHANNELS[(index + categoryIndex) % CHANNELS.length];
    const quantity = 8 + ((index * 7 + categoryIndex * 3) % 38);
    const discount = round(0.02 + ((index * 3) % 9) / 100);
    const unitPrice = category.price;
    const revenue = round(quantity * unitPrice * (1 - discount) * region.factor);
    const cost = round(revenue * (0.58 + categoryIndex * 0.035));
    const profit = round(revenue - cost);
    const margin = round((profit / revenue) * 100);
    const rating = round(3.7 + ((index * 5 + regionIndex) % 14) / 10, 1);

    return {
      id: `ORD-${String(index + 1).padStart(4, '0')}`,
      date: `${year}-${String(monthIndex + 1).padStart(2, '0')}-15`,
      year,
      quarter: getQuarter(monthIndex + 1),
      month: MONTHS[monthIndex],
      monthIndex: monthIndex + 1,
      region: region.region,
      country: region.country,
      city: region.city,
      category: category.category,
      subcategory: category.subcategory,
      product: category.product,
      customerSegment: segment,
      salesChannel: channel,
      quantity,
      unitPrice,
      discount,
      revenue,
      cost,
      profit,
      margin,
      rating,
    };
  },
);

const column = (name: string, physicalName: string, label: string, dataType: ColumnMetadata['dataType'], role: ColumnMetadata['role'], options: Partial<ColumnMetadata> = {}): ColumnMetadata => ({
  id: `sample-sales.${name}`,
  name,
  physicalName,
  label,
  dataType,
  role,
  nullable: false,
  groupable: role !== 'measure',
  filterable: true,
  temporal: role === 'temporal',
  ...options,
});

export const SAMPLE_SALES_COLUMNS: readonly ColumnMetadata[] = [
  column('id','id','Order ID','string','identifier',{primaryKey:true,groupable:false}),
  column('date','date','Date','date','temporal'),
  column('year','year','Year','number','dimension'),
  column('quarter','quarter','Quarter','category','dimension'),
  column('month','month','Month','category','dimension'),
  column('monthIndex','month_index','Month Index','number','dimension'),
  column('region','region','Region','category','dimension'),
  column('country','country','Country','category','dimension'),
  column('city','city','City','category','dimension'),
  column('category','category','Category','category','dimension'),
  column('subcategory','subcategory','Subcategory','category','dimension'),
  column('product','product','Product','category','dimension'),
  column('customerSegment','customer_segment','Customer Segment','category','dimension'),
  column('salesChannel','sales_channel','Sales Channel','category','dimension'),
  column('quantity','quantity','Quantity','number','measure'),
  column('unitPrice','unit_price','Unit Price','number','measure'),
  column('discount','discount','Discount','number','measure'),
  column('revenue','revenue','Revenue','number','measure'),
  column('cost','cost','Cost','number','measure'),
  column('profit','profit','Profit','number','measure'),
  column('margin','margin','Margin','number','measure'),
  column('rating','rating','Rating','number','measure'),
];
