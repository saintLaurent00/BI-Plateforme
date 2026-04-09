import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { ChartType } from './D3Chart';

// Import modules
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsTreemap from 'highcharts/modules/treemap';
import HighchartsSankey from 'highcharts/modules/sankey';
import HighchartsFunnel from 'highcharts/modules/funnel';
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import HighchartsBullet from 'highcharts/modules/bullet';
import HighchartsStreamgraph from 'highcharts/modules/streamgraph';
import HighchartsSunburst from 'highcharts/modules/sunburst';
import HighchartsParallelCoordinates from 'highcharts/modules/parallel-coordinates';
import HighchartsVariablePie from 'highcharts/modules/variable-pie';

// Initialize modules
const initModule = (mod: any) => {
  if (typeof mod === 'function') {
    mod(Highcharts);
  } else if (mod && typeof mod.default === 'function') {
    mod.default(Highcharts);
  }
};

if (typeof Highcharts === 'object') {
  initModule(HighchartsMore);
  initModule(HighchartsExporting);
  initModule(HighchartsHeatmap);
  initModule(HighchartsTreemap);
  initModule(HighchartsSankey);
  initModule(HighchartsFunnel);
  initModule(HighchartsSolidGauge);
  initModule(HighchartsBullet);
  initModule(HighchartsStreamgraph);
  initModule(HighchartsSunburst);
  initModule(HighchartsParallelCoordinates);
  initModule(HighchartsVariablePie);
}

interface HighchartsChartProps {
  data: any[];
  type: ChartType;
  xAxis: string;
  yAxis: string[];
  config?: any;
}

export const HighchartsChart: React.FC<HighchartsChartProps> = ({ data, type, xAxis, yAxis, config = {} }) => {
  const getOptions = (): Highcharts.Options => {
    const series = yAxis.map((col, i) => ({
      name: col,
      data: data.map(d => d[col]),
      type: getHighchartsType(type) as any
    }));

    const categories = data.map(d => String(d[xAxis]));

    const baseOptions: Highcharts.Options = {
      chart: {
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Inter, sans-serif'
        },
        polar: type === 'Radar' || type === 'PolarArea'
      },
      title: { text: undefined },
      xAxis: {
        categories,
        labels: {
          style: { color: '#64748b', fontSize: '10px', fontWeight: 'bold' }
        },
        lineColor: '#e2e8f0',
        gridLineColor: type === 'Radar' ? '#f1f5f9' : 'transparent'
      },
      yAxis: {
        title: { text: undefined },
        labels: {
          style: { color: '#64748b', fontSize: '10px', fontWeight: 'bold' }
        },
        gridLineColor: '#f1f5f9'
      },
      legend: {
        itemStyle: { color: '#475569', fontSize: '11px', fontWeight: 'bold' }
      },
      plotOptions: {
        series: {
          animation: { duration: 1000 },
          borderRadius: 4
        },
        column: {
          stacking: type.includes('Stacked') ? (type.includes('Percent') ? 'percent' : 'normal') : undefined
        },
        area: {
          stacking: type.includes('Stacked') ? (type.includes('Percent') ? 'percent' : 'normal') : undefined
        },
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: { fontSize: '10px' }
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderWidth: 0,
        borderRadius: 12,
        style: { color: '#fff' },
        useHTML: true,
        headerFormat: '<div style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px;">{point.key}</div>',
        pointFormat: '<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">' +
                     '<span style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">{series.name}</span>' +
                     '<span style="font-size: 12px; font-weight: bold; color: #fff;">{point.y}</span>' +
                     '</div>'
      },
      credits: { enabled: false },
      series: series as any,
      ...config
    };

    // Handle specific types
    if (type === 'Pie' || type === 'Donut' || type === 'Rose') {
      baseOptions.series = [{
        name: yAxis[0],
        type: type === 'Rose' ? 'variablepie' : 'pie',
        innerSize: type === 'Donut' ? '60%' : '0%',
        data: data.map(d => ({
          name: String(d[xAxis]),
          y: d[yAxis[0]],
          z: type === 'Rose' ? (d[yAxis[1] || yAxis[0]]) : undefined
        }))
      }] as any;
      delete baseOptions.xAxis;
    }

    if (type === 'HorizontalBar' || type === 'StackedHorizontalBar' || type === 'GroupedHorizontalBar' || type === 'WaterfallHorizontal') {
      baseOptions.chart!.type = 'bar';
    }

    if (type === 'Heatmap') {
      baseOptions.series = [{
        type: 'heatmap',
        data: data.flatMap((d, i) => yAxis.map((col, j) => [i, j, d[col]])),
        dataLabels: { enabled: true }
      }] as any;
      baseOptions.yAxis = {
        categories: yAxis,
        title: { text: undefined }
      };
    }

    if (type === 'Treemap') {
      baseOptions.series = [{
        type: 'treemap',
        layoutAlgorithm: 'squarified',
        data: data.map(d => ({
          name: String(d[xAxis]),
          value: d[yAxis[0]],
          colorValue: d[yAxis[0]]
        }))
      }] as any;
    }

    if (type === 'Sunburst') {
      baseOptions.series = [{
        type: 'sunburst',
        data: data.map(d => ({
          name: String(d[xAxis]),
          value: d[yAxis[0]]
        }))
      }] as any;
    }

    return baseOptions;
  };

  const getHighchartsType = (type: ChartType): string => {
    switch (type) {
      case 'Line': return 'line';
      case 'Bar':
      case 'StackedBar':
      case 'GroupedBar': return 'column';
      case 'HorizontalBar':
      case 'StackedHorizontalBar': return 'bar';
      case 'Area':
      case 'StackedArea': return 'area';
      case 'Pie':
      case 'Donut': return 'pie';
      case 'Scatter': return 'scatter';
      case 'Bubble': return 'bubble';
      case 'Heatmap': return 'heatmap';
      case 'Treemap': return 'treemap';
      case 'Funnel': return 'funnel';
      case 'Gauge': return 'solidgauge';
      case 'Bullet': return 'bullet';
      case 'Streamgraph': return 'streamgraph';
      case 'Sunburst': return 'sunburst';
      case 'Radar': return 'line'; // Needs polar: true
      default: return 'line';
    }
  };

  return (
    <div className="w-full h-full">
      <HighchartsReact
        highcharts={Highcharts}
        options={getOptions()}
      />
    </div>
  );
};
