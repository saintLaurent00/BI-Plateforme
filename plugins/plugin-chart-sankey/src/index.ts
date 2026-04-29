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
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-sankey/src/images/thumbnail.png',
  },
  buildQuery,
  controlPanel,
  render: (g, props) => {
    const transformedProps = transformProps(props);
    SankeyChart(g, transformedProps);
  }
};
