import { defaultStyles } from '@visx/tooltip';
import { ThemeType } from '../../styled';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface AxisConfig {
  showX?: boolean;
  showY?: boolean;
  labelX?: string;
  labelY?: string;
  numTicksX?: number;
  numTicksY?: number;
  /** Whether to include zero in the Y-axis domain. Default: false (auto-scale from min) */
  includeZeroY?: boolean;
}

export interface TooltipConfig<T> {
  enabled?: boolean;
  accessor?: (d: T, ...additionalArgs: any[]) => string;
}

export interface BrushConfig {
  enabled?: boolean;
  margin?: Margin;
}

export type LegendPosition = 'top' | 'right' | 'bottom' | 'left' | 'none';

/** Grid display options for charts */
export type GridDisplay = 'none' | 'x' | 'y' | 'xy';

export interface ChartProps {
  /// Unique identifier for the chart
  name: string;
  /** Display grid lines. Options: 'none', 'x', 'y', 'xy'. Default: 'none' */
  grid?: GridDisplay;
  /** Axis configuration */
  axis?: AxisConfig;
  /** Enable or disable animations. Default: true */
  animate?: boolean;
  /** Chart margins */
  margin?: Margin;
}

export interface InnerChartProps extends ChartProps {
  width: number;
  height: number;
}

export const getDefaultTooltipStyles = (theme: ThemeType) => ({
  ...defaultStyles,
  background: theme.colors.background,
  border: `1px solid ${theme.colors.backgroundAccent}`,
  borderRadius: theme.borderRadius.small,
  color: theme.colors.text,
  fontSize: theme.fontSize.small,
  whiteSpace: 'pre-wrap' as const,
});

export const getChartColors = (theme: ThemeType) => [
  theme.colors.primary, // Primary color: '#664de5' (Vibrant purple)
  '#FFD700', // Gold for a contrasting yet harmonious color
  '#87CEEB', // Sky blue to complement the purple
  '#FF69B4', // Hot pink for a playful, vibrant look
  '#32CD32', // Lime green for nature-inspired freshness
  '#FF8C00', // Dark orange for warmth
  '#9370DB', // Medium purple for variety
  '#20B2AA', // Light sea green for coolness
  '#FF6347', // Tomato red for emphasis
  '#4682B4', // Steel blue for professionalism
  '#DAA520', // Goldenrod for richness
  '#8B4789', // Dark orchid for depth
];
