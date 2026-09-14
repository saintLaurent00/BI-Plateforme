import { ChartPlugin } from '../../types';
import FunnelChart from './FunnelChart';

export const FunnelPlugin: ChartPlugin = {
  type: 'Funnel',
  metadata: {
    name: 'Entonnoir (Funnel)',
    description: 'Visualise les étapes d\'un processus de conversion.',
    category: 'Flow',

  },
  controlPanel: {
    controlPanelSections: [
      {
        label: 'Conversion',
        controlSetRows: [['metrics'], ['groupby'], ['limit']],
      },
      {
        label: 'Apparence',
        controlSetRows: [['color_scheme'], ['show_labels']],
      },
    ],
  },
  getOptions: (props) => FunnelChart(props),
};
