import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function SunburstChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale } = props;
  const radius = Math.min(width, height) / 2;
  
  const hierarchy = d3.hierarchy({ children: data })
    .sum(d => d[yAxis[0]] || 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const root = d3.partition<any>().size([2 * Math.PI, radius])(hierarchy);

  const arc = d3.arc<d3.HierarchyRectangularNode<any>>()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius / 2)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1 - 1);

  const sunburstG = g.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

  sunburstG.selectAll('path')
    .data(root.descendants().slice(1))
    .enter().append('path')
    .attr('display', d => d.depth ? null : 'none')
    .attr('d', arc as any)
    .attr('fill', (d: any) => colorScale(d.data[xAxis] || d.parent.data[xAxis]))
    .attr('stroke', 'white')
    .style('stroke-width', '0.5px');
}
