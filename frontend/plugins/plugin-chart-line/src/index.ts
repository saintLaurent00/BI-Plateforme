import { ChartPlugin } from '../../types';
import LineChart from './LineChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const LineChartPlugin: ChartPlugin = {
  type: 'Line',
  metadata: {
    name: 'Line Chart',
    description: 'A professional line chart for trend visualization.',
    category: 'Evolution',

  },
  buildQuery,
  controlPanel,
  getOptions: (props) => {
    return LineChart(props);
  }
};
