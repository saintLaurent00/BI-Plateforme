import * as d3 from 'd3';
import { ChartPlugin } from '../../types';

export const ScatterChartPlugin: ChartPlugin = {
  type: 'Scatter',
  metadata: {
    name: 'Scatter Plot',
    description: 'Visualizes the relationship between two numerical sets.',
    category: 'Correlation',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Scatter/images/thumbnail.png',
  },
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type }) => {
    const x = d3.scaleLinear().domain([0, d3.max(data, d => d[xAxis] as number) || 0]).nice().range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d[yAxis[0]] as number) || 0]).nice().range([height, 0]);
    
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
    g.append('g').call(d3.axisLeft(y));
    
    g.selectAll('circle').data(data).enter().append('circle')
      .attr('cx', d => x(d[xAxis])).attr('cy', d => y(d[yAxis[0]]))
      .attr('r', 6)
      .attr('fill', (d, i) => colorScale(String(i))).attr('fill-opacity', 0.7)
      .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
      .on('mousemove', moveTooltip).on('mouseout', hideTooltip);
  }
};
