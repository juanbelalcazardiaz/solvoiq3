
import React from 'react';

interface DoughnutChartDataItem {
  label: string;
  value: number;
  color: string;
}

interface SimpleDoughnutChartProps {
  data: DoughnutChartDataItem[];
  size?: number;
  holeSize?: number; // As a fraction of radius, e.g., 0.6
}

export const SimpleDoughnutChart: React.FC<SimpleDoughnutChartProps> = ({ data, size = 180, holeSize = 0.6 }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-medium-text text-center py-4">No data to display.</p>;
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
   if (totalValue === 0) {
     return <p className="text-sm text-medium-text text-center py-4">All values are zero.</p>;
  }

  const radius = 1;
  const innerRadius = radius * holeSize;

  let cumulativePercent = 0;

  const getCoordinates = (percent: number, currentRadius: number) => {
    const x = Math.cos(2 * Math.PI * percent) * currentRadius;
    const y = Math.sin(2 * Math.PI * percent) * currentRadius;
    return [x, y];
  };
  
  const segments = data.map(item => {
    const percent = item.value / totalValue;
    const startAngle = cumulativePercent;
    cumulativePercent += percent;
    const endAngle = cumulativePercent;
    return { ...item, percent, startAngle, endAngle };
  });


  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox="-1.1 -1.1 2.2 2.2" style={{ transform: 'rotate(-90deg)' }}>
        {segments.map((segment, index) => {
          if (segment.percent === 0) return null;

          const [startX, startY] = getCoordinates(segment.startAngle, radius);
          const [endX, endY] = getCoordinates(segment.endAngle, radius);
          
          const [innerStartX, innerStartY] = getCoordinates(segment.startAngle, innerRadius);
          const [innerEndX, innerEndY] = getCoordinates(segment.endAngle, innerRadius);

          const largeArcFlag = segment.percent > 0.5 ? 1 : 0;

          const pathData = [
            `M ${startX} ${startY}`, // Move to outer start
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Outer arc
            `L ${innerEndX} ${innerEndY}`, // Line to inner end
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`, // Inner arc (reverse)
            `Z` // Close path
          ].join(' ');

          return (
            <path key={index} d={pathData} fill={segment.color} stroke="#161B22" strokeWidth="0.03">
              <title>{`${segment.label}: ${segment.value} (${(segment.percent * 100).toFixed(1)}%)`}</title>
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
