export interface ChartProps {
  /// Unique identifier for the chart
  name: string;
  showGrid?: boolean;
  axisXLabel?: string;
  axisYLabel?: string;
  showAxisX?: boolean;
  showAxisY?: boolean;
}

export interface InnerChartProps extends ChartProps {
  width: number;
  height: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export { BarChart } from './BarChart';
export type { BarChartProps } from './BarChart';

export { AreaChart } from './AreaChart';
export type { AreaChartProps } from './AreaChart';
