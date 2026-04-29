import { ChartPlugin } from '../../types';
import RadarChart from './RadarChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const RadarChartPlugin: ChartPlugin = {
  type: 'Radar',
  metadata: {
    name: 'Radar Chart',
    description: 'A spider chart for multivariate data comparison.',
    category: 'Ranking',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Radar/images/thumbnail.png',
  },
  buildQuery,
  controlPanel,
  render: (g, props) => {
    const transformedProps = transformProps(props);
    RadarChart(g, transformedProps);
  }
};
