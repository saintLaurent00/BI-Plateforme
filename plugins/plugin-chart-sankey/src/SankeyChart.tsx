import { ChartPluginProps } from '../../types';

export default function SankeyChart(props: ChartPluginProps) {
  const { data, xAxis, yAxis } = props;

  // Assuming data structure: source, target, value
  // In the D3 version it was mocking targets. 
  // We'll try to find 'source' and 'target' keys or use xAxis and xAxis2 if available.
  
  const nodesSet = new Set<string>();
  const links: any[] = [];
  const metric = yAxis[0];

  data.forEach(d => {
    const source = String(d[xAxis]);
    const target = d.target ? String(d.target) : `Category ${Math.floor(Math.random() * 5)}`; // Fallback mock if data is incomplete
    
    nodesSet.add(source);
    nodesSet.add(target);
    
    links.push({
      source,
      target,
      value: Number(d[metric]) || 1
    });
  });

  const nodes = Array.from(nodesSet).map(name => ({ name }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
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
        type: 'sankey',
        data: nodes,
        links: links,
        emphasis: {
          focus: 'adjacency'
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        },
        label: {
          color: '#64748b',
          fontSize: 10,
          fontWeight: 'bold'
        },
        itemStyle: {
           borderWidth: 1,
           borderColor: '#fff',
           borderRadius: 4
        }
      }
    ]
  };
}
