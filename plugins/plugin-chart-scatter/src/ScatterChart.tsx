import { ChartPluginProps } from '../../types';

export default function ScatterChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis, type } = props;

  const metricX = xAxis;
  const metricY = yAxis[0];
  const isBubble = type === 'Bubble';
  const sizeMetric = yAxis[1] || metricY;

  const seriesData = data.map(d => [
    d[metricX],
    d[metricY],
    d[sizeMetric],
    d[xAxis] // Label
  ]);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 11
      },
      padding: [12, 16],
      borderRadius: 12,
      formatter: (params: any) => {
        const val = params.value;
        return `
          <div class="space-y-1">
            <div class="text-[10px] font-black uppercase tracking-widest text-slate-400">${params.seriesName || 'Point'}</div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-xs text-slate-300">${metricX}:</span>
              <span class="text-xs font-bold font-mono">${val[0]}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-xs text-slate-300">${metricY}:</span>
              <span class="text-xs font-bold font-mono">${val[1]}</span>
            </div>
            ${isBubble ? `
            <div class="flex items-center justify-between gap-4">
              <span class="text-xs text-slate-300">${sizeMetric}:</span>
              <span class="text-xs font-bold font-mono">${val[2]}</span>
            </div>
            ` : ''}
          </div>
        `;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: metricX,
      nameLocation: 'middle',
      nameGap: 25,
      nameTextStyle: {
        color: '#64748b',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.05)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10
      }
    },
    yAxis: {
      type: 'value',
      name: metricY,
      nameTextStyle: {
          color: '#64748b',
          fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.05)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10
      }
    },
    series: [
      {
        name: 'Data Points',
        type: 'scatter',
        data: seriesData,
        symbolSize: (data: any) => {
          if (!isBubble) return 10;
          return Math.sqrt(data[2]) * 2; // Simple scaling for bubble
        },
        itemStyle: {
          color: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            color: 'rgba(99, 102, 241, 0.9)',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        animationDuration: 1500
      }
    ]
  };
}
