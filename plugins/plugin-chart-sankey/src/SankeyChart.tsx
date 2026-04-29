import * as d3 from 'd3';
import { sankey as d3Sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { ChartPluginProps } from '../../types';

export default function SankeyChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale } = props;
  const nodes: any[] = [];
  const links: any[] = [];
  const nodeMap = new Map();
  let nodeIdx = 0;
  
  data.slice(0, 10).forEach(d => {
    const src = String(d[xAxis]);
    const tgt = "Target " + Math.floor(Math.random() * 3);
    if (!nodeMap.has(src)) { nodeMap.set(src, nodeIdx++); nodes.push({ name: src }); }
    if (!nodeMap.has(tgt)) { nodeMap.set(tgt, nodeIdx++); nodes.push({ name: tgt }); }
    links.push({ source: nodeMap.get(src), target: nodeMap.get(tgt), value: Number(d[yAxis[0]]) || 10 });
  });

  const sankey = d3Sankey().nodeWidth(15).nodePadding(10).extent([[1, 1], [width - 1, height - 6]]);
  const { nodes: sNodes, links: sLinks } = sankey({ nodes: nodes.map(d => ({ ...d })), links: links.map(d => ({ ...d })) });

  g.append('g').attr('stroke', '#000').attr('stroke-opacity', 0.2).selectAll('path').data(sLinks).enter().append('path').attr('d', sankeyLinkHorizontal()).attr('stroke-width', d => Math.max(1, (d as any).width)).attr('fill', 'none').attr('stroke', (d, i) => colorScale(String(i)));
  g.append('g').selectAll('rect').data(sNodes).enter().append('rect').attr('x', d => (d as any).x0).attr('y', d => (d as any).y0).attr('height', d => (d as any).y1 - (d as any).y0).attr('width', d => (d as any).x1 - (d as any).x0).attr('fill', (d, i) => colorScale(String(i))).attr('rx', 2);
}
