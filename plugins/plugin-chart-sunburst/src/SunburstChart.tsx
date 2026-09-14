import { ChartPluginProps } from '../../types';

export default function SunburstChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  const metric = yAxis[0];
  
  // Convert flat data to hierarchy for Sunburst
  // Since this is a simple flat array, we just create a root with children
  const seriesData = data.map(d => ({
    name: String(d[xAxis]),
    value: d[metric],
    children: d.children // If hierarchical data exists
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
    series: [
      {
        type: 'sunburst',
        data: seriesData,
        radius: [0, '90%'],
        emphasis: {
          focus: 'ancestor'
        },
        levels: [
          {},
          {
            r0: '15%',
            r: '35%',
            itemStyle: { borderWidth: 2 },
            label: { rotate: 'tangential', fontSize: 10 }
          },
          {
            r0: '35%',
            r: '70%',
            label: { align: 'right', fontSize: 9 }
          },
          {
            r0: '70%',
            r: '72%',
            label: { position: 'outside', padding: 3, silent: false, fontSize: 9 },
            itemStyle: { borderWidth: 3 }
          }
        ],
        animationDuration: 1500
      }
    ]
  };
}
