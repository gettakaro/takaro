import { FC } from 'react';

export interface SparklineProps {
  data: number[];
  color?: string;
  width?: string | number;
  height?: string | number;
  strokeWidth?: number;
}

/**
 * Sparkline component - renders a simple SVG line chart for trend visualization
 * Designed to be used as Stats.Sparkline for showing mini trend charts
 */
export const Sparkline: FC<SparklineProps> = ({
  data,
  color = 'currentColor',
  width = '100%',
  height = '100%',
  strokeWidth = 2,
}) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const divisor = Math.max(data.length - 1, 1); // in case of single data point
      const x = (index / divisor) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
