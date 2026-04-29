import * as d3 from 'd3';
import { ChartPlugin } from '../../types';

export const TreemapPlugin: ChartPlugin = {
  type: 'Treemap',
  metadata: {
    name: 'Treemap',
    description: 'Visualizes hierarchical data using nested rectangles.',
    category: 'Part-to-whole',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Treemap/images/thumbnail.png',
  },
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip }) => {
    const root = d3.hierarchy({ children: data }).sum(d => d[yAxis[0]]).sort((a, b) => (b.value || 0) - (a.value || 0));
    d3.treemap<any>().size([width, height]).padding(2)(root);
    
    const leaf = g.selectAll('g').data(root.leaves() as d3.HierarchyRectangularNode<any>[]).enter().append('g').attr('transform', d => `translate(${d.x0},${d.y0})`);
    leaf.append('rect').attr('width', d => d.x1 - d.x0).attr('height', d => d.y1 - d.y0).attr('fill', (d, i) => colorScale(String(i))).attr('rx', 4).on('mouseover', (e, d) => showTooltip(e, String((d.data as any)[xAxis]), (d.data as any)[yAxis[0]])).on('mousemove', moveTooltip).on('mouseout', hideTooltip);
    leaf.append('text').attr('x', 5).attr('y', 15).text(d => (d.data as any)[xAxis]).style('font-size', '10px').style('fill', 'white').style('font-weight', 'bold');
  }
};
