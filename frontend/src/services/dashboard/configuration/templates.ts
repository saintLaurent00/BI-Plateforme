import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  Layout as LayoutIcon
} from 'lucide-react';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  layout: any[];
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Dashboard',
    description: 'Start from scratch with a clean slate.',
    icon: LayoutIcon,
    layout: []
  },
  {
    id: 'sales-overview',
    name: 'Sales Overview',
    description: 'Track revenue, orders, and top-selling products.',
    icon: DollarSign,
    layout: [
      {
        id: 'h1',
        type: 'header',
        content: 'Sales Performance Overview',
        meta: { width: 12 }
      },
      {
        id: 'r1',
        type: 'row',
        children: [
          {
            id: 'c1',
            type: 'kpi_card',
            meta: { width: 4, height: 170, title: 'Total Revenue', kpiValue: '$124,500', kpiTrend: 12.5, kpiPrefix: '$', kpiSuffix: '' }
          },
          {
            id: 'c2',
            type: 'kpi_card',
            meta: { width: 4, height: 170, title: 'Active Orders', kpiValue: '1,250', kpiTrend: 8.2, kpiPrefix: '', kpiSuffix: '' }
          },
          {
            id: 'c3',
            type: 'kpi_card',
            meta: { width: 4, height: 170, title: 'Conversion Rate', kpiValue: '3.4%', kpiTrend: -1.2, kpiPrefix: '', kpiSuffix: '%' }
          }
        ]
      },
      {
        id: 'r2',
        type: 'row',
        children: [
          {
            id: 'c4',
            type: 'chart',
            meta: { width: 8, height: 350, title: 'Revenue Trend' },
            content: { 
              chart_type: 'Area', 
              name: 'Revenue Trend',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          },
          {
            id: 'c5',
            type: 'chart',
            meta: { width: 4, height: 350, title: 'Sales by Category' },
            content: { 
              chart_type: 'Pie', 
              name: 'Sales by Category',
              table_name: 'finance',
              x_axis: 'category',
              y_axis: ['amount']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign Tracker',
    description: 'Monitor campaign ROI, traffic sources, and conversion funnels.',
    icon: TrendingUp,
    layout: [
      {
        id: 'h_mkt',
        type: 'header',
        content: 'Marketing Campaign Performance',
        meta: { width: 12 }
      },
      {
        id: 'r_mkt1',
        type: 'row',
        children: [
          {
            id: 'kpi_mkt1',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'Total Spend', kpiValue: '$45,200', kpiTrend: 5.4 }
          },
          {
            id: 'kpi_mkt2',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'Cost Per Click', kpiValue: '$1.24', kpiTrend: -2.1 }
          },
          {
            id: 'kpi_mkt3',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'Total Leads', kpiValue: '3,850', kpiTrend: 15.2 }
          },
          {
            id: 'kpi_mkt4',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'CPA', kpiValue: '$11.74', kpiTrend: -8.5 }
          }
        ]
      },
      {
        id: 'callout_mkt',
        type: 'callout',
        content: 'La campagne "Summer 2024" génère le meilleur ROI actuellement avec un coût par acquisition 15% inférieur à la moyenne.',
        meta: { width: 12, height: 130, calloutType: 'insight', calloutTitle: 'Insight Principal' }
      },
      {
        id: 'r_mkt2',
        type: 'row',
        children: [
          {
            id: 'chart_mkt1',
            type: 'chart',
            meta: { width: 6, height: 350, title: 'Traffic by Source' },
            content: { 
              chart_type: 'Bar', 
              name: 'Traffic by Source',
              table_name: 'users',
              x_axis: 'created_at',
              y_axis: ['id']
            }
          },
          {
            id: 'chart_mkt2',
            type: 'chart',
            meta: { width: 6, height: 350, title: 'Conversion Funnel' },
            content: { 
              chart_type: 'Bar', 
              name: 'Conversion Funnel',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'user-growth',
    name: 'User Growth Analysis',
    description: 'Monitor user acquisition, retention, and demographics.',
    icon: Users,
    layout: [
      {
        id: 'h2',
        type: 'header',
        content: 'User Growth & Engagement',
        meta: { width: 12 }
      },
      {
        id: 'r3',
        type: 'row',
        children: [
          {
            id: 'c6',
            type: 'chart',
            meta: { width: 6, height: 300, title: 'New Users Over Time' },
            content: { 
              chart_type: 'Bar', 
              name: 'New Users',
              table_name: 'users',
              x_axis: 'created_at',
              y_axis: ['id']
            }
          },
          {
            id: 'c7',
            type: 'chart',
            meta: { width: 6, height: 300, title: 'Active Users (MAU)' },
            content: { 
              chart_type: 'Line', 
              name: 'MAU Trend',
              table_name: 'users',
              x_axis: 'created_at',
              y_axis: ['id']
            }
          }
        ]
      },
      {
        id: 'r4',
        type: 'row',
        children: [
          {
            id: 'c8',
            type: 'chart',
            meta: { width: 12, height: 400, title: 'User Geographic Distribution' },
            content: { 
              chart_type: 'Bar', 
              name: 'Users by Region',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'system-health',
    name: 'System Health',
    description: 'Real-time monitoring of server performance and errors.',
    icon: Activity,
    layout: [
      {
        id: 'h3',
        type: 'header',
        content: 'Infrastructure Health Monitor',
        meta: { width: 12 }
      },
      {
        id: 'r5',
        type: 'row',
        children: [
          {
            id: 'c9',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'CPU Usage', kpiValue: '42%', kpiTrend: 2.1 }
          },
          {
            id: 'c10',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'Memory', kpiValue: '6.4 GB', kpiTrend: 0.5 }
          },
          {
            id: 'c11',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'Disk I/O', kpiValue: '124 MB/s', kpiTrend: -1.2 }
          },
          {
            id: 'c12',
            type: 'kpi_card',
            meta: { width: 3, height: 170, title: 'Network', kpiValue: '85 Mbps', kpiTrend: 5.8 }
          }
        ]
      },
      {
        id: 'c13',
        type: 'chart',
        meta: { width: 12, height: 300, title: 'Error Logs Over Time' },
        content: { 
          chart_type: 'Line', 
          name: 'Error Rate',
          table_name: 'users',
          x_axis: 'created_at',
          y_axis: ['id']
        }
      }
    ]
  },
  {
    id: 'saas-metrics',
    name: 'SaaS Business Metrics',
    description: 'Overview of MRR, Churn, and Customer Lifetime Value.',
    icon: BarChart3,
    layout: [
      {
        id: 'h_saas',
        type: 'header',
        content: 'SaaS Executive Overview',
        meta: { width: 12 }
      },
      {
        id: 'r_saas1',
        type: 'row',
        children: [
          {
            id: 'kpi_saas1',
            type: 'kpi_card',
            meta: { width: 4, height: 170, title: 'Monthly Recurring Revenue (MRR)', kpiValue: '$84,500', kpiTrend: 8.4, kpiPrefix: '$', kpiSuffix: '' }
          },
          {
            id: 'kpi_saas2',
            type: 'kpi_card',
            meta: { width: 4, height: 170, title: 'Churn Rate', kpiValue: '2.4%', kpiTrend: -0.5, kpiPrefix: '', kpiSuffix: '%' }
          },
          {
            id: 'kpi_saas3',
            type: 'kpi_card',
            meta: { width: 4, height: 170, title: 'Active Subscribers', kpiValue: '1,420', kpiTrend: 12.1, kpiPrefix: '', kpiSuffix: '' }
          }
        ]
      },
      {
        id: 'r_saas2',
        type: 'row',
        children: [
          {
            id: 'chart_saas1',
            type: 'chart',
            meta: { width: 8, height: 350, title: 'MRR Growth' },
            content: { 
              chart_type: 'Area', 
              name: 'MRR Growth',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          },
          {
            id: 'callout_saas',
            type: 'callout',
            content: 'Forte croissance sur le plan Enterprise (+25% par rapport au mois dernier).',
            meta: { width: 4, height: 350, calloutType: 'success', calloutTitle: 'Performance' }
          }
        ]
      }
    ]
  }
];
