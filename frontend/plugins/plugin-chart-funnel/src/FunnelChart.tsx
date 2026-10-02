import { ChartPluginProps } from '../../types';

export default function FunnelChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  const metric = yAxis[0];
  const seriesData = data.map(d => ({
    name: String(d[xAxis]),
    value: d[metric]
  })).sort((a, b) => b.value - a.value);

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
      formatter: '{b}: {c}'
    },
    legend: {
      bottom: 0,
       itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#64748b',
        fontSize: 10
      }
    },
    series: [
      {
        name: metric,
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#fff'
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 14
          }
        },
        data: seriesData,
        animationDuration: 1500
      }
    ]
  };
}
