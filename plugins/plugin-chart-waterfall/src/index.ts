import { ChartPlugin } from '../../types';
import WaterfallChart from './WaterfallChart';

export const WaterfallPlugin: ChartPlugin = {
  type: 'Waterfall',
  metadata: {
    name: 'Cascade (Waterfall)',
    description: 'Visualise l\'effet cumulatif de valeurs positives et négatives.',
    category: 'Flow',

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
  getOptions: (props) => WaterfallChart(props),
};
