import { MouseEvent, useCallback, useState, useMemo } from 'react';

import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { scaleOrdinal } from '@visx/scale';
import { useTooltipInPortal, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { LegendOrdinal, LegendItem, LegendLabel } from '@visx/legend';
import { motion } from 'framer-motion';

import { useTheme } from '../../../hooks';
import {
  getChartColors,
  getDefaultTooltipStyles,
  InnerChartProps,
  LegendPosition,
  TooltipConfig,
  ChartProps,
} from '../util';
import { styled } from '../../../styled';
import { EmptyChart } from '../EmptyChart';

type LabelPosition = 'inside' | 'outside';

const ChartWrapper = styled.div<{ $legendPosition: LegendPosition }>`
  display: flex;
  width: 100%;
  height: 100%;

  ${({ $legendPosition }) => {
    switch ($legendPosition) {
      case 'top':
      case 'bottom':
        return 'flex-direction: column;';
      case 'left':
        return 'flex-direction: row;';
      case 'right':
        return 'flex-direction: row-reverse;';
      default:
        return '';
    }
  }}
`;

const LegendContainer = styled.div<{ $position: LegendPosition }>`
  display: flex;
  flex-direction: ${({ $position }) => ($position === 'top' || $position === 'bottom' ? 'row' : 'column')};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSize.small};

  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return 'justify-content: center; margin-bottom: 16px;';
      case 'bottom':
        return 'justify-content: center; margin-top: 16px;';
      case 'left':
        return 'margin-right: 16px; justify-content: center;';
      case 'right':
        return 'margin-left: 16px; justify-content: center;';
      default:
        return '';
    }
  }}
`;

const SvgContainer = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
`;

export interface PieChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  /** Tooltip configuration */
  tooltip?: TooltipConfig<T>;
  /** Label accessor - receives data item, percentage, and value. If not provided, shows name if space allows */
  labelAccessor?: (d: T, percentage: number, value: number) => string;
  /** Position labels inside or outside the slices. Default: 'inside' */
  labelPosition?: LabelPosition;
  /** Click handler for pie slices */
  onSliceClick?: (d: T, index: number) => void;
  /** Show legend and its position. Default: 'none' */
  legendPosition?: LegendPosition;
  /** Enable animation on mount and interactions. Default: true */
  animate?: boolean;
  /** Custom colors for slices. If not provided, uses theme colors */
  colors?: string[];
  /** Inner radius as percentage of outer radius (0-1). 0 = pie chart, >0 = donut chart. Example: 0.6 = 60% of outer radius. Default: 0 */
  innerRadius?: number;
  /** Gap between slices in radians. 0 = no gap, 0.02 = small gap, 0.05 = large gap. Default: 0.005 */
  padAngle?: number;
  /** Corner radius in pixels for rounded corners. 0 = sharp corners. Default: 3. Note: With small innerRadius + large padAngle, set to 0 for consistent slice lengths. */
  cornerRadius?: number;
  /** Content to render in the center when innerRadius > 0. Receives total value and data array */
  centerContent?: (total: number, data: T[]) => React.ReactNode;
}

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export const PieChart = <T,>({
  data,
  yAccessor,
  xAccessor,
  tooltip,
  labelAccessor,
  labelPosition = 'inside',
  name,
  margin,
  colors,
  innerRadius = 0,
  padAngle = 0.005,
  cornerRadius = 3,
  onSliceClick,
  legendPosition = 'none',
  animate = true,
  centerContent,
}: PieChartProps<T>) => {
  const theme = useTheme();
  const chartColors = colors || getChartColors(theme);

  const adjustedMargin =
    margin || (labelPosition === 'outside' ? { top: 40, right: 40, bottom: 40, left: 40 } : defaultMargin);
  const total = useMemo(() => data.reduce((sum, d) => sum + yAccessor(d), 0), [data, yAccessor]);
  const legendGlyphSize = 15;

  const ordinalColorScale = useMemo(
    () =>
      scaleOrdinal({
        domain: data.map(xAccessor),
        range: chartColors,
      }),
    [data, xAccessor, chartColors],
  );

  const renderLegend = () => (
    <LegendContainer $position={legendPosition}>
      <LegendOrdinal scale={ordinalColorScale}>
        {(labels) => (
          <div
            style={{
              display: 'flex',
              flexDirection: legendPosition === 'top' || legendPosition === 'bottom' ? 'row' : 'column',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            {labels.map((label, i) => (
              <LegendItem key={`legend-item-${i}`} margin="0">
                <svg width={legendGlyphSize} height={legendGlyphSize} style={{ marginRight: '4px' }}>
                  <rect fill={label.value} width={legendGlyphSize} height={legendGlyphSize} rx={2} />
                </svg>
                <LegendLabel align="left" margin="0">
                  {label.text}
                </LegendLabel>
              </LegendItem>
            ))}
          </div>
        )}
      </LegendOrdinal>
    </LegendContainer>
  );

  return (
    <ChartWrapper $legendPosition={legendPosition}>
      {legendPosition !== 'none' && (legendPosition === 'top' || legendPosition === 'left') && renderLegend()}

      <SvgContainer>
        <ParentSize>
          {total > 0
            ? (parent) => (
                <Chart<T>
                  name={name}
                  data={data}
                  width={parent.width}
                  height={parent.height}
                  margin={adjustedMargin}
                  yAccessor={yAccessor}
                  xAccessor={xAccessor}
                  labelAccessor={labelAccessor}
                  labelPosition={labelPosition}
                  ordinalColorScale={ordinalColorScale}
                  total={total}
                  onSliceClick={onSliceClick}
                  animate={animate}
                  innerRadius={innerRadius}
                  padAngle={padAngle}
                  cornerRadius={cornerRadius}
                  centerContent={centerContent}
                  tooltip={tooltip}
                />
              )
            : () => <EmptyChart />}
        </ParentSize>
      </SvgContainer>

      {legendPosition !== 'none' && (legendPosition === 'bottom' || legendPosition === 'right') && renderLegend()}
    </ChartWrapper>
  );
};

type InnerPieChartProps<T> = InnerChartProps &
  Omit<PieChartProps<T>, 'colors' | 'legendPosition'> & {
    ordinalColorScale: ReturnType<typeof scaleOrdinal<string, string>>;
    total: number;
  };

const Chart = <T,>({
  width,
  xAccessor,
  yAccessor,
  data,
  name,
  height,
  labelAccessor,
  labelPosition,
  tooltip,
  margin = defaultMargin,
  ordinalColorScale,
  total,
  onSliceClick,
  animate,
  innerRadius = 0,
  padAngle = 0.005,
  cornerRadius = 3,
  centerContent,
}: InnerPieChartProps<T>) => {
  const theme = useTheme();
  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip<string>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;

  // Calculate inner radius as percentage of outer radius
  const calculatedInnerRadius = radius * innerRadius;

  // When innerRadius is 0, force cornerRadius to 0 to prevent center artifact
  // (you can't geometrically round a point where all slices converge)
  const actualCornerRadius = innerRadius === 0 ? 0 : cornerRadius;

  // When innerRadius is 0, remove stroke to prevent white rectangle artifact at center
  // (overlapping stroke borders create a visible square where slices meet)
  const actualStrokeWidth = innerRadius === 0 ? 0 : 2;

  const pieSortValues = (a: number, b: number) => b - a;

  const handleMouseOver = useCallback(
    (event: MouseEvent, datum: T, index: number, percentage: number, value: number) => {
      const target = event.target as SVGElement;
      const coords = localPoint(target.ownerSVGElement!, event);

      setHoveredIndex(index);

      const defaultTooltip = `${xAccessor(datum)}: ${value.toFixed(2)} (${percentage.toFixed(1)}%)`;

      showTooltip({
        tooltipLeft: coords?.x,
        tooltipTop: coords?.y,
        tooltipData: tooltip?.accessor ? tooltip.accessor(datum) : defaultTooltip,
      });
    },
    [tooltip?.accessor, xAccessor, showTooltip],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    hideTooltip();
  }, [hideTooltip]);

  const handleClick = useCallback(
    (datum: T, index: number) => {
      setSelectedIndex(index === selectedIndex ? null : index);
      if (onSliceClick) {
        onSliceClick(datum, index);
      }
    },
    [onSliceClick, selectedIndex],
  );

  return width < 10 ? null : (
    <svg ref={containerRef} id={name} width={width} height={height}>
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={data}
          outerRadius={radius}
          innerRadius={calculatedInnerRadius}
          cornerRadius={actualCornerRadius}
          padAngle={padAngle}
          pieSortValues={pieSortValues}
          pieValue={yAccessor}
        >
          {(pie) => {
            return pie.arcs.map((arc, index) => {
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
              const arcPath = pie.path(arc) ?? '';
              const arcFill = ordinalColorScale(xAccessor(arc.data));
              const value = yAccessor(arc.data);
              const percentage = (value / total) * 100;

              const isHovered = hoveredIndex === index;
              const isSelected = selectedIndex === index;

              // Calculate expanded position for hover/select effect (only if animate is enabled)
              const angle = (arc.startAngle + arc.endAngle) / 2;
              const expandDistance = animate && (isHovered || isSelected) ? 10 : 0;
              const translateX = Math.cos(angle - Math.PI / 2) * expandDistance;
              const translateY = Math.sin(angle - Math.PI / 2) * expandDistance;

              // Calculate label position
              let labelX = centroidX;
              let labelY = centroidY;

              if (labelPosition === 'outside') {
                const labelRadius = radius + 20;
                labelX = Math.cos(angle - Math.PI / 2) * labelRadius;
                labelY = Math.sin(angle - Math.PI / 2) * labelRadius;
              }

              const labelText = labelAccessor
                ? labelAccessor(arc.data, percentage, value)
                : hasSpaceForLabel
                  ? xAccessor(arc.data)
                  : '';

              return (
                <g
                  key={`arc-${xAccessor(arc.data)}-${index}`}
                  style={{
                    transform: `translate(${translateX}px, ${translateY}px)`,
                    transition: animate ? 'transform 0.2s ease-out' : 'none',
                  }}
                >
                  <motion.path
                    d={arcPath}
                    fill={arcFill}
                    stroke={theme.colors.background}
                    strokeWidth={actualStrokeWidth}
                    onMouseOver={(e) => handleMouseOver(e, arc.data, index, percentage, value)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(arc.data, index)}
                    style={{
                      cursor: onSliceClick ? 'pointer' : 'default',
                      transition: animate ? 'opacity 0.2s ease-out' : 'none',
                      filter: animate && (isHovered || isSelected) ? 'brightness(1.1)' : 'none',
                    }}
                    initial={animate ? { opacity: 0 } : { opacity: 0.9 }}
                    animate={{
                      opacity: isHovered || isSelected ? 1 : hoveredIndex !== null ? 0.6 : 0.9,
                    }}
                    transition={
                      animate
                        ? {
                            opacity: {
                              duration: 0.3,
                              delay: (arc.startAngle / (Math.PI * 2)) * 0.6,
                              ease: 'linear',
                            },
                          }
                        : { duration: 0 }
                    }
                  />
                  {labelText && (
                    <motion.text
                      x={labelX}
                      y={labelY}
                      dy=".33em"
                      fill={labelPosition === 'outside' ? theme.colors.text : 'white'}
                      fontSize={labelPosition === 'outside' ? 12 : 11}
                      fontWeight={animate && (isHovered || isSelected) ? 600 : 500}
                      textAnchor="middle"
                      pointerEvents="none"
                      style={{
                        transition: animate ? 'font-weight 0.2s ease-out' : 'none',
                      }}
                      initial={animate ? { opacity: 0 } : { opacity: 1 }}
                      animate={{ opacity: 1 }}
                      transition={
                        animate
                          ? {
                              duration: 0.3,
                              delay: 1.0,
                              ease: 'easeOut',
                            }
                          : { duration: 0 }
                      }
                    >
                      {labelText}
                    </motion.text>
                  )}
                </g>
              );
            });
          }}
        </Pie>
        {innerRadius > 0 && centerContent && (
          <foreignObject
            x={-calculatedInnerRadius}
            y={-calculatedInnerRadius}
            width={calculatedInnerRadius * 2}
            height={calculatedInnerRadius * 2}
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: theme.colors.text,
              }}
              initial={animate ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={
                animate
                  ? {
                      duration: 0.4,
                      delay: 1.1,
                      ease: 'easeOut',
                    }
                  : { duration: 0 }
              }
            >
              {centerContent(total, data)}
            </motion.div>
          </foreignObject>
        )}
      </Group>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={`tooltip-${name}`}
          top={tooltipTop}
          left={tooltipLeft}
          style={getDefaultTooltipStyles(theme)}
        >
          {tooltipData}
        </TooltipInPortal>
      )}
    </svg>
  );
};
