import * as d3 from 'd3';
import { ChartPlugin } from '../../types';

export const HeatmapPlugin: ChartPlugin = {
  type: 'Heatmap',
  metadata: {
    name: 'Heatmap',
    description: 'Visualizes data intensity using colored cells across two dimensions.',
    category: 'Correlation',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Heatmap/images/thumbnail.png',
  },
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip }) => {
    const x = d3.scaleBand().domain(data.map(d => String(d[xAxis]))).range([0, width]).padding(0.05);
    const y = d3.scaleBand().domain(yAxis).range([height, 0]).padding(0.05);
    const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 100]);

    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');
    g.append('g').call(d3.axisLeft(y));

    data.forEach(d => {
      yAxis.forEach(col => {
        g.append('rect').attr('x', x(String(d[xAxis])) || 0).attr('y', y(col) || 0).attr('width', x.bandwidth()).attr('height', y.bandwidth()).attr('fill', color(d[col])).attr('rx', 2)
          .on('mouseover', (e) => showTooltip(e, String(d[xAxis]), d[col], col))
          .on('mousemove', moveTooltip).on('mouseout', hideTooltip);
      });
    });
  }
};
