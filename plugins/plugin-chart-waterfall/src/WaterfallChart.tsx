import { ChartPluginProps } from '../../types';

export default function WaterfallChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  const metric = yAxis[0];
  const categories = data.map(d => String(d[xAxis]));
  
  let currentSum = 0;
  const helpData: number[] = [];
  const positiveData: any[] = [];
  const negativeData: any[] = [];

  data.forEach(d => {
    const val = Number(d[metric]) || 0;
    if (val >= 0) {
      helpData.push(currentSum);
      positiveData.push(val);
      negativeData.push('-');
      currentSum += val;
    } else {
      currentSum += val;
      helpData.push(currentSum);
      positiveData.push('-');
      negativeData.push(Math.abs(val));
    }
  });

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: { color: '#fff', fontSize: 11 },
      padding: [12, 16],
      borderRadius: 12,
      formatter: (params: any[]) => {
        const item = params[1].value !== '-' ? params[1] : params[2];
        return `${item.name}<br/>Value: ${item.value}`;
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
      data: categories,
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        rotate: data.length > 8 ? 45 : 0
      },
      axisLine: {
        lineStyle: { color: 'rgba(0,0,0,0.1)' }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: {
        lineStyle: { color: 'rgba(0,0,0,0.05)', type: 'dashed' }
      }
    },
    series: [
      {
        name: 'Placeholder',
        type: 'bar',
        stack: 'all',
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        },
        emphasis: {
          itemStyle: {
            borderColor: 'transparent',
            color: 'transparent'
          }
        },
        data: helpData
      },
      {
        name: 'Positive',
        type: 'bar',
        stack: 'all',
        itemStyle: {
           color: '#10b981',
           borderRadius: [4, 4, 0, 0]
        },
        data: positiveData
      },
      {
        name: 'Negative',
        type: 'bar',
        stack: 'all',
        itemStyle: {
           color: '#f43f5e',
           borderRadius: [4, 4, 0, 0]
        },
        data: negativeData
      }
    ]
  };
}
