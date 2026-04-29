import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function PieChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type, onItemClick } = props;
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

  const arcHover = d3.arc<any>()
    .innerRadius(type === 'Donut' ? radius * 0.6 : 0)
    .outerRadius(radius * 1.05)
    .cornerRadius(8)
    .padAngle(0.02);

  const arcs = pieG.selectAll('.arc')
    .data(pie(data))
    .enter().append('g')
    .attr('class', 'arc');

  const showLabels = props.config?.showLabels ?? true;

  arcs.append('path')
    .attr('d', arc)
    .attr('fill', (d, i) => colorScale(String(i)))
    .attr('cursor', 'pointer')
    .style('transition', 'all 0.3s ease')
    .on('mouseover', (e, d) => {
      d3.select(e.currentTarget).transition().duration(200).attr('d', arcHover as any);
      showTooltip(e, String(d.data[xAxis]), d.data[yAxis[0]], undefined, d.data);
    })
    .on('mousemove', moveTooltip)
    .on('mouseout', (e) => {
      d3.select(e.currentTarget).transition().duration(200).attr('d', arc as any);
      hideTooltip();
    })
    .on('click', (e, d) => {
      if (onItemClick) onItemClick(d.data);
    });

  if (showLabels) {
    const labelArc = d3.arc<any>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    arcs.append('text')
      .attr('transform', d => `translate(${labelArc.centroid(d)})`)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('class', 'text-[10px] font-bold fill-white')
      .style('pointer-events', 'none')
      .text(d => {
        // Only show label if angle is large enough
        if (d.endAngle - d.startAngle > 0.25) {
          return String(d.data[xAxis]);
        }
        return '';
      });
  }
}
