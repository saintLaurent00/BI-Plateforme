import * as d3 from 'd3';
import { ChartPlugin } from '../../types';

export const RadarChartPlugin: ChartPlugin = {
  type: 'Radar',
  metadata: {
    name: 'Radar Chart',
    description: 'A spider chart for multivariate data comparison.',
    category: 'Ranking',
    thumbnail: 'https://raw.githubusercontent.com/apache/superset/master/superset-frontend/plugins/plugin-chart-echarts/src/Radar/images/thumbnail.png',
  },
  render: (g, { data, xAxis, yAxis, width, height, colorScale, showTooltip, moveTooltip, hideTooltip, type }) => {
    const radius = Math.min(width, height) / 2;
    const radarG = g.append('g').attr('transform', `translate(${width / 2},${height / 2})`);
    const angleSlice = (Math.PI * 2) / data.length;
    const rScale = d3.scaleLinear().domain([0, d3.max(data, d => d[yAxis[0]])]).range([0, radius]);

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
  }
};
