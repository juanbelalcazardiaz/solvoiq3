
import React from 'react';

interface PieChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface SimplePieChartProps {
  data: PieChartDataItem[];
  size?: number;
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ data, size = 180 }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-medium-text text-center py-4">No data to display.</p>;
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  if (totalValue === 0) {
     return <p className="text-sm text-medium-text text-center py-4">All values are zero.</p>;
  }

  let cumulativePercent = 0;
  const segments = data.map(item => {
    const percent = (item.value / totalValue) * 100;
    const startAngle = (cumulativePercent / 100) * 360;
    cumulativePercent += percent;
    const endAngle = (cumulativePercent / 100) * 360;
    return { ...item, percent, startAngle, endAngle };
  });

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: 'rotate(-90deg)' }}>
        {segments.map((segment, index) => {
          if (segment.percent === 0) return null;

          const [startX, startY] = getCoordinatesForPercent(segment.startAngle / 360);
          const [endX, endY] = getCoordinatesForPercent(segment.endAngle / 360);
          const largeArcFlag = segment.percent > 50 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`, // Move
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Arc
            `L 0 0`, // Line to center
          ].join(' ');

          return (
            <path key={index} d={pathData} fill={segment.color} stroke="#161B22" strokeWidth="0.03">
              <title>{`${segment.label}: ${segment.value} (${segment.percent.toFixed(1)}%)`}</title>
            </path>
          );
        })}
      </svg>
      <div className="mt-3 w-full max-w-xs">
        {data.map((item, index) => (
          item.value > 0 && (
            <div key={index} className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center">
                <span style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full mr-1.5"></span>
                <span className="text-medium-text">{item.label}</span>
              </div>
              <span className="text-dark-text font-medium">{item.value} ({(item.value / totalValue * 100).toFixed(1)}%)</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};
