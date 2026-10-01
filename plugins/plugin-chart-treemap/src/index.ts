import { ChartPlugin } from '../../types';
import TreemapChart from './TreemapChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const TreemapPlugin: ChartPlugin = {
  type: 'Treemap',
  metadata: {
    name: 'Treemap',
    description: 'Visualizes hierarchical data using nested rectangles.',
    category: 'Part-to-whole',

  },
  buildQuery,
  controlPanel,
  getOptions: (props) => {
    return TreemapChart(props);
  }
};
