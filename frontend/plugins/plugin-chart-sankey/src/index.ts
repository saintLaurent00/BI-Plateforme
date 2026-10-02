import { ChartPlugin } from '../../types';
import SankeyChart from './SankeyChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const SankeyPlugin: ChartPlugin = {
  type: 'Sankey',
  metadata: {
    name: 'Sankey Diagram',
    description: 'Visualizes the flow of values between several stages or groups.',
    category: 'Flow',

  },
  buildQuery,
  controlPanel,
  getOptions: (props) => {
    return SankeyChart(props);
  }
};
