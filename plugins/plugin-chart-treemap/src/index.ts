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
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Treemap/images/thumbnail.png',
  },
  buildQuery,
  controlPanel,
  render: (g, props) => {
    const transformedProps = transformProps(props);
    TreemapChart(g, transformedProps);
  }
};
