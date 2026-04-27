import * as d3 from 'd3';
import { ChartPlugin, ChartPluginProps } from './types';

export const PieChartPlugin: ChartPlugin = {
  type: 'Pie',
  name: 'Pie Chart',
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type }) => {
    const innerWidth = width;
    const innerHeight = height;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    
    const pieG = g.append('g')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

    const pie = d3.pie<any>()
      .value(d => d[yAxis[0]])
      .sort(null);

    const arc = d3.arc<any>()
      .innerRadius(type === 'Donut' ? radius * 0.6 : 0)
      .outerRadius(radius)
      .cornerRadius(8)
      .padAngle(0.02);

    const arcs = pieG.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => colorScale(String(i)))
      .on('mouseover', (e, d) => showTooltip(e, String(d.data[xAxis]), d.data[yAxis[0]]))
      .on('mousemove', moveTooltip)
      .on('mouseout', hideTooltip);
    
    if (data.length < 10) {
      arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'white')
        .style('font-weight', 'bold')
        .text(d => d.data[xAxis]);
    }
  }
};
