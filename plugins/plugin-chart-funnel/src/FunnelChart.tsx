import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function FunnelChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale } = props;
  const sortedData = [...data].sort((a, b) => b[yAxis[0]] - a[yAxis[0]]);
  const maxVal = sortedData[0][yAxis[0]];
  
  const funnelDepth = height / sortedData.length;
  
  const funnelG = g.selectAll('.funnel-step').data(sortedData).enter().append('g');

  funnelG.append('polygon')
    .attr('points', (d, i) => {
      const currentW = (d[yAxis[0]] / maxVal) * width;
      const nextW = i < sortedData.length - 1 ? (sortedData[i+1][yAxis[0]] / maxVal) * width : currentW;
      const x1 = (width - currentW) / 2;
      const x2 = width - x1;
      const x3 = (width - nextW) / 2;
      const x4 = width - x3;
      return `${x1},${i * funnelDepth} ${x2},${i * funnelDepth} ${x4},${(i + 1) * funnelDepth} ${x3},${(i + 1) * funnelDepth}`;
    })
    .attr('fill', (d, i) => colorScale(String(i)))
    .attr('fill-opacity', 0.8)
    .attr('stroke', 'white');

  funnelG.append('text')
    .attr('x', width / 2).attr('y', (d, i) => (i + 0.5) * funnelDepth)
    .attr('text-anchor', 'middle')
    .attr('fill', 'white').style('font-size', '12px').style('font-weight', 'bold')
    .text(d => `${d[xAxis]}: ${d[yAxis[0]]}`);
}
