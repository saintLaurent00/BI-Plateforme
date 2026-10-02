import { ChartPluginProps } from '../../types';

export default function TreemapChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  const metric = yAxis[0];
  const seriesData = data.map(d => ({
    name: String(d[xAxis]),
    value: d[metric]
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
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
    series: [
      {
        name: metric,
        type: 'treemap',
        data: seriesData,
        leafDepth: 1,
        roam: false,
        label: {
          show: true,
          formatter: '{b}',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#fff'
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
          gapWidth: 1
        },
        upperLabel: {
          show: true,
          height: 30,
          color: '#64748b',
          fontSize: 10
        },
        levels: [
          {
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 2,
              gapWidth: 2
            }
          },
          {
             color: ['#6366f1', '#4f46e5', '#4338ca', '#3730a3'],
             colorMappingBy: 'id',
             itemStyle: {
                gapWidth: 1
             }
          }
        ],
        animationDuration: 1500
      }
    ]
  };
}
