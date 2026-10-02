import { ChartPlugin } from '../../types';
import PieChart from './PieChart';
import transformProps from './transformProps';
import buildQuery from './buildQuery';
import { controlPanel } from './controlPanel';

export const PieChartPlugin: ChartPlugin = {
  type: 'Pie',
  metadata: {
    name: 'Pie Chart',
    description: 'A classic pie chart for proportional data visualization.',
    category: 'Part-to-whole',

  },
  buildQuery,
  controlPanel,
  getOptions: (props) => {
    return PieChart(props);
  }
};
