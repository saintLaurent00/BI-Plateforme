import * as d3 from 'd3';
import { ChartPluginProps } from '../../types';

export default function ScatterChart(g: d3.Selection<SVGGElement, unknown, null, undefined>, props: ChartPluginProps) {
  const { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, onItemClick } = props;

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

  const x = d3.scaleLinear().domain([0, d3.max(data, d => d[xAxis] as number) || 0]).nice().range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d[yAxis[0]] as number) || 0]).nice().range([height, 0]);
  
  const xAxisG = g.append('g').attr('transform', `translate(0,${height})`);
  const xAxisObj = d3.axisBottom(x);
  xAxisG.call(xAxisObj);

  const yAxisG = g.append('g');
  const yAxisObj = d3.axisLeft(y);
  yAxisG.call(yAxisObj);
  
  const pointsG = chartArea.append('g');

  const renderPoints = (currentX: any, currentY: any) => {
    pointsG.selectAll('circle').remove();
    pointsG.selectAll('circle').data(data).enter().append('circle')
      .attr('cx', d => currentX(d[xAxis]))
      .attr('cy', d => currentY(d[yAxis[0]]))
      .attr('r', 6)
      .attr('fill', (d, i) => colorScale(String(i)))
      .attr('fill-opacity', 0.7)
      .attr('cursor', 'pointer')
      .on('mouseover', (e, d) => {
        d3.select(e.currentTarget).attr('fill-opacity', 1).attr('r', 9);
        showTooltip(e, String(d[xAxis]), d[yAxis[0]], undefined, d);
      })
      .on('mousemove', moveTooltip)
      .on('mouseout', (e) => {
        d3.select(e.currentTarget).attr('fill-opacity', 0.7).attr('r', 6);
        hideTooltip();
      })
      .on('click', (e, d) => {
        if (onItemClick) onItemClick(d);
      });
  };

  renderPoints(x, y);

  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.5, 20])
    .on('zoom', (event) => {
      const newX = event.transform.rescaleX(x);
      const newY = event.transform.rescaleY(y);
      
      xAxisG.call(xAxisObj.scale(newX));
      yAxisG.call(yAxisObj.scale(newY));
        
      renderPoints(newX, newY);
    });

  if (svg) {
    svg.call(zoom as any);
  }
}
