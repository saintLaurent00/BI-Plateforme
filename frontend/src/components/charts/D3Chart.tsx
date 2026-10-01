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
  onItemClick?: (data: any) => void;
}

export const D3Chart: React.FC<D3ChartProps> = ({ data, type, xAxis, yAxis, config = {}, onItemClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Reset any zoom applied to the svg if needed, but d3 zoom usually manages it.
    // However, since we re-render everything, the old zoom behavior might still be attached to the svg element if we don't clear it.
    svg.on('.zoom', null); 

    const width = svgRef.current.clientWidth || 600;
    const height = svgRef.current.clientHeight || 400;
    const margin = { 
      top: config.margin?.top || 40, 
      right: config.margin?.right || (config.showLegend !== false ? 120 : 40), 
      bottom: config.margin?.bottom || 60, 
      left: config.margin?.left || 80 
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const colorSchemes: Record<string, readonly string[]> = {
      default: [
        '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', 
        '#06b6d4', '#f43f5e', '#3b82f6', '#fb923c', '#2dd4bf'
      ],
      vibrant: [
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
        '#00FFFF', '#FF8800', '#88FF00', '#0088FF', '#FF0088'
      ],
      pastel: [
        '#fecaca', '#bbf7d0', '#bfdbfe', '#fef08a', '#fbcfe8',
        '#a5f3fc', '#fed7aa', '#d9f99d', '#e9d5ff', '#cffafe'
      ],
      mono: [
        '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8',
        '#cbd5e1', '#e2e8f0', '#f1f5f9', '#f8fafc', '#0f172a'
      ]
    };
    
    const selectedScheme = config.colorScheme || 'default';
    const colorScale = d3.scaleOrdinal(colorSchemes[selectedScheme] || colorSchemes.default);

    // Helper for tooltips
    const tooltipId = 'prism-chart-tooltip';
    let tooltip = d3.select(`#${tooltipId}`);
    if (tooltip.empty()) {
      tooltip = d3.select('body').append('div')
        .attr('id', tooltipId)
        .attr('class', 'absolute hidden bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[24px] shadow-2xl border border-white/10 pointer-events-none z-[100] min-w-[160px]')
        .style('opacity', 0);
    }

    const showTooltip = (event: any, label: string, value: any, seriesName?: string, rawData?: any) => {
      tooltip.style('display', 'block')
        .transition().duration(200)
        .style('opacity', 1);
      
      let extraDataHtml = '';
      if (rawData) {
        const skipKeys = [xAxis, seriesName].filter(Boolean);
        const entries = Object.entries(rawData).filter(([k, v]) => !skipKeys.includes(k) && typeof v !== 'object');
        if (entries.length > 0) {
          extraDataHtml = `
            <div class="h-px bg-white/10 my-1.5"></div>
            <div class="space-y-1">
              ${entries.map(([k, v]) => `
                <div class="flex items-center justify-between gap-6">
                  <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">${k}</span>
                  <span class="text-[10px] text-white opacity-80 font-mono">${String(v)}</span>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

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
          ${extraDataHtml}
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
    
    // Override type if configured in editor (e.g. pie_type -> Donut, line_type -> Area)
    const effectiveType = config.pieType || config.lineType || config.barMode || type;

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
        onItemClick,
        type: effectiveType // Pass the specific type for variations like StepLine
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

    // Legend
    const showLegend = config.showLegend !== false;
    if (showLegend && Array.isArray(data) && data.length > 0) {
      // Very basic legend: try to use yAxis or xAxis categories depending on chart type
      // Line/Bar charts typically use yAxis metadata if multiple metrics, or group by series
      // For Pie/Donut, it typically uses xAxis categories
      const legendItems = ['Pie', 'Donut', 'Treemap', 'Sunburst'].includes(effectiveType)
        ? Array.from(new Set(data.map(d => String(d[xAxis]))))
        : yAxis;
        
      if (legendItems.length > 0) {
        const legendG = svg.append('g')
          .attr('transform', `translate(${width - margin.right + 10},${margin.top})`);
          
        const legendEntries = legendG.selectAll('.legend-entry')
          .data(legendItems)
          .enter()
          .append('g')
          .attr('class', 'legend-entry')
          .attr('transform', (d, i) => `translate(0, ${i * 20})`);
          
        legendEntries.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('rx', 2)
          .attr('fill', (d, i) => colorScale(['Pie', 'Donut', 'Treemap', 'Sunburst'].includes(effectiveType) ? String(i) : String(d)));
          
        legendEntries.append('text')
          .attr('x', 16)
          .attr('y', 9)
          .attr('class', 'text-[10px] fill-slate-500 font-medium')
          .text(d => String(d))
          // Truncate text if too long
          .each(function(d) {
            const self = d3.select(this);
            let textLength = self.node()?.getComputedTextLength() || 0;
            let text = self.text();
            while (textLength > margin.right - 20 && text.length > 0) {
              text = text.slice(0, -1);
              self.text(text + '...');
              textLength = self.node()?.getComputedTextLength() || 0;
            }
          });
      }
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
