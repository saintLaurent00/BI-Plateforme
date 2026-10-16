import {
  getCharts as getLocalCharts,
  saveChart as saveLocalChart,
} from '@/platform/persistence/local/db';

export const visualizationService = {
  async listCharts() {
    return getLocalCharts();
  },
  async saveChart(chart: unknown) {
    await saveLocalChart(chart);
    return chart;
  },
};
