import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function BarChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, onItemClick } = props;

  // Create a clip path so bars don't spill over
  const clipId = `clip-${Math.random().toString(36).substr(2, 9)}`;
  const svg = d3.select(g.node()?.ownerSVGElement || null);
  
  if (!svg.empty()) {
    svg.append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('width', width)
      .attr('height', height);
  }

  const chartArea = g.append('g').attr('clip-path', `url(#${clipId})`);

  const x = d3.scaleBand()
    .domain(data.map(d => String(d[xAxis])))
    .range([0, width])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
    .nice()
    .range([height, 0]);

  // Bottom Axis Group
  const xAxisG = g.append('g')
    .attr('transform', `translate(0,${height})`);
  
  const xAxisObj = d3.axisBottom(x);
  xAxisG.call(xAxisObj)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', '10px')
    .style('fill', '#64748b');

  // Left Axis Group
  const yAxisG = g.append('g');
  const yAxisObj = d3.axisLeft(y).ticks(5);
  yAxisG.call(yAxisObj)
    .selectAll('text')
    .style('fill', '#64748b');

  // Bars Container
  const barsG = chartArea.append('g');

  // Render Bars
  const renderBars = (currentX: any) => {
    barsG.selectAll('.bar-group').remove();
    
    yAxis.forEach((col, i) => {
      const bars = barsG.append('g').attr('class', 'bar-group');
      bars.selectAll(`.bar-${i}`)
        .data(data)
        .enter().append('rect')
        .attr('class', `bar-${i}`)
        .attr('x', d => (currentX(String(d[xAxis])) || 0) + (currentX.bandwidth() / yAxis.length) * i)
        .attr('y', d => y(d[col]))
        .attr('width', currentX.bandwidth() / yAxis.length)
        .attr('height', d => height - y(d[col]))
        .attr('fill', colorScale(col))
        .attr('rx', 4)
        .attr('cursor', 'pointer')
        .on('mouseover', (e, d) => {
          d3.select(e.currentTarget).attr('fill-opacity', 0.8);
          showTooltip(e, String(d[xAxis]), d[col], col, d);
        })
        .on('mousemove', moveTooltip)
        .on('mouseout', (e) => {
          d3.select(e.currentTarget).attr('fill-opacity', 1);
          hideTooltip();
        })
        .on('click', (e, d) => {
          if (onItemClick) onItemClick(d);
        });
    });
  };

  renderBars(x);

  // Zoom implementation
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .on('zoom', (event) => {
      const transform = event.transform;
      // For scaleBand, we transform the range manually or use a wrapper
      // A simpler way for Bar chart zoom is often x.range([0, width].map(d => transform.applyX(d)))
      const newRange = [0, width].map(d => transform.applyX(d));
      x.range(newRange);
      
      xAxisG.call(xAxisObj);
      xAxisG.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
        
      renderBars(x);
    });

  if (svg) {
    svg.call(zoom as any);
  }
}
