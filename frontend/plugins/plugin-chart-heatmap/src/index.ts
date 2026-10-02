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

  },
  buildQuery,
  controlPanel,
  getOptions: (props) => {
    return HeatmapChart(props);
  }
};
