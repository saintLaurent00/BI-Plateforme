import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function PieChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type } = props;
  const radius = Math.min(width, height) / 2;
  
  const pieG = g.append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const pie = d3.pie<any>()
    .value(d => Number(d[yAxis[0]]))
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
}
