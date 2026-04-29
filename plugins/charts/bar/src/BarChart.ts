import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function BarChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip } = props;

  const x = d3.scaleBand()
    .domain(data.map(d => String(d[xAxis])))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
    .nice()
    .range([height, 0]);

  // X Axis
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', '10px')
    .style('fill', '#64748b');

  // Y Axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .style('fill', '#64748b');

  // Bars
  yAxis.forEach((col, i) => {
    g.selectAll(`.bar-${i}`)
      .data(data)
      .enter().append('rect')
      .attr('class', `bar-${i}`)
      .attr('x', d => (x(String(d[xAxis])) || 0) + (x.bandwidth() / yAxis.length) * i)
      .attr('y', d => y(d[col]))
      .attr('width', x.bandwidth() / yAxis.length)
      .attr('height', d => height - y(d[col]))
      .attr('fill', colorScale(col))
      .attr('rx', 4)
      .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[col], col))
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip);
  });
}
