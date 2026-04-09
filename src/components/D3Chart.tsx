import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export type ChartType = 
  | 'Line' | 'Bar' | 'Pie' | 'Area' | 'Scatter' | 'Bubble' 
  | 'Radar' | 'Funnel' | 'Waterfall' | 'Heatmap' | 'Donut' 
  | 'StackedBar' | 'GroupedBar' | 'StepLine' | 'SmoothLine'
  | 'HorizontalBar' | 'StackedHorizontalBar' | 'GroupedHorizontalBar'
  | 'StackedArea' | 'Streamgraph' | 'Treemap' | 'Sunburst'
  | 'CirclePacking' | 'Sankey' | 'Chord' | 'BoxPlot' | 'ViolinPlot'
  | 'Candlestick' | 'Gauge' | 'Bullet' | 'Sparkline' | 'ParallelCoordinates'
  | 'Marimekko' | 'Tree' | 'Dendrogram' | 'Voronoi' | 'Hexbin'
  | 'Contour' | 'Horizon' | 'Slope' | 'Dumbbell' | 'Lollipop'
  | 'DotPlot' | 'Rose' | 'PolarArea' | 'Pyramid' | 'Calendar'
  | 'MultiLine' | 'PercentStackedBar' | 'PercentStackedArea'
  | 'WaterfallHorizontal' | 'BulletVertical'
  | 'Table' | 'PivotTable';

interface D3ChartProps {
  data: any[];
  type: ChartType;
  xAxis: string;
  yAxis: string[];
  config?: any;
}

