import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function LineChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale, type } = props;

  const x = d3.scalePoint()
    .domain(data.map(d => String(d[xAxis])))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
    .nice()
    .range([height, 0]);

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', '10px');

  g.append('g')
    .call(d3.axisLeft(y).ticks(5));

  yAxis.forEach((col, i) => {
    let curve = d3.curveLinear;
    if (type === 'SmoothLine') curve = d3.curveMonotoneX;
    if (type === 'StepLine') curve = d3.curveStepAfter;

    const line = d3.line<any>()
      .x(d => x(String(d[xAxis])) || 0)
      .y(d => y(d[col]))
      .curve(curve);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', colorScale(col))
      .attr('stroke-width', 3)
      .attr('d', line);
  });
}
