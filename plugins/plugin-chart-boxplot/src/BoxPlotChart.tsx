import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function BoxPlotChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale } = props;
  
  const x = d3.scaleBand().range([0, width]).domain(data.map(d => String(d[xAxis]))).padding(0.4);
  const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, d => d[yAxis[0]] * 1.5) || 100]);

  g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x));
  g.append('g').call(d3.axisLeft(y));

  const boxG = g.selectAll('.box').data(data).enter().append('g').attr('transform', d => `translate(${x(String(d[xAxis]))},0)`);

  boxG.append('line')
    .attr('x1', x.bandwidth() / 2).attr('x2', x.bandwidth() / 2)
    .attr('y1', d => y(d[yAxis[0]] * 0.8)).attr('y2', d => y(d[yAxis[0]] * 1.2))
    .attr('stroke', 'currentColor');

  boxG.append('rect')
    .attr('x', 0).attr('y', d => y(d[yAxis[0]] * 1.1))
    .attr('width', x.bandwidth()).attr('height', d => y(d[yAxis[0]] * 0.9) - y(d[yAxis[0]] * 1.1))
    .attr('fill', (d, i) => colorScale(String(i))).attr('stroke', 'black');
}
