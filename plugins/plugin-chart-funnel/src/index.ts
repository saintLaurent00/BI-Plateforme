import { ChartPlugin } from '../../types';
import FunnelChart from './FunnelChart';

export const FunnelPlugin: ChartPlugin = {
  type: 'Funnel',
  metadata: {
    name: 'Entonnoir (Funnel)',
    description: 'Visualise les étapes d\'un processus de conversion.',
    category: 'Flow',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Funnel/images/thumbnail.png',
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
  render: (g, props) => FunnelChart(g, props),
};
