import { ChartPlugin } from '../../types';
import WaterfallChart from './WaterfallChart';

export const WaterfallPlugin: ChartPlugin = {
  type: 'Waterfall',
  metadata: {
    name: 'Cascade (Waterfall)',
    description: 'Visualise l\'effet cumulatif de valeurs positives et négatives.',
    category: 'Flow',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/legacy-plugin-chart-waterfall/src/images/thumbnail.png',
  },
  controlPanel: {
    controlPanelSections: [
      {
        label: 'Flux',
        controlSetRows: [['metrics'], ['groupby']],
      },
      {
        label: 'Style',
        controlSetRows: [['color_scheme']],
      },
    ],
  },
  render: (g, props) => WaterfallChart(g, props),
};
