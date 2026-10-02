import { ChartPluginProps } from '../../types';

export default function RadarChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  const indicator = yAxis.map(col => {
    const maxVal = Math.max(...data.map(d => d[col])) * 1.1;
    return { name: col, max: maxVal > 0 ? maxVal : 100 };
  });

  const seriesData = data.map(d => ({
    value: yAxis.map(col => d[col]),
    name: String(d[xAxis])
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
      borderRadius: 12
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
    radar: {
      indicator,
      radius: '65%',
      center: ['50%', '50%'],
      splitNumber: 5,
      axisName: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 'bold'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(0,0,0,0.01)', 'rgba(0,0,0,0.02)']
        }
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(0,0,0,0.05)'
        }
      }
    },
    series: [
      {
        name: 'Radar Comparison',
        type: 'radar',
        data: seriesData,
        symbol: 'none',
        areaStyle: {
          opacity: 0.2
        },
        lineStyle: {
          width: 2
        },
        emphasis: {
          lineStyle: {
            width: 4
          },
          areaStyle: {
            opacity: 0.5
          }
        },
        animationDuration: 1500
      }
    ]
  };
}
