import { ChartPlugin } from '../../types';
import PieChart from './PieChart';
import transformProps from './transformProps';

export const PieChartPlugin: ChartPlugin = {
  type: 'Pie',
  metadata: {
    name: 'Pie Chart',
    description: 'A classic pie chart for proportional data visualization.',
    category: 'Part-to-whole',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Pie/images/thumbnail.png',
  },
  render: (g, props) => {
    const transformedProps = transformProps(props);
    PieChart(g, transformedProps);
  }
};
