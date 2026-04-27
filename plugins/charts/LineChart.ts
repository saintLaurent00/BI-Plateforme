import * as d3 from 'd3';
import { ChartPlugin, ChartPluginProps } from './types';

export const LineChartPlugin: ChartPlugin = {
  type: 'Line',
  name: 'Line Chart',
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type }) => {
    const innerWidth = width;
    const innerHeight = height;

    const x = d3.scalePoint()
      .domain(data.map(d => String(d[xAxis])))
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
      .nice()
      .range([innerHeight, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#64748b');

    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#64748b');

    yAxis.forEach((col, i) => {
      let curve = d3.curveLinear;
      if (type === 'StepLine') curve = d3.curveStepAfter;
      if (type === 'SmoothLine') curve = d3.curveMonotoneX;

      const line = d3.line<any>()
        .x(d => x(String(d[xAxis])) || 0)
        .y(d => y(d[col]))
        .curve(curve);

      // Area gradient
      const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;
      const defs = g.append('defs');
      const linearGradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      
      linearGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(col))
        .attr('stop-opacity', 0.2);
      
      linearGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(col))
        .attr('stop-opacity', 0);

      const area = d3.area<any>()
        .x(d => x(String(d[xAxis])) || 0)
        .y0(innerHeight)
        .y1(d => y(d[col]))
        .curve(curve);

      g.append('path')
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', area);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorScale(col))
        .attr('stroke-width', 3)
        .attr('d', line);

      g.selectAll(`.dot-${i}`)
        .data(data)
        .enter().append('circle')
        .attr('cx', d => x(String(d[xAxis])) || 0)
        .attr('cy', d => y(d[col]))
        .attr('r', 4)
        .attr('fill', 'white')
        .attr('stroke', colorScale(col))
        .attr('stroke-width', 2)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[col], col))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    });
  }
};
