import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function WaterfallChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale } = props;
  
  let cumulative = 0;
  const waterfallData = data.map((d, i) => {
    const start = cumulative;
    cumulative += d[yAxis[0]];
    const end = cumulative;
    return { ...d, start, end };
  });

  const x = d3.scaleBand().range([0, width]).domain(waterfallData.map(d => String(d[xAxis]))).padding(0.2);
  const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(waterfallData, d => d.end) || 100]);

  g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
  g.append('g').call(d3.axisLeft(y));

  const barG = g.selectAll('.bar').data(waterfallData).enter().append('g').attr('transform', d => `translate(${x(String(d[xAxis]))},0)`);

  barG.append('rect')
    .attr('y', d => y(Math.max(d.start, d.end)))
    .attr('height', d => Math.abs(y(d.start) - y(d.end)))
    .attr('width', x.bandwidth())
    .attr('fill', (d, i) => d[yAxis[0]] >= 0 ? '#10b981' : '#ef4444');

  // Connector lines
  waterfallData.forEach((d, i) => {
    if (i < waterfallData.length - 1) {
      g.append('line')
        .attr('x1', (x(String(d[xAxis])) || 0) + x.bandwidth())
        .attr('y1', y(d.end))
        .attr('x2', x(String(waterfallData[i+1][xAxis])) || 0)
        .attr('y2', y(d.end))
        .attr('stroke', '#ccc')
        .attr('stroke-dasharray', '2,2');
    }
  });
}
