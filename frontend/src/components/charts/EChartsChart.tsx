import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartType } from '../../../plugins/types';
import { getChartPlugin } from '../../../plugins';

interface EChartsChartProps {
  data: any[];
  type: ChartType;
  xAxis: string;
  yAxis: string[];
  config?: any;
  onItemClick?: (data: any) => void;
}

export const EChartsChart: React.FC<EChartsChartProps> = ({ data, type, xAxis, yAxis, config = {}, onItemClick }) => {
  const options = useMemo(() => {
    if (!data || data.length === 0) return {};

    const plugin = getChartPlugin(type);
    if (plugin) {
      const pluginOptions = plugin.getOptions({
        data,
        xAxis,
        yAxis,
        config,
        width: 0, // Not strictly needed for ECharts options as it's responsive
        height: 0,
        onItemClick,
        type
      });

      // Add axis labels for Cartesian charts
      if (pluginOptions.xAxis && pluginOptions.yAxis) {
        const textStyle = {
          fontSize: 13,
          fontWeight: 700,
          color: '#475569', // Slate 600 for better contrast
          fontFamily: 'Inter, system-ui, sans-serif'
        };

        // Configure X Axis
        if (Array.isArray(pluginOptions.xAxis)) {
          pluginOptions.xAxis.forEach((ax: any) => {
            ax.name = ax.name || xAxis;
            ax.nameLocation = 'middle';
            ax.nameGap = 40;
            ax.nameTextStyle = textStyle;
          });
        } else {
          pluginOptions.xAxis.name = pluginOptions.xAxis.name || xAxis;
          pluginOptions.xAxis.nameLocation = 'middle';
          pluginOptions.xAxis.nameGap = 40;
          pluginOptions.xAxis.nameTextStyle = textStyle;
        }

        // Configure Y Axis
        const yLabel = yAxis.length === 1 ? yAxis[0] : (yAxis.length > 1 ? yAxis.join(' / ') : '');
        if (Array.isArray(pluginOptions.yAxis)) {
          pluginOptions.yAxis.forEach((ax: any) => {
            ax.name = ax.name || yLabel;
            ax.nameRotate = 90;
            ax.nameLocation = 'middle';
            ax.nameGap = 45;
            ax.nameTextStyle = textStyle;
          });
        } else {
          pluginOptions.yAxis.name = pluginOptions.yAxis.name || yLabel;
          pluginOptions.yAxis.nameRotate = 90;
          pluginOptions.yAxis.nameLocation = 'middle';
          pluginOptions.yAxis.nameGap = 45;
          pluginOptions.yAxis.nameTextStyle = textStyle;
        }

        // Adjust grid to ensure labels are visible
        if (pluginOptions.grid) {
          if (typeof pluginOptions.grid === 'object') {
            pluginOptions.grid.bottom = pluginOptions.grid.bottom || 60;
            pluginOptions.grid.left = pluginOptions.grid.left || 70;
            pluginOptions.grid.containLabel = true;
          }
        }
      }

      return pluginOptions;
    }
    
    return {};
  }, [data, type, xAxis, yAxis, config]);

  const onEvents = {
    'click': (params: any) => {
      if (onItemClick) {
        onItemClick(params.data);
      }
    }
  };

  return (
    <div className="w-full h-full min-h-[300px] relative">
      {options && Object.keys(options).length > 0 ? (
        <ReactECharts
          option={options}
          style={{ height: '100%', width: '100%' }}
          onEvents={onEvents}
          notMerge={true}
          lazyUpdate={true}
          theme="light"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/5 border border-dashed border-border rounded-none">
          Configuration du graphique en cours...
        </div>
      )}
    </div>
  );
};
