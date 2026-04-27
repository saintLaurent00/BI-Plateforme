import * as d3 from 'd3';
import { ChartPlugin, ChartPluginProps } from './types';

export const BarChartPlugin: ChartPlugin = {
  type: 'Bar',
  name: 'Bar Chart',
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip }) => {
    const innerWidth = width;
    const innerHeight = height;

    const x = d3.scaleBand()
      .domain(data.map(d => String(d[xAxis])))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
      .nice()
      .range([innerHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#64748b');

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#64748b');

    yAxis.forEach((col, i) => {
      g.selectAll(`.bar-${i}`)
        .data(data)
        .enter().append('rect')
        .attr('class', `bar-${i}`)
        .attr('x', d => (x(String(d[xAxis])) || 0) + (x.bandwidth() / yAxis.length) * i)
        .attr('y', d => y(d[col]))
        .attr('width', x.bandwidth() / yAxis.length)
        .attr('height', d => innerHeight - y(d[col]))
        .attr('fill', colorScale(col))
        .attr('rx', 4)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[col], col))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    });
  }
};
