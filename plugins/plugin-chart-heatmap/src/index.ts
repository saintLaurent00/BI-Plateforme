import { ChartPlugin } from '../../types';
import HeatmapChart from './HeatmapChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const HeatmapPlugin: ChartPlugin = {
  type: 'Heatmap',
  metadata: {
    name: 'Heatmap',
    description: 'Visualizes data intensity using colored cells across two dimensions.',
    category: 'Correlation',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Heatmap/images/thumbnail.png',
  },
  buildQuery,
  controlPanel,
  render: (g, props) => {
    const transformedProps = transformProps(props);
    HeatmapChart(g, transformedProps);
  }
};
