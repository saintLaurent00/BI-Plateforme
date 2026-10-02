import { ChartPluginProps } from '../../types';

export default function BarChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis, type } = props;

  const isHorizontal = type === 'HorizontalBar' || type === 'StackedHorizontalBar' || type === 'GroupedHorizontalBar';
  const isStacked = type === 'StackedBar' || type === 'StackedHorizontalBar' || type === 'PercentStackedBar';

  const series = yAxis.map(col => ({
    name: col,
    type: 'bar',
    stack: isStacked ? 'total' : undefined,
    data: data.map(d => d[col]),
    itemStyle: {
      borderRadius: isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
    },
    emphasis: {
      focus: 'series'
    },
    animationDuration: 1500,
    animationEasing: 'cubicOut'
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
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
      itemWidth: 10,
      itemHeight: 10,
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
    xAxis: isHorizontal ? {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.05)',
          type: 'dashed'
        }
      }
    } : {
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
    yAxis: isHorizontal ? {
      type: 'category',
      data: data.map(d => String(d[xAxis])),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b',
        fontSize: 10
      }
    } : {
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
