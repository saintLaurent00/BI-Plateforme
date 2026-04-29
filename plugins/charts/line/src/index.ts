import { ChartPlugin } from '../../types';
import LineChart from './LineChart';
import transformProps from './transformProps';

export const LineChartPlugin: ChartPlugin = {
  type: 'Line',
  metadata: {
    name: 'Line Chart',
    description: 'A professional line chart for trend visualization.',
    category: 'Evolution',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Line/images/thumbnail.png',
  },
  render: (g, props) => {
    const transformedProps = transformProps(props);
    LineChart(g, transformedProps);
  }
};
