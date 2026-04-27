import * as d3 from 'd3';
import { ChartPlugin, ChartPluginProps } from './types';

export const HierarchicalChartPlugin: ChartPlugin = {
  type: 'Treemap',
  name: 'Hierarchical Chart',
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type }) => {
    const root = d3.hierarchy({ children: data })
      .sum(d => d[yAxis[0]])
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    if (type === 'Treemap') {
      d3.treemap<any>().size([width, height]).padding(2)(root);
      const leaf = g.selectAll('g')
        .data(root.leaves() as d3.HierarchyRectangularNode<any>[])
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

      leaf.append('rect')
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('rx', 4)
        .on('mouseover', (e, d) => showTooltip(e, String((d.data as any)[xAxis]), (d.data as any)[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);

      leaf.append('text')
        .attr('x', 5)
        .attr('y', 15)
        .text(d => (d.data as any)[xAxis])
        .style('font-size', '10px')
        .style('fill', 'white')
        .style('font-weight', 'bold');
    } else if (type === 'Sunburst') {
      const radius = Math.min(width, height) / 2;
      const partition = d3.partition<any>().size([2 * Math.PI, radius]);
      partition(root);

      const arc = d3.arc<any>()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);

      g.append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)
        .selectAll('path')
        .data(root.descendants())
        .enter().append('path')
        .attr('display', d => d.depth ? null : 'none')
        .attr('d', arc)
        .style('stroke', '#fff')
        .style('fill', (d, i) => colorScale(String(i)))
        .on('mouseover', (e, d) => showTooltip(e, String((d.data as any)[xAxis]), (d.data as any)[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'CirclePacking') {
      d3.pack<any>().size([width, height]).padding(3)(root);
      const leaf = g.selectAll('g')
        .data(root.leaves() as d3.HierarchyCircularNode<any>[])
        .enter().append('g')
        .attr('transform', d => `translate(${d.x},${d.y})`);

      leaf.append('circle')
        .attr('r', d => d.r)
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('fill-opacity', 0.7)
        .on('mouseover', (e, d) => showTooltip(e, String((d.data as any)[xAxis]), (d.data as any)[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    }
  }
};
