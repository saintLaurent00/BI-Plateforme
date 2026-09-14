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

  },
  buildQuery,
  controlPanel,
  getOptions: (props) => {
    return RadarChart(props);
  }
};
