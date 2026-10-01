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

  },
  buildQuery,
  controlPanel,
  getOptions: (props) => {
    return ScatterChart(props);
  }
};
