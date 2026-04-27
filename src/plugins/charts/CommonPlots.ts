import * as d3 from 'd3';
import { ChartPlugin, ChartPluginProps } from './types';

export const CommonPlotsPlugin: ChartPlugin = {
  type: 'Scatter',
  name: 'Common Plot',
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type }) => {
    if (type === 'Scatter' || type === 'Bubble') {
      const x = d3.scaleLinear().domain([0, d3.max(data, d => d[xAxis] as number) || 0]).nice().range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d[yAxis[0]] as number) || 0]).nice().range([height, 0]);
      g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
      g.append('g').call(d3.axisLeft(y));
      g.selectAll('circle').data(data).enter().append('circle')
        .attr('cx', d => x(d[xAxis])).attr('cy', d => y(d[yAxis[0]]))
        .attr('r', d => type === 'Bubble' ? (d[yAxis[1]] || 10) / 2 : 6)
        .attr('fill', (d, i) => colorScale(String(i))).attr('fill-opacity', 0.7)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
        .on('mousemove', moveTooltip).on('mouseout', hideTooltip);
    } else if (type === 'Heatmap') {
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
    } else if (type === 'Gauge') {
      const radius = Math.min(width, height) / 2;
      const gaugeG = g.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
      const arc = d3.arc<any>().innerRadius(radius * 0.7).outerRadius(radius).startAngle(-Math.PI / 2).endAngle(Math.PI / 2).cornerRadius(10);
      gaugeG.append('path').attr('d', arc).attr('fill', '#e2e8f0');
      const val = data[0][yAxis[0]];
      const angle = (val / 100) * Math.PI - Math.PI / 2;
      const valArc = d3.arc<any>().innerRadius(radius * 0.7).outerRadius(radius).startAngle(-Math.PI / 2).endAngle(angle).cornerRadius(10);
      gaugeG.append('path').attr('d', valArc).attr('fill', colorScale('0'))
        .on('mouseover', (e) => showTooltip(e, String(data[0][xAxis]), data[0][yAxis[0]], yAxis[0]))
        .on('mousemove', moveTooltip).on('mouseout', hideTooltip);
      gaugeG.append('text').attr('dy', '0.35em').style('text-anchor', 'middle').style('font-size', '32px').style('font-weight', 'bold').style('fill', '#1e293b').text(`${val}%`);
    }
  }
};
