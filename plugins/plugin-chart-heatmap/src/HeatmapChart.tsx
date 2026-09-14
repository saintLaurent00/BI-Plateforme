import { ChartPluginProps } from '../../types';

export default function HeatmapChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  // For heatmap, we usually expect yAxis to be a list of columns to compare against xAxis
  // or a more complex [x, y, value] structure.
  // Assuming data structure: { [xAxis]: 'CategoryX', [yAxis[0]]: 10, [yAxis[1]]: 20 ... }
  
  const xCategories = data.map(d => String(d[xAxis]));
  const yCategories = yAxis;

  const seriesData: any[] = [];
  data.forEach((d, xIdx) => {
    yCategories.forEach((col, yIdx) => {
      seriesData.push([xIdx, yIdx, d[col]]);
    });
  });

  const maxVal = Math.max(...data.flatMap(d => yAxis.map(col => d[col]))) || 100;

  return {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
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
        return `
          <div class="space-y-1">
            <div class="flex items-center justify-between gap-4">
              <span class="text-xs text-slate-300">Category:</span>
              <span class="text-xs font-bold text-white">${xCategories[params.data[0]]}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-xs text-slate-300">Metric:</span>
              <span class="text-xs font-bold text-white">${yCategories[params.data[1]]}</span>
            </div>
            <div class="h-px bg-white/10 my-1"></div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-xs text-slate-300">Intensity:</span>
              <span class="text-xs font-black text-accent">${params.data[2]}</span>
            </div>
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
      type: 'category',
      data: xCategories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        rotate: data.length > 8 ? 45 : 0
      },
      splitArea: { show: true }
    },
    yAxis: {
      type: 'category',
      data: yCategories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b',
        fontSize: 10
      },
      splitArea: { show: true }
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      itemHeight: 120,
      show: false, // Keep it technical and minimal
      inRange: {
        color: ['#f8fafc', '#6366f1'] // From slate-50 to indigo-500
      }
    },
    series: [{
      name: 'Intensity',
      type: 'heatmap',
      data: seriesData,
      label: {
        show: data.length < 15,
        fontSize: 9,
        color: '#fff'
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.2)'
        }
      }
    }]
  };
}
