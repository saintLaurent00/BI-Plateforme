import { ChartPluginProps } from '../../types';

export default function PieChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis, type } = props;

  const isDonut = type === 'Donut';
  const metric = yAxis[0];

  const seriesData = data.map(d => ({
    name: String(d[xAxis]),
    value: d[metric]
  }));

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
      formatter: '{b}: {c} ({d}%)'
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
        type: 'pie',
        radius: isDonut ? ['40%', '70%'] : '70%',
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: isDonut,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: '{b}\n{d}%'
          },
          scaleSize: 10
        },
        labelLine: {
          show: false
        },
        data: seriesData,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 1500
      }
    ]
  };
}
