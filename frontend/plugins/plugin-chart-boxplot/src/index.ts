import { ChartPlugin } from '../../types';
import BoxPlotChart from './BoxPlotChart';

export const BoxPlotPlugin: ChartPlugin = {
  type: 'BoxPlot',
  metadata: {
    name: 'Boîte à moustaches',
    description: 'Visualise la distribution statistique des données.',
    category: 'Distribution',

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
  getOptions: (props) => BoxPlotChart(props),
};
