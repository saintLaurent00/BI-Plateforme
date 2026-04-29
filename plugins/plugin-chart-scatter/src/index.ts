import { ChartPlugin } from '../../types';
import ScatterChart from './ScatterChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const ScatterChartPlugin: ChartPlugin = {
  type: 'Scatter',
  metadata: {
    name: 'Scatter Plot',
    description: 'Visualizes the relationship between two numerical sets.',
    category: 'Correlation',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Scatter/images/thumbnail.png',
  },
  buildQuery,
  controlPanel,
  render: (g, props) => {
    const transformedProps = transformProps(props);
    ScatterChart(g, transformedProps);
  }
};
