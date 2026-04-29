import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function LineChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale, type, showTooltip, moveTooltip, hideTooltip, onItemClick } = props;

  const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
  const svgNode = g.node()?.ownerSVGElement;
  const svg = d3.select(svgNode || null);
  
  if (svgNode) {
    svg.append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('width', width)
      .attr('height', height);
  }

  const chartArea = g.append('g').attr('clip-path', `url(#${clipId})`);

  const x = d3.scalePoint()
    .domain(data.map(d => String(d[xAxis])))
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
    .nice()
    .range([height, 0]);

  const xAxisG = g.append('g')
    .attr('transform', `translate(0,${height})`);
  
  const xAxisObj = d3.axisBottom(x);
  xAxisG.call(xAxisObj)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', '10px');

  const yAxisG = g.append('g');
  yAxisG.call(d3.axisLeft(y).ticks(5));

  const linesG = chartArea.append('g');
  const pointsG = chartArea.append('g');

  const renderLines = (currentX: any) => {
    linesG.selectAll('*').remove();
    pointsG.selectAll('*').remove();

    yAxis.forEach((col, i) => {
      let curve = d3.curveLinear;
      if (type === 'SmoothLine') curve = d3.curveMonotoneX;
      if (type === 'StepLine') curve = d3.curveStepAfter;

      const line = d3.line<any>()
        .x(d => currentX(String(d[xAxis])) || 0)
        .y(d => y(d[col]))
        .curve(curve);

      if (type === 'Area') {
        const area = d3.area<any>()
          .x(d => currentX(String(d[xAxis])) || 0)
          .y0(height)
          .y1(d => y(d[col]))
          .curve(curve);
          
        linesG.append('path')
          .datum(data)
          .attr('fill', colorScale(col))
          .attr('fill-opacity', 0.3)
          .attr('stroke', 'none')
          .attr('d', area);
      }

      linesG.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colorScale(col))
        .attr('stroke-width', 3)
        .attr('d', line);

      // Points for interactivity
      pointsG.selectAll(`.point-${i}`)
        .data(data)
        .enter().append('circle')
        .attr('class', `point-${i}`)
        .attr('cx', d => currentX(String(d[xAxis])) || 0)
        .attr('cy', d => y(d[col]))
        .attr('r', 5)
        .attr('fill', colorScale(col))
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('cursor', 'pointer')
        .attr('fill-opacity', 0) // Hidden until hover or just for hitbox
        .on('mouseover', (e, d) => {
          d3.select(e.currentTarget).attr('fill-opacity', 1).attr('r', 7);
          showTooltip(e, String(d[xAxis]), d[col], col, d);
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', (e) => {
          d3.select(e.currentTarget).attr('fill-opacity', 0).attr('r', 5);
          hideTooltip();
        })
        .on('click', (e, d) => {
          if (onItemClick) onItemClick(d);
        });
    });
  };

  renderLines(x);

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .on('zoom', (event) => {
      const transform = event.transform;
      const newRange = [0, width].map(d => transform.applyX(d));
      x.range(newRange);
      
      xAxisG.call(xAxisObj);
      xAxisG.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
        
      renderLines(x);
    });

  if (svg) {
    svg.call(zoom as any);
  }
}