export const D3Chart: React.FC<D3ChartProps> = ({ data, type, xAxis, yAxis, config = {} }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 600;
    const height = svgRef.current.clientHeight || 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorScale = d3.scaleOrdinal([
      '#6366f1', // Indigo
      '#ec4899', // Pink
      '#f59e0b', // Amber
      '#10b981', // Emerald
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#f43f5e', // Rose
      '#3b82f6', // Blue
      '#fb923c', // Orange
      '#2dd4bf'  // Teal
    ]);

    // Helper for tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'absolute hidden bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[24px] shadow-2xl border border-white/10 pointer-events-none z-50 min-w-[160px]')
      .style('opacity', 0);

    const showTooltip = (event: any, label: string, value: any, seriesName?: string) => {
      tooltip.style('display', 'block')
        .transition().duration(200)
        .style('opacity', 1);
      
      tooltip.html(`
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-6">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">${xAxis}</span>
            <span class="text-[10px] font-bold text-white tracking-tight">${label}</span>
          </div>
          ${seriesName ? `
            <div class="flex items-center justify-between gap-6">
              <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Series</span>
              <span class="text-[10px] font-bold text-accent tracking-tight">${seriesName}</span>
            </div>
          ` : ''}
          <div class="h-px bg-white/10 my-1.5"></div>
          <div class="flex items-center justify-between gap-6">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Value</span>
            <span class="text-base font-black text-white tracking-tighter">${typeof value === 'number' ? value.toLocaleString() : value}</span>
          </div>
          <div class="flex items-center gap-1.5 mt-2">
            <div class="w-1 h-1 rounded-full bg-accent animate-pulse"></div>
            <span class="text-[8px] text-slate-400 font-serif italic">Live Intelligence</span>
          </div>
        </div>
      `)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 15) + 'px');
    };

    const moveTooltip = (event: any) => {
      tooltip
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 15) + 'px');
    };

    const hideTooltip = () => {
      tooltip.transition().duration(300).style('opacity', 0).on('end', () => tooltip.style('display', 'none'));
    };

    if (type === 'Bar' || type === 'StackedBar' || type === 'GroupedBar') {
      const x = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([0, innerWidth])
        .padding(0.2);

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

      if (type === 'Bar') {
        yAxis.forEach((col, i) => {
          g.selectAll(`.bar-${i}`)
            .data(data)
            .enter().append('rect')
            .attr('class', `bar-${i}`)
            .attr('x', d => (x(String(d[xAxis])) || 0) + (x.bandwidth() / yAxis.length) * i)
            .attr('y', d => y(d[col]))
            .attr('width', x.bandwidth() / yAxis.length)
            .attr('height', d => innerHeight - y(d[col]))
            .attr('fill', colorScale(col))
            .attr('rx', 4)
            .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[col], col))
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip);
        });
      } else if (type === 'StackedBar') {
        const stack = d3.stack().keys(yAxis)(data);
        const layers = g.selectAll('.layer')
          .data(stack)
          .enter().append('g')
          .attr('class', 'layer')
          .attr('fill', d => colorScale(d.key));

        layers.selectAll('rect')
          .data(d => d)
          .enter().append('rect')
          .attr('x', d => x(String(d.data[xAxis])) || 0)
          .attr('y', d => y(d[1]))
          .attr('height', d => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth())
          .on('mouseover', function(e, d) {
            const seriesName = d3.select(this.parentNode as any).datum() as any;
            showTooltip(e, String(d.data[xAxis]), d[1] - d[0], seriesName.key);
          })
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      } else if (type === 'GroupedBar') {
        const x1 = d3.scaleBand()
          .domain(yAxis)
          .range([0, x.bandwidth()])
          .padding(0.05);

        g.selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', 'group')
          .attr('transform', d => `translate(${x(String(d[xAxis]))},0)`)
          .selectAll('rect')
          .data(d => yAxis.map(key => ({ key, value: d[key], label: d[xAxis] })))
          .enter().append('rect')
          .attr('x', d => x1(d.key) || 0)
          .attr('y', d => y(d.value))
          .attr('width', x1.bandwidth())
          .attr('height', d => innerHeight - y(d.value))
          .attr('fill', d => colorScale(d.key))
          .attr('rx', 2)
          .on('mouseover', (e, d) => showTooltip(e, String(d.label), d.value, d.key))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      }
    } else if (type === 'HorizontalBar' || type === 'StackedHorizontalBar' || type === 'GroupedHorizontalBar') {
      const y = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([0, innerHeight])
        .padding(0.2);

      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
        .nice()
        .range([0, innerWidth]);

      g.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '10px')
        .style('fill', '#64748b');

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('fill', '#64748b');

      if (type === 'HorizontalBar') {
        yAxis.forEach((col, i) => {
          g.selectAll(`.bar-${i}`)
            .data(data)
            .enter().append('rect')
            .attr('class', `bar-${i}`)
            .attr('y', d => (y(String(d[xAxis])) || 0) + (y.bandwidth() / yAxis.length) * i)
            .attr('x', 0)
            .attr('height', y.bandwidth() / yAxis.length)
            .attr('width', d => x(d[col]))
            .attr('fill', colorScale(col))
            .attr('rx', 4)
            .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[col], col))
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip);
        });
      } else if (type === 'StackedHorizontalBar') {
        const stack = d3.stack().keys(yAxis)(data);
        const layers = g.selectAll('.layer')
          .data(stack)
          .enter().append('g')
          .attr('class', 'layer')
          .attr('fill', d => colorScale(d.key));

        layers.selectAll('rect')
          .data(d => d)
          .enter().append('rect')
          .attr('y', d => y(String(d.data[xAxis])) || 0)
          .attr('x', d => x(d[0]))
          .attr('width', d => x(d[1]) - x(d[0]))
          .attr('height', y.bandwidth())
          .on('mouseover', function(e, d) {
            const seriesName = d3.select(this.parentNode as any).datum() as any;
            showTooltip(e, String(d.data[xAxis]), d[1] - d[0], seriesName.key);
          })
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      } else if (type === 'GroupedHorizontalBar') {
        const y1 = d3.scaleBand()
          .domain(yAxis)
          .range([0, y.bandwidth()])
          .padding(0.05);

        g.selectAll('.group')
          .data(data)
          .enter().append('g')
          .attr('class', 'group')
          .attr('transform', d => `translate(0,${y(String(d[xAxis]))})`)
          .selectAll('rect')
          .data(d => yAxis.map(key => ({ key, value: d[key], label: d[xAxis] })))
          .enter().append('rect')
          .attr('y', d => y1(d.key) || 0)
          .attr('x', 0)
          .attr('height', y1.bandwidth())
          .attr('width', d => x(d.value))
          .attr('fill', d => colorScale(d.key))
          .attr('rx', 2)
          .on('mouseover', (e, d) => showTooltip(e, String(d.label), d.value, d.key))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      }
    } else if (type === 'Line' || type === 'StepLine' || type === 'SmoothLine' || type === 'Area' || type === 'StackedArea') {
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

        if (type === 'Area' || type === 'StackedArea') {
          if (type === 'Area') {
            const area = d3.area<any>()
              .x(d => x(String(d[xAxis])) || 0)
              .y0(innerHeight)
              .y1(d => y(d[col]))
              .curve(curve);

            g.append('path')
              .datum(data)
              .attr('fill', colorScale(col))
              .attr('fill-opacity', 0.2)
              .attr('d', area);
          } else if (type === 'StackedArea' && i === 0) {
            // StackedArea logic only once
            const stack = d3.stack().keys(yAxis)(data);
            const layers = g.selectAll('.layer')
              .data(stack)
              .enter().append('g')
              .attr('class', 'layer');

            const area = d3.area<any>()
              .x(d => x(String(d.data[xAxis])) || 0)
              .y0(d => y(d[0]))
              .y1(d => y(d[1]))
              .curve(curve);

            layers.append('path')
              .attr('fill', d => colorScale(d.key))
              .attr('fill-opacity', 0.4)
              .attr('d', area);
            
            // Add dots for tooltips in stacked area
            layers.each(function(layerData) {
              const seriesName = layerData.key;
              d3.select(this).selectAll('.dot')
                .data(layerData)
                .enter().append('circle')
                .attr('cx', d => x(String(d.data[xAxis])) || 0)
                .attr('cy', d => y(d[1]))
                .attr('r', 4)
                .attr('fill', 'white')
                .attr('stroke', colorScale(seriesName))
                .attr('stroke-width', 2)
                .attr('opacity', 0)
                .on('mouseover', function(e, d) {
                  d3.select(this).attr('opacity', 1);
                  showTooltip(e, String(d.data[xAxis]), d[1] - d[0], seriesName);
                })
                .on('mousemove', moveTooltip)
                .on('mouseout', function() {
                  d3.select(this).attr('opacity', 0);
                  hideTooltip();
                });
            });
          }
        }

        if (type !== 'StackedArea') {
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
        }
      });
    } else if (type === 'Pie' || type === 'Donut' || type === 'Rose') {
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const pieG = g.append('g')
        .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

      const pie = d3.pie<any>()
        .value(d => d[yAxis[0]])
        .sort(null);

      const arc = d3.arc<any>()
        .innerRadius(type === 'Donut' ? radius * 0.6 : 0)
        .outerRadius(d => type === 'Rose' ? radius * (d.data[yAxis[0]] / d3.max(data, d => d[yAxis[0]])) : radius)
        .cornerRadius(8)
        .padAngle(0.02);

      const arcs = pieG.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
        .attr('class', 'arc');

      arcs.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colorScale(String(i)))
        .on('mouseover', (e, d) => showTooltip(e, String(d.data[xAxis]), d.data[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
      
      if (data.length < 10) {
        arcs.append('text')
          .attr('transform', d => `translate(${arc.centroid(d)})`)
          .attr('dy', '.35em')
          .style('text-anchor', 'middle')
          .style('font-size', '10px')
          .style('fill', 'white')
          .style('font-weight', 'bold')
          .text(d => d.data[xAxis]);
      }
    } else if (type === 'Scatter' || type === 'Bubble') {
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[xAxis] as number) || 0])
        .nice()
        .range([0, innerWidth]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yAxis[0]] as number) || 0])
        .nice()
        .range([innerHeight, 0]);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

      g.append('g')
        .call(d3.axisLeft(y));

      g.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => x(d[xAxis]))
        .attr('cy', d => y(d[yAxis[0]]))
        .attr('r', d => type === 'Bubble' ? (d[yAxis[1]] || 10) / 2 : 6)
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('fill-opacity', 0.7)
        .attr('stroke', (d, i) => colorScale(String(i)))
        .attr('stroke-width', 1)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'Radar' || type === 'PolarArea') {
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const radarG = g.append('g')
        .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

      const angleSlice = (Math.PI * 2) / data.length;
      const rScale = d3.scaleLinear().domain([0, d3.max(data, d => d[yAxis[0]])]).range([0, radius]);

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
    } else if (type === 'Treemap' || type === 'CirclePacking') {
      const root = d3.hierarchy({ children: data })
        .sum(d => d[yAxis[0]])
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      if (type === 'Treemap') {
        d3.treemap<any>().size([innerWidth, innerHeight]).padding(2)(root);
        const leaf = g.selectAll('g')
          .data(root.leaves() as d3.HierarchyRectangularNode<any>[])
          .enter().append('g')
          .attr('transform', d => `translate(${d.x0},${d.y0})`);

        leaf.append('rect')
          .attr('width', d => d.x1 - d.x0)
          .attr('height', d => d.y1 - d.y0)
          .attr('fill', (d, i) => colorScale(String(i)))
          .attr('rx', 4)
          .on('mouseover', (e, d) => showTooltip(e, String((d.data as any)[xAxis]), (d.data as any)[yAxis[0]]))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);

        leaf.append('text')
          .attr('x', 5)
          .attr('y', 15)
          .text(d => (d.data as any)[xAxis])
          .style('font-size', '10px')
          .style('fill', 'white')
          .style('font-weight', 'bold');
      } else {
        d3.pack<any>().size([innerWidth, innerHeight]).padding(3)(root);
        const leaf = g.selectAll('g')
          .data(root.leaves() as d3.HierarchyCircularNode<any>[])
          .enter().append('g')
          .attr('transform', d => `translate(${d.x},${d.y})`);

        leaf.append('circle')
          .attr('r', d => d.r)
          .attr('fill', (d, i) => colorScale(String(i)))
          .attr('fill-opacity', 0.7)
          .on('mouseover', (e, d) => showTooltip(e, String((d.data as any)[xAxis]), (d.data as any)[yAxis[0]]))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);

        leaf.append('text')
          .attr('dy', '.35em')
          .style('text-anchor', 'middle')
          .text(d => d.r > 20 ? (d.data as any)[xAxis] : '')
          .style('font-size', '10px')
          .style('fill', 'white');
      }
    } else if (type === 'Gauge') {
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const gaugeG = g.append('g')
        .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

      const arc = d3.arc<any>()
        .innerRadius(radius * 0.7)
        .outerRadius(radius)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2)
        .cornerRadius(10);

      gaugeG.append('path')
        .attr('d', arc)
        .attr('fill', '#e2e8f0');

      const val = data[0][yAxis[0]];
      const max = 100; // Assume 100 for gauge
      const angle = (val / max) * Math.PI - Math.PI / 2;

      const valArc = d3.arc<any>()
        .innerRadius(radius * 0.7)
        .outerRadius(radius)
        .startAngle(-Math.PI / 2)
        .endAngle(angle)
        .cornerRadius(10);

      gaugeG.append('path')
        .attr('d', valArc)
        .attr('fill', colorScale('0'))
        .on('mouseover', (e) => showTooltip(e, String(data[0][xAxis]), data[0][yAxis[0]], yAxis[0]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);

      gaugeG.append('text')
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '32px')
        .style('font-weight', 'bold')
        .style('fill', '#1e293b')
        .text(`${val}%`);
    } else if (type === 'Lollipop' || type === 'DotPlot') {
      const x = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([0, innerWidth])
        .padding(1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yAxis[0]])])
        .range([innerHeight, 0]);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

      g.append('g').call(d3.axisLeft(y));

      g.selectAll('.line')
        .data(data)
        .enter().append('line')
        .attr('x1', d => x(String(d[xAxis])) || 0)
        .attr('x2', d => x(String(d[xAxis])) || 0)
        .attr('y1', innerHeight)
        .attr('y2', d => y(d[yAxis[0]]))
        .attr('stroke', '#cbd5e1')
        .attr('stroke-width', 2);

      g.selectAll('.dot')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => x(String(d[xAxis])) || 0)
        .attr('cy', d => y(d[yAxis[0]]))
        .attr('r', 8)
        .attr('fill', colorScale('0'))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'Heatmap') {
      const x = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([0, innerWidth])
        .padding(0.05);

      const y = d3.scaleBand()
        .domain(yAxis)
        .range([innerHeight, 0])
        .padding(0.05);

      const color = d3.scaleSequential(d3.interpolateYlGnBu)
        .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 100]);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      g.append('g').call(d3.axisLeft(y));

      data.forEach(d => {
        yAxis.forEach(col => {
          g.append('rect')
            .attr('x', x(String(d[xAxis])) || 0)
            .attr('y', y(col) || 0)
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .attr('fill', color(d[col]))
            .attr('rx', 2)
            .on('mouseover', (e) => showTooltip(e, String(d[xAxis]), d[col], col))
            .on('mousemove', moveTooltip)
            .on('mouseout', hideTooltip);
        });
      });
    } else if (type === 'Funnel') {
      const funnelData = [...data].sort((a, b) => b[yAxis[0]] - a[yAxis[0]]);
      const x = d3.scaleLinear()
        .domain([0, d3.max(funnelData, d => d[yAxis[0]]) || 0])
        .range([0, innerWidth / 2]);

      const y = d3.scaleBand()
        .domain(funnelData.map(d => String(d[xAxis])))
        .range([0, innerHeight])
        .padding(0.1);

      const funnelG = g.selectAll('.funnel-step')
        .data(funnelData)
        .enter().append('g')
        .attr('class', 'funnel-step');

      funnelG.append('path')
        .attr('d', (d, i) => {
          const next = funnelData[i + 1];
          const x0 = innerWidth / 2 - x(d[yAxis[0]]);
          const x1 = innerWidth / 2 + x(d[yAxis[0]]);
          const y0 = y(String(d[xAxis])) || 0;
          const y1 = y0 + y.bandwidth();
          
          if (next) {
            const nx0 = innerWidth / 2 - x(next[yAxis[0]]);
            const nx1 = innerWidth / 2 + x(next[yAxis[0]]);
            return `M${x0},${y0} L${x1},${y0} L${nx1},${y1} L${nx0},${y1} Z`;
          } else {
            return `M${x0},${y0} L${x1},${y0} L${innerWidth / 2 + 10},${y1} L${innerWidth / 2 - 10},${y1} Z`;
          }
        })
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('fill-opacity', 0.8)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);

      funnelG.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', d => (y(String(d[xAxis])) || 0) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('fill', 'white')
        .style('font-weight', 'bold')
        .style('font-size', '12px')
        .text(d => d[xAxis]);
    } else if (type === 'Waterfall' || type === 'WaterfallHorizontal') {
      let cumulative = 0;
      const waterfallData = data.map(d => {
        const start = cumulative;
        cumulative += d[yAxis[0]];
        return { ...d, start, end: cumulative };
      });

      if (type === 'Waterfall') {
        const x = d3.scaleBand()
          .domain(waterfallData.map(d => String(d[xAxis])))
          .range([0, innerWidth])
          .padding(0.2);

        const y = d3.scaleLinear()
          .domain([0, d3.max(waterfallData, d => Math.max(d.start, d.end)) || 0])
          .nice()
          .range([innerHeight, 0]);

        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x));

        g.append('g').call(d3.axisLeft(y));

        g.selectAll('.bar')
          .data(waterfallData)
          .enter().append('rect')
          .attr('x', d => x(String(d[xAxis])) || 0)
          .attr('y', d => y(Math.max(d.start, d.end)))
          .attr('width', x.bandwidth())
          .attr('height', d => Math.abs(y(d.start) - y(d.end)))
          .attr('fill', d => d[yAxis[0]] >= 0 ? '#10b981' : '#ef4444')
          .attr('rx', 4)
          .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      } else {
        const y = d3.scaleBand()
          .domain(waterfallData.map(d => String(d[xAxis])))
          .range([0, innerHeight])
          .padding(0.2);

        const x = d3.scaleLinear()
          .domain([0, d3.max(waterfallData, d => Math.max(d.start, d.end)) || 0])
          .nice()
          .range([0, innerWidth]);

        g.append('g').call(d3.axisLeft(y));
        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(x));

        g.selectAll('.bar')
          .data(waterfallData)
          .enter().append('rect')
          .attr('y', d => y(String(d[xAxis])) || 0)
          .attr('x', d => x(Math.min(d.start, d.end)))
          .attr('height', y.bandwidth())
          .attr('width', d => Math.abs(x(d.start) - x(d.end)))
          .attr('fill', d => d[yAxis[0]] >= 0 ? '#10b981' : '#ef4444')
          .attr('rx', 4)
          .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      }
    } else if (type === 'Pyramid') {
      const halfWidth = innerWidth / 2;
      const y = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([innerHeight, 0])
        .padding(0.1);

      const xLeft = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yAxis[0]]) || 0])
        .range([0, halfWidth - 20]);

      const xRight = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yAxis[1] || yAxis[0]]) || 0])
        .range([0, halfWidth - 20]);

      g.append('g')
        .attr('transform', `translate(${halfWidth},0)`)
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
        .selectAll('text')
        .style('text-anchor', 'middle');

      g.selectAll('.bar-left')
        .data(data)
        .enter().append('rect')
        .attr('x', d => halfWidth - 20 - xLeft(d[yAxis[0]]))
        .attr('y', d => y(String(d[xAxis])) || 0)
        .attr('width', d => xLeft(d[yAxis[0]]))
        .attr('height', y.bandwidth())
        .attr('fill', colorScale('0'))
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]], yAxis[0]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);

      g.selectAll('.bar-right')
        .data(data)
        .enter().append('rect')
        .attr('x', halfWidth + 20)
        .attr('y', d => y(String(d[xAxis])) || 0)
        .attr('width', d => xRight(d[yAxis[1] || yAxis[0]]))
        .attr('height', y.bandwidth())
        .attr('fill', colorScale('1'))
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[1] || yAxis[0]], yAxis[1] || yAxis[0]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'Sunburst') {
      const radius = Math.min(innerWidth, innerHeight) / 2;
      const root = d3.hierarchy({ children: data })
        .sum(d => d[yAxis[0]])
        .sort((a, b) => (b.value || 0) - (a.value || 0));

      d3.partition<any>().size([2 * Math.PI, radius])(root);

      const arc = d3.arc<any>()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1);

      const sunburstG = g.append('g')
        .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

      sunburstG.selectAll('path')
        .data(root.descendants())
        .enter().append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('stroke', 'white')
        .attr('fill-opacity', 0.8)
        .on('mouseover', (e, d) => showTooltip(e, String((d.data as any)[xAxis] || 'Root'), d.value))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'BoxPlot' || type === 'ViolinPlot') {
      const x = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([0, innerWidth])
        .padding(0.5);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d3.max(yAxis, col => d[col] as number)) || 0])
        .nice()
        .range([innerHeight, 0]);

      g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

      g.append('g').call(d3.axisLeft(y));

      data.forEach(d => {
        const values = yAxis.map(col => d[col]).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25) || 0;
        const median = d3.quantile(values, 0.5) || 0;
        const q3 = d3.quantile(values, 0.75) || 0;
        const min = values[0];
        const max = values[values.length - 1];
        const center = (x(String(d[xAxis])) || 0) + x.bandwidth() / 2;

        if (type === 'BoxPlot') {
          g.append('line')
            .attr('x1', center)
            .attr('x2', center)
            .attr('y1', y(min))
            .attr('y2', y(max))
            .attr('stroke', '#64748b');

          g.append('rect')
            .attr('x', x(String(d[xAxis])) || 0)
            .attr('y', y(q3))
            .attr('width', x.bandwidth())
            .attr('height', y(q1) - y(q3))
            .attr('fill', colorScale('0'))
            .attr('stroke', '#1e293b');

          g.append('line')
            .attr('x1', x(String(d[xAxis])) || 0)
            .attr('x2', (x(String(d[xAxis])) || 0) + x.bandwidth())
            .attr('y1', y(median))
            .attr('y2', y(median))
            .attr('stroke', 'white')
            .attr('stroke-width', 2);
        } else {
          // Simple Violin Plot approximation using a path
          const violinWidth = x.bandwidth();
          const stats = [
            { y: min, w: 0 },
            { y: q1, w: violinWidth * 0.8 },
            { y: median, w: violinWidth },
            { y: q3, w: violinWidth * 0.8 },
            { y: max, w: 0 }
          ];
          
          const area = d3.area<any>()
            .x0(d => center - d.w / 2)
            .x1(d => center + d.w / 2)
            .y(d => y(d.y))
            .curve(d3.curveCatmullRom);

          g.append('path')
            .datum(stats)
            .attr('d', area)
            .attr('fill', colorScale('0'))
            .attr('fill-opacity', 0.6)
            .attr('stroke', colorScale('0'));
        }
      });
    } else if (type === 'Sparkline') {
      const x = d3.scaleLinear().domain([0, yAxis.length - 1]).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d3.max(yAxis, col => d[col]))]).range([innerHeight, 0]);

      const line = d3.line<any>()
        .x((d, i) => x(i))
        .y(d => y(d));

      data.forEach((d, i) => {
        const values = yAxis.map(col => d[col]);
        g.append('path')
          .datum(values)
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', colorScale(String(i)))
          .attr('stroke-width', 2);
      });
    } else if (type === 'Candlestick') {
      const x = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([0, innerWidth])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([
          d3.min(data, d => Math.min(d.open || 0, d.close || 0, d.low || 0, d.high || 0)) || 0,
          d3.max(data, d => Math.max(d.open || 0, d.close || 0, d.low || 0, d.high || 0)) || 100
        ])
        .nice()
        .range([innerHeight, 0]);

      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
      g.append('g').call(d3.axisLeft(y));

      data.forEach(d => {
        const isUp = (d.close || 0) >= (d.open || 0);
        const center = (x(String(d[xAxis])) || 0) + x.bandwidth() / 2;

        g.append('line')
          .attr('x1', center)
          .attr('x2', center)
          .attr('y1', y(d.low || 0))
          .attr('y2', y(d.high || 0))
          .attr('stroke', isUp ? '#10b981' : '#ef4444');

        g.append('rect')
          .attr('x', x(String(d[xAxis])) || 0)
          .attr('y', y(Math.max(d.open || 0, d.close || 0)))
          .attr('width', x.bandwidth())
          .attr('height', Math.abs(y(d.open || 0) - y(d.close || 0)))
          .attr('fill', isUp ? '#10b981' : '#ef4444')
          .on('mouseover', (e) => showTooltip(e, String(d[xAxis]), `O:${d.open} C:${d.close} H:${d.high} L:${d.low}`))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      });
    } else if (type === 'Bullet' || type === 'BulletVertical') {
      const isVertical = type === 'BulletVertical';
      const scale = d3.scaleBand()
        .domain(data.map(d => String(d[xAxis])))
        .range([0, isVertical ? innerWidth : innerHeight])
        .padding(0.4);

      const valueScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => Math.max(d[yAxis[0]] || 0, d.target || 0)) || 100])
        .range([0, isVertical ? innerHeight : innerWidth]);

      data.forEach(d => {
        const pos = scale(String(d[xAxis])) || 0;
        const size = scale.bandwidth();
        const val = valueScale(d[yAxis[0]] || 0);
        const target = d.target ? valueScale(d.target) : null;

        if (!isVertical) {
          g.append('rect').attr('x', 0).attr('y', pos).attr('width', innerWidth).attr('height', size).attr('fill', '#f1f5f9');
          g.append('rect').attr('x', 0).attr('y', pos + size * 0.25).attr('width', val).attr('height', size * 0.5).attr('fill', '#1e293b');
          if (target !== null) {
            g.append('line').attr('x1', target).attr('x2', target).attr('y1', pos + size * 0.1).attr('y2', pos + size * 0.9).attr('stroke', '#ef4444').attr('stroke-width', 3);
          }
        } else {
          g.append('rect').attr('x', pos).attr('y', 0).attr('width', size).attr('height', innerHeight).attr('fill', '#f1f5f9');
          g.append('rect').attr('x', pos + size * 0.25).attr('y', innerHeight - val).attr('width', size * 0.5).attr('height', val).attr('fill', '#1e293b');
          if (target !== null) {
            g.append('line').attr('x1', pos + size * 0.1).attr('x2', pos + size * 0.9).attr('y1', innerHeight - target).attr('y2', innerHeight - target).attr('stroke', '#ef4444').attr('stroke-width', 3);
          }
        }
      });
    } else if (type === 'ParallelCoordinates') {
      const y = new Map(yAxis.map(col => [
        col, 
        d3.scaleLinear()
          .domain(d3.extent(data, d => d[col] as number) as [number, number])
          .range([innerHeight, 0])
      ]));

      const x = d3.scalePoint().domain(yAxis).range([0, innerWidth]);

      const line = d3.line<any>()
        .x((d, i) => x(yAxis[i]) || 0)
        .y((d, i) => y.get(yAxis[i])!(d) || 0);

      g.selectAll('.path')
        .data(data)
        .enter().append('path')
        .attr('d', d => line(yAxis.map(col => d[col])))
        .attr('fill', 'none')
        .attr('stroke', (d, i) => colorScale(String(i)))
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.5);

      yAxis.forEach(col => {
        g.append('g')
          .attr('transform', `translate(${x(col)},0)`)
          .call(d3.axisLeft(y.get(col)!))
          .append('text')
          .attr('y', -10)
          .style('text-anchor', 'middle')
          .style('fill', '#1e293b')
          .style('font-weight', 'bold')
          .text(col);
      });
    } else if (type === 'Marimekko') {
      const totalX = d3.sum(data, d => d[yAxis[1] || yAxis[0]] || 0);
      const x = d3.scaleLinear().domain([0, totalX]).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);

      let currentX = 0;
      data.forEach((d, i) => {
        const w = x(d[yAxis[1] || yAxis[0]] || 0);
        const h = d[yAxis[0]] || 0;
        
        g.append('rect')
          .attr('x', currentX)
          .attr('y', y(h))
          .attr('width', w)
          .attr('height', innerHeight - y(h))
          .attr('fill', colorScale(String(i)))
          .attr('stroke', 'white')
          .on('mouseover', (e) => showTooltip(e, String(d[xAxis]), h))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);

        currentX += w;
      });
    } else if (type === 'Streamgraph') {
      const stack = d3.stack().keys(yAxis).offset(d3.stackOffsetWiggle).order(d3.stackOrderNone)(data);
      const x = d3.scalePoint().domain(data.map(d => String(d[xAxis]))).range([0, innerWidth]);
      const y = d3.scaleLinear()
        .domain([
          d3.min(stack, layer => d3.min(layer, d => d[0])) || 0,
          d3.max(stack, layer => d3.max(layer, d => d[1])) || 100
        ])
        .range([innerHeight, 0]);

      const area = d3.area<any>()
        .x(d => x(String(d.data[xAxis])) || 0)
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis);

      g.selectAll('.layer')
        .data(stack)
        .enter().append('path')
        .attr('d', area)
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('fill-opacity', 0.8)
        .on('mouseover', (e, d) => showTooltip(e, 'Stream', d.key))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'Tree' || type === 'Dendrogram') {
      const root = d3.hierarchy({ children: data });
      const treeLayout = type === 'Tree' ? d3.tree().size([innerHeight, innerWidth - 100]) : d3.cluster().size([innerHeight, innerWidth - 100]);
      treeLayout(root);

      g.selectAll('.link')
        .data(root.links())
        .enter().append('path')
        .attr('d', d3.linkHorizontal<any, any>().x(d => d.y).y(d => d.x))
        .attr('fill', 'none')
        .attr('stroke', '#cbd5e1');

      const node = g.selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .attr('transform', d => `translate(${d.y},${d.x})`);

      node.append('circle').attr('r', 4).attr('fill', colorScale('0'));
      node.append('text').attr('x', 8).attr('dy', '0.35em').text(d => (d.data as any)[xAxis]).style('font-size', '10px');
    } else if (type === 'Voronoi') {
      const points: [number, number, number][] = data.map((_, i) => [Math.random() * innerWidth, Math.random() * innerHeight, i]);
      const delaunay = d3.Delaunay.from(points, d => d[0], d => d[1]);
      const voronoi = delaunay.voronoi([0, 0, innerWidth, innerHeight]);

      g.selectAll('path')
        .data(points)
        .enter().append('path')
        .attr('d', (d, i) => voronoi.renderCell(i))
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('fill-opacity', 0.6)
        .attr('stroke', 'white')
        .on('mouseover', (e, d) => showTooltip(e, String(data[d[2]][xAxis]), data[d[2]][yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'Hexbin') {
      // Hexbin usually requires d3-hexbin, but we can approximate with circles or a grid
      const x = d3.scaleLinear().domain([0, 100]).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, 100]).range([innerHeight, 0]);
      
      g.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => x(Math.random() * 100))
        .attr('cy', d => y(Math.random() * 100))
        .attr('r', 10)
        .attr('fill', (d, i) => colorScale(String(i)))
        .attr('fill-opacity', 0.6)
        .on('mouseover', (e, d) => showTooltip(e, String(d[xAxis]), d[yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'Slope') {
      const x = d3.scalePoint().domain(['Start', 'End']).range([0, innerWidth]).padding(0.5);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => Math.max(d[yAxis[0]] || 0, d[yAxis[1] || yAxis[0]] || 0)) || 100]).range([innerHeight, 0]);

      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
      g.append('g').call(d3.axisLeft(y));

      data.forEach((d, i) => {
        g.append('line')
          .attr('x1', x('Start') || 0)
          .attr('x2', x('End') || 0)
          .attr('y1', y(d[yAxis[0]] || 0))
          .attr('y2', y(d[yAxis[1] || yAxis[0]] || 0))
          .attr('stroke', colorScale(String(i)))
          .attr('stroke-width', 2)
          .on('mouseover', (e) => showTooltip(e, String(d[xAxis]), `${d[yAxis[0]]} -> ${d[yAxis[1] || yAxis[0]]}`))
          .on('mousemove', moveTooltip)
          .on('mouseout', hideTooltip);
      });
    } else if (type === 'Dumbbell') {
      const y = d3.scaleBand().domain(data.map(d => String(d[xAxis]))).range([0, innerHeight]).padding(0.5);
      const x = d3.scaleLinear().domain([0, d3.max(data, d => Math.max(d[yAxis[0]] || 0, d[yAxis[1] || yAxis[0]] || 0)) || 100]).range([0, innerWidth]);

      g.append('g').call(d3.axisLeft(y));
      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));

      data.forEach((d, i) => {
        const rowY = (y(String(d[xAxis])) || 0) + y.bandwidth() / 2;
        g.append('line')
          .attr('x1', x(d[yAxis[0]] || 0))
          .attr('x2', x(d[yAxis[1] || yAxis[0]] || 0))
          .attr('y1', rowY)
          .attr('y2', rowY)
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 2);

        g.append('circle').attr('cx', x(d[yAxis[0]] || 0)).attr('cy', rowY).attr('r', 6).attr('fill', colorScale('0'));
        g.append('circle').attr('cx', x(d[yAxis[1] || yAxis[0]] || 0)).attr('cy', rowY).attr('r', 6).attr('fill', colorScale('1'));
      });
    } else if (type === 'MultiLine') {
      const x = d3.scalePoint().domain(data.map(d => String(d[xAxis]))).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d3.max(yAxis, col => d[col]))]).range([innerHeight, 0]);

      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(x));
      g.append('g').call(d3.axisLeft(y));

      yAxis.forEach((col, i) => {
        const line = d3.line<any>().x(d => x(String(d[xAxis])) || 0).y(d => y(d[col]));
        g.append('path').datum(data).attr('d', line).attr('fill', 'none').attr('stroke', colorScale(String(i))).attr('stroke-width', 2);
      });
    } else if (type === 'PercentStackedBar' || type === 'PercentStackedArea') {
      const stack = d3.stack().keys(yAxis).offset(d3.stackOffsetExpand)(data);
      const x = d3.scaleBand().domain(data.map(d => String(d[xAxis]))).range([0, innerWidth]).padding(0.2);
      const y = d3.scaleLinear().range([innerHeight, 0]);

      if (type === 'PercentStackedBar') {
        g.selectAll('.layer')
          .data(stack)
          .enter().append('g')
          .attr('fill', (d, i) => colorScale(String(i)))
          .selectAll('rect')
          .data(d => d)
          .enter().append('rect')
          .attr('x', d => x(String(d.data[xAxis])) || 0)
          .attr('y', d => y(d[1]))
          .attr('height', d => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth());
      } else {
        const area = d3.area<any>().x(d => x(String(d.data[xAxis])) || 0).y0(d => y(d[0])).y1(d => y(d[1]));
        g.selectAll('.layer')
          .data(stack)
          .enter().append('path')
          .attr('d', area)
          .attr('fill', (d, i) => colorScale(String(i)))
          .attr('fill-opacity', 0.8);
      }
    } else if (type === 'Horizon') {
      const x = d3.scalePoint().domain(data.map(d => String(d[xAxis]))).range([0, innerWidth]);
      const y = d3.scaleLinear().domain([0, d3.max(data, d => d[yAxis[0]] || 0) || 100]).range([innerHeight / 3, 0]);

      const area = d3.area<any>().x(d => x(String(d[xAxis])) || 0).y0(innerHeight / 3).y1(d => y(d[yAxis[0]] || 0));

      [0, 1, 2].forEach(i => {
        g.append('path')
          .datum(data)
          .attr('d', area)
          .attr('fill', colorScale('0'))
          .attr('fill-opacity', 0.3)
          .attr('transform', `translate(0, ${i * (innerHeight / 3)})`);
      });
    } else if (type === 'Calendar') {
      const cellSize = Math.min(innerWidth / 53, innerHeight / 7);
      const calendarG = g.append('g').attr('transform', `translate(0, 20)`);
      
      const days = d3.range(Math.min(data.length, 365));
      calendarG.selectAll('rect')
        .data(days)
        .enter().append('rect')
        .attr('width', cellSize - 2)
        .attr('height', cellSize - 2)
        .attr('x', d => Math.floor(d / 7) * cellSize)
        .attr('y', d => (d % 7) * cellSize)
        .attr('fill', (d) => d3.interpolateGreens((data[d][yAxis[0]] || 0) / (d3.max(data, x => x[yAxis[0]]) || 1)))
        .attr('rx', 2)
        .on('mouseover', (e, d) => showTooltip(e, String(data[d][xAxis]), data[d][yAxis[0]]))
        .on('mousemove', moveTooltip)
        .on('mouseout', hideTooltip);
    } else if (type === 'Table' || type === 'PivotTable') {
      // For Table and PivotTable, we render a foreignObject containing a HTML table
      const foreignObject = g.append('foreignObject')
        .attr('width', innerWidth)
        .attr('height', innerHeight);

      const container = foreignObject.append('xhtml:div')
        .attr('class', 'w-full h-full overflow-auto custom-scrollbar bg-white rounded-xl border border-slate-100 shadow-sm');

      const table = container.append('xhtml:table')
        .attr('class', 'w-full text-left border-collapse');

      const headers = type === 'Table' ? [xAxis, ...yAxis] : [xAxis, ...yAxis];

      const th = table.append('xhtml:thead')
        .attr('class', 'sticky top-0 bg-slate-50 z-10')
        .append('xhtml:tr')
        .selectAll('th')
        .data(headers)
        .enter().append('xhtml:th')
        .attr('class', 'px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 relative group')
        .style('min-width', '100px')
        .text(d => d);

      // Add resize handle
      th.append('xhtml:div')
        .attr('class', 'absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-prism-400 transition-colors')
        .on('mousedown', function(event) {
          const startX = event.pageX;
          const thElement = (this as any).parentNode as HTMLElement;
          const startWidth = thElement.offsetWidth;

          const onMouseMove = (e: MouseEvent) => {
            const newWidth = startWidth + (e.pageX - startX);
            thElement.style.width = `${newWidth}px`;
            thElement.style.minWidth = `${newWidth}px`;
          };

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          };

          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });

      table.append('xhtml:tbody')
        .selectAll('tr')
        .data(data)
        .enter().append('xhtml:tr')
        .attr('class', 'hover:bg-slate-50 transition-colors')
        .selectAll('td')
        .data(d => headers.map(h => d[h]))
        .enter().append('xhtml:td')
        .attr('class', 'px-4 py-3 text-sm text-slate-600 border-b border-slate-50')
        .text(d => typeof d === 'number' ? d.toLocaleString() : String(d));
    } else {
      // Fallback for types not yet implemented with specific logic
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .style('text-anchor', 'middle')
        .style('fill', '#94a3b8')
        .style('font-size', '14px')
        .text(`[${type}] Chart Model - Coming Soon`);
    }

    return () => {
      tooltip.remove();
    };
  }, [data, type, xAxis, yAxis, config]);

  return (
    <div className="w-full h-full min-h-[300px]">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};
