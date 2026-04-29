import { ChartPlugin } from '../../types';
import BoxPlotChart from './BoxPlotChart';

export const BoxPlotPlugin: ChartPlugin = {
  type: 'BoxPlot',
  metadata: {
    name: 'Boîte à moustaches',
    description: 'Visualise la distribution statistique des données.',
    category: 'Distribution',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/BoxPlot/images/thumbnail.png',
  },
  controlPanel: {
    controlPanelSections: [
      {
        label: 'Données',
        controlSetRows: [['metrics'], ['groupby']],
      },
      {
        label: 'Style',
        controlSetRows: [['color_scheme'], ['show_outliers']],
      },
    ],
  },
  render: (g, props) => BoxPlotChart(g, props),
};
