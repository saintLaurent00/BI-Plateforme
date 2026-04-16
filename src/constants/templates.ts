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
            type: 'chart',
            meta: { width: 4, height: 200, title: 'Total Revenue' },
            content: { 
              chart_type: 'Big Number', 
              name: 'Total Revenue',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          },
          {
            id: 'c2',
            type: 'chart',
            meta: { width: 4, height: 200, title: 'Active Orders' },
            content: { 
              chart_type: 'Big Number', 
              name: 'Active Orders',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          },
          {
            id: 'c3',
            type: 'chart',
            meta: { width: 4, height: 200, title: 'Conversion Rate' },
            content: { 
              chart_type: 'Big Number', 
              name: 'Conversion Rate',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
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
            type: 'chart',
            meta: { width: 3, height: 120, title: 'CPU Usage' },
            content: { 
              chart_type: 'Bar', 
              name: 'CPU',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          },
          {
            id: 'c10',
            type: 'chart',
            meta: { width: 3, height: 120, title: 'Memory' },
            content: { 
              chart_type: 'Bar', 
              name: 'RAM',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          },
          {
            id: 'c11',
            type: 'chart',
            meta: { width: 3, height: 120, title: 'Disk I/O' },
            content: { 
              chart_type: 'Bar', 
              name: 'Disk',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
          },
          {
            id: 'c12',
            type: 'chart',
            meta: { width: 3, height: 120, title: 'Network' },
            content: { 
              chart_type: 'Bar', 
              name: 'Network',
              table_name: 'sales_data',
              x_axis: 'region',
              y_axis: ['sales']
            }
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
  }
];
