import { defaultStyles } from '@visx/tooltip';
import { ThemeType } from '../../styled';

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

export const getDefaultTooltipStyles = (theme: ThemeType) => ({
  ...defaultStyles,
  background: theme.colors.background,
  border: `1px solid ${theme.colors.backgroundAccent}`,
  borderRadius: theme.borderRadius.small,
  color: theme.colors.text,
  fontSize: theme.fontSize.small,
});

export const getChartColors = (theme: ThemeType) => [
  theme.colors.primary, // Primary color: '#664de5' (Vibrant purple)
  '#FFD700', // Gold for a contrasting yet harmonious color
  '#87CEEB', // Sky blue to complement the purple
  '#FF69B4', // Hot pink for a playful, vibrant look
];
