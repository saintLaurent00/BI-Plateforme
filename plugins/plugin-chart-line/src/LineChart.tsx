import { ChartPluginProps } from '../../types';

export default function LineChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis, type } = props;

  const isArea = type === 'Area' || type === 'StackedArea';
  const isStacked = type === 'StackedArea';
  const isSmooth = type === 'SmoothLine';
  const isStep = type === 'StepLine';

  const series = yAxis.map(col => ({
    name: col,
    type: 'line',
    stack: isStacked ? 'total' : undefined,
    smooth: isSmooth,
    step: isStep ? 'after' : undefined,
    areaStyle: isArea ? {
      opacity: 0.3
    } : undefined,
    data: data.map(d => d[col]),
    symbol: 'circle',
    symbolSize: 6,
    emphasis: {
      focus: 'series'
    },
    lineStyle: {
      width: 3
    }
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 11
      },
      padding: [12, 16],
      borderRadius: 12
    },
    legend: {
      show: yAxis.length > 1,
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        color: '#64748b',
        fontSize: 10
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: yAxis.length > 1 ? '15%' : '10%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => String(d[xAxis])),
      axisLine: {
        lineStyle: { color: 'rgba(0,0,0,0.1)' }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        rotate: data.length > 10 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
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
    series
  };
}
