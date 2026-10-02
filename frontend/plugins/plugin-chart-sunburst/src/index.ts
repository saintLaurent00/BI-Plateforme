import { ChartPlugin } from '../../types';
import SunburstChart from './SunburstChart';

export const SunburstPlugin: ChartPlugin = {
  type: 'Sunburst',
  metadata: {
    name: 'Rayonnement (Sunburst)',
    description: 'Visualise les données hiérarchiques sous forme de cercles concentriques.',
    category: 'Part-to-whole',

  },
  controlPanel: {
    controlPanelSections: [
      {
        label: 'Hiérarchie',
        controlSetRows: [['metrics'], ['groupby']],
      },
      {
        label: 'Style',
        controlSetRows: [['color_scheme'], ['show_labels']],
      },
    ],
  },
  getOptions: (props) => SunburstChart(props),
};
