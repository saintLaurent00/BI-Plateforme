import { ChartPluginProps } from '../../types';

export default function BoxPlotChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  // Manual calculation of box plot data per category
  const categories = Array.from(new Set(data.map(d => String(d[xAxis]))));
  const metric = yAxis[0];

  const boxData = categories.map(cat => {
    const values = data
      .filter(d => String(d[xAxis]) === cat)
      .map(d => d[metric])
      .sort((a, b) => a - b);
    
    if (values.length === 0) return [0, 0, 0, 0, 0];

    const q1 = values[Math.floor(values.length * 0.25)];
    const median = values[Math.floor(values.length * 0.5)];
    const q3 = values[Math.floor(values.length * 0.75)];
    const min = values[0];
    const max = values[values.length - 1];

    return [min, q1, median, q3, max];
  });

  return {
    backgroundColor: 'transparent',
    title: [
      {
        text: metric,
        left: 'center',
        top: 0,
        textStyle: {
          color: '#64748b',
          fontSize: 12,
          fontWeight: 'normal'
        }
      }
    ],
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
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10
      },
      splitLine: {
        show: false
      },
      axisLine: {
        lineStyle: { color: 'rgba(0,0,0,0.1)' }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Value',
      splitArea: {
        show: true
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.05)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Box',
        type: 'boxplot',
        data: boxData,
        itemStyle: {
           color: 'rgba(99, 102, 241, 0.1)',
           borderColor: '#6366f1',
           borderWidth: 1.5
        },
        emphasis: {
            itemStyle: {
                color: 'rgba(99, 102, 241, 0.2)',
                borderWidth: 2,
                shadowBlur: 10,
                shadowColor: 'rgba(0,0,0,0.1)'
            }
        },
        tooltip: {
          formatter: (param: any) => {
            return [
              'Category ' + param.name + ': ',
              'Upper: ' + param.data[5],
              'Q3: ' + param.data[4],
              'Median: ' + param.data[3],
              'Q1: ' + param.data[2],
              'Lower: ' + param.data[1]
            ].join('<br/>');
          }
        }
      }
    ]
  };
}
