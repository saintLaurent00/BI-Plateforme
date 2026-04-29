import { ChartPlugin } from '../../types';
import BarChart from './BarChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const BarChartPlugin: ChartPlugin = {
  type: 'Bar',
  metadata: {
    name: 'Bar Chart',
    description: 'A professional bar chart for categorical data comparison.',
    category: 'Distribution',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/legacy-plugin-chart-bar/src/images/thumbnail.png',
  },
  buildQuery,
  controlPanel,
  render: (g, props) => {
    const transformedProps = transformProps(props);
    BarChart(g, transformedProps);
  }
};
