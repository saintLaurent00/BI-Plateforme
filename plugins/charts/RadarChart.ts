import * as d3 from 'd3';
import { ChartPlugin, ChartPluginProps } from './types';

export const RadarChartPlugin: ChartPlugin = {
  type: 'Radar',
  name: 'Radar Chart',
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type }) => {
    const innerWidth = width;
    const innerHeight = height;
    const radius = Math.min(innerWidth, innerHeight) / 2;
    
    const radarG = g.append('g')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

    const angleSlice = (Math.PI * 2) / data.length;
    const rScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d[yAxis[0]])])
      .range([0, radius]);

    if (type === 'Radar') {
      const radarLine = d3.lineRadial<any>()
        .radius(d => rScale(d[yAxis[0]]))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);

      radarG.append('path')
        .datum(data)
        .attr('d', radarLine)
        .attr('fill', colorScale('0'))
        .attr('fill-opacity', 0.3)
        .attr('stroke', colorScale('0'))
        .attr('stroke-width', 2);

      radarG.selectAll('.radar-dot')
        .data(data)
        .enter().append('circle')
        .attr('class', 'radar-dot')
        .attr('cx', (d, i) => rScale(d[yAxis[0]]) * Math.cos(i * angleSlice - Math.PI / 2))
        .attr('cy', (d, i) => rScale(d[yAxis[0]]) * Math.sin(i * angleSlice - Math.PI / 2))
        .attr('r', 4)
        .attr('fill', 'white')
        .attr('stroke', colorScale('0'))
        .attr('stroke-width', 2)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else {
      radarG.selectAll('.polar-arc')
        .data(data)
        .enter().append('path')
        .attr('d', d3.arc<any>()
          .innerRadius(0)
          .outerRadius(d => rScale(d[yAxis[0]]))
          .startAngle((d, i) => i * angleSlice)
          .endAngle((d, i) => (i + 1) * angleSlice)
          .padAngle(0.02)
          .cornerRadius(4)
        )
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('fill-opacity', 0.7)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    }
  }
};
