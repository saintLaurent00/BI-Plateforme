import React from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface MiniChartProps {
  type: string;
  data?: any[];
  color?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const generateMockData = (type: string) => {
  const points = 12;
  return Array.from({ length: points }, (_, i) => ({
    name: i,
    value: Math.floor(Math.random() * 100) + 20,
  }));
};

const COLORS = ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

export const MiniChart: React.FC<MiniChartProps> = ({ type, data, color = '#8b5cf6', onClick }) => {
  const chartData = data || generateMockData(type);
  const t = type?.toLowerCase() || '';

  return (
    <div className="w-full h-full" onClick={onClick}>
      <ResponsiveContainer width="100%" height="100%">
        {(() => {
          if (t.includes('pie') || t.includes('donut')) {
            const pieData = [
              { name: 'A', value: 400 },
              { name: 'B', value: 300 },
              { name: 'C', value: 300 },
              { name: 'D', value: 200 },
            ];
            return (
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={t.includes('donut') ? "60%" : 0}
                  outerRadius="80%"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            );
          }

          if (t.includes('bar')) {
            return (
              <BarChart data={chartData}>
                <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
              </BarChart>
            );
          }

          if (t.includes('area')) {
            return (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={color} fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            );
          }

          // Default to Line Chart
          return (
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2} 
                dot={false}
                animationDuration={1500}
              />
            </LineChart>
          );
        })()}
      </ResponsiveContainer>
    </div>
  );
};
