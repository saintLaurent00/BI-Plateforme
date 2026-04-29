import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartType } from '../../../plugins/types';
import { getChartPlugin } from '../../../plugins';

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
    const tooltipId = 'prism-chart-tooltip';
    let tooltip = d3.select(`#${tooltipId}`);
    if (tooltip.empty()) {
      tooltip = d3.select('body').append('div')
        .attr('id', tooltipId)
        .attr('class', 'absolute hidden bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[24px] shadow-2xl border border-white/10 pointer-events-none z-[100] min-w-[160px]')
        .style('opacity', 0);
    }

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

    // Find and execute plugin
    const plugin = getChartPlugin(type);
    if (plugin) {
      plugin.render(g, {
        data,
        xAxis,
        yAxis,
        config,
        width: innerWidth,
        height: innerHeight,
        colorScale,
        showTooltip,
        moveTooltip,
        hideTooltip,
        type // Pass the specific type for variations like StepLine
      });
    } else {
      // Fallback for types not yet migrated
      g.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('class', 'text-xs font-bold text-muted-foreground')
        .text(`Le graphique "${type}" est en cours de migration vers le système de plugins.`);
    }

  }, [data, type, xAxis, yAxis, config]);

  return (
    <div className="w-full h-full min-h-[300px] relative">
      <svg 
        ref={svgRef} 
        className="w-full h-full overflow-visible"
        id={`chart-${type.toLowerCase()}`}
      />
    </div>
  );
};
