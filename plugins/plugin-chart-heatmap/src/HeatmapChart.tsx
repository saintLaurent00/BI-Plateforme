import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function HeatmapChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, showTooltip, moveTooltip, hideTooltip } = props;
  
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

  const x = d3.scaleBand().domain(data.map(d => String(d[xAxis]))).range([0, width]).padding(0.05);
  const y = d3.scaleBand().domain(yAxis).range([height, 0]).padding(0.05);
  const color = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 100]);

  const xAxisG = g.append('g').attr('transform', `translate(0,${height})`);
  const xAxisObj = d3.axisBottom(x);
  xAxisG.call(xAxisObj).selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');
  
  const yAxisG = g.append('g');
  const yAxisObj = d3.axisLeft(y);
  yAxisG.call(yAxisObj);

  const rectsG = chartArea.append('g');

  const renderRects = (currentX: any, currentY: any) => {
    rectsG.selectAll('*').remove();
    data.forEach(d => {
      yAxis.forEach(col => {
        rectsG.append('rect')
          .attr('x', currentX(String(d[xAxis])) || 0)
          .attr('y', currentY(col) || 0)
          .attr('width', currentX.bandwidth())
          .attr('height', currentY.bandwidth())
          .attr('fill', color(d[col]))
          .attr('rx', 2)
          .on('mouseover', (e) => {
            d3.select(e.currentTarget).attr('stroke', '#fff').attr('stroke-width', 2);
            showTooltip(e, String(d[xAxis]), d[col], col, d);
          })
          .on('mousemove', moveTooltip)
          .on('mouseout', (e) => {
            d3.select(e.currentTarget).attr('stroke', null).attr('stroke-width', null);
            hideTooltip();
          });
      });
    });
  };

  renderRects(x, y);

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 10])
    .on('zoom', (event) => {
      const transform = event.transform;
      // Rescale scaleBands manually
      const newXRange = [0, width].map(d => transform.applyX(d));
      const newYRange = [height, 0].map(d => transform.applyY(d - height) + height);
      x.range(newXRange);
      y.range(newYRange);

      xAxisG.call(xAxisObj);
      xAxisG.selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
      yAxisG.call(yAxisObj);

      renderRects(x, y);
    });

  if (svg) {
    svg.call(zoom as any);
  }
}
