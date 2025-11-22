import { bisector, extent, max, min } from '@visx/vendor/d3-array';
import * as allCurves from '@visx/curve';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { ParentSize } from '@visx/responsive';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { useTooltip, Tooltip, TooltipWithBounds } from '@visx/tooltip';
import { timeFormat } from '@visx/vendor/d3-time-format';
import { GridRows, GridColumns } from '@visx/grid';

import { useTheme } from '../../../hooks';
import { useCallback, useMemo } from 'react';
import { ChartProps, InnerChartProps, getDefaultTooltipStyles, TooltipConfig } from '../util';
import { localPoint } from '@visx/event';
import { PointHighlight } from '../PointHighlight';
import { motion } from 'framer-motion';
import { EmptyChart } from '../EmptyChart';

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
const defaultShowAxisX = true;
const defaultShowAxisY = true;

type CurveType = keyof typeof allCurves;
const formatDate = timeFormat("%b %d, '%y");

export interface LineConfig<T> {
  id: string;
  yAccessor: (d: T) => number;
  tooltipAccessor?: (d: T) => string;
  color?: string;
  label?: string;
}

export interface LineChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => Date;
  curveType?: CurveType;
  lines: LineConfig<T>[];
  /** Tooltip configuration */
  tooltip?: TooltipConfig<T>;
}

export const LineChart = <T,>({
  data,
  xAccessor,
  name,
  grid = 'none',
  curveType = 'curveBasis',
  lines,
  axis,
  tooltip,
  animate = true,
  margin = defaultMargin,
}: LineChartProps<T>) => {
  const hasData = data && data.length > 0;

  return (
    <ParentSize>
      {hasData
        ? (parent) => (
            <Chart<T>
              name={name}
              xAccessor={xAccessor}
              data={data}
              width={parent.width}
              height={parent.height}
              grid={grid}
              margin={margin}
              axis={axis}
              tooltip={tooltip}
              animate={animate}
              curveType={curveType}
              lines={lines}
            />
          )
        : () => <EmptyChart />}
    </ParentSize>
  );
};

type InnerLineChartProps<T> = InnerChartProps & LineChartProps<T>;

const Chart = <T,>({
  width,
  height,
  name,
  curveType = 'curveBasis',
  data,
  xAccessor,
  margin = defaultMargin,
  grid = 'none',
  axis,
  tooltip,
  animate = true,
  lines,
}: InnerLineChartProps<T>) => {
  const theme = useTheme();

  const showAxisX = axis?.showX ?? defaultShowAxisX;
  const showAxisY = axis?.showY ?? defaultShowAxisY;
  const axisXLabel = axis?.labelX;
  const axisYLabel = axis?.labelY;
  const numTicksX = axis?.numTicksX ?? 5;
  const numTicksY = axis?.numTicksY ?? 5;
  const includeZeroY = axis?.includeZeroY ?? false;
  const showTooltip = tooltip?.enabled ?? true;

  // Calculate inner dimensions (chart area within margins)
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const {
    hideTooltip,
    showTooltip: showTooltipHandler,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<{
    data: T;
    lineId?: string;
  }>();

  const xScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, innerWidth],
        domain: extent(data, xAccessor) as [Date, Date],
      }),
    [innerWidth, data, xAccessor],
  );

  const yDomain = useMemo(() => {
    const allValues = lines.flatMap((line) => data.map(line.yAccessor));
    const minValue = includeZeroY ? 0 : (min(allValues) as number);
    const maxValue = max(allValues) as number;
    return [minValue, maxValue];
  }, [lines, data, includeZeroY]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [innerHeight, 0],
        domain: yDomain,
        nice: true,
      }),
    [innerHeight, yDomain],
  );

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGElement> | React.MouseEvent<SVGElement>) => {
      const { x } = localPoint(event) || { x: 0 };

      // Subtract margin.left because localPoint gives coordinates relative to SVG,
      // but xScale is 0-based (relative to the chart area)
      const xRelativeToChart = x - margin.left;
      const x0 = xScale.invert(xRelativeToChart);
      let index = bisector<T, Date>(xAccessor).left(data, x0);

      // Clamp the index to ensure it's within the range of data points
      index = Math.min(data.length - 1, Math.max(0, index));

      const d = data[index];
      const tooltipX = xScale(xAccessor(d));

      const activeYAccessor = lines[0].yAccessor;
      const tooltipY = yScale(activeYAccessor(d));

      showTooltipHandler({
        tooltipData: { data: d },
        tooltipLeft: tooltipX,
        tooltipTop: tooltipY,
      });
    },
    [yScale, xScale, data, xAccessor, lines, margin.left],
  );

  return width === 10 ? null : (
    <>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill={theme.colors.background} rx={14} ry={14} />
        <Group top={margin.top} left={margin.left}>
          {(grid === 'y' || grid === 'xy') && (
            <GridRows
              scale={yScale}
              width={innerWidth}
              stroke={theme.colors.backgroundAccent}
              strokeOpacity={1}
              strokeDasharray="2,2"
              pointerEvents="none"
            />
          )}
          {(grid === 'x' || grid === 'xy') && (
            <GridColumns
              scale={xScale}
              height={innerHeight}
              stroke={theme.colors.backgroundAccent}
              strokeOpacity={1}
              strokeDasharray="2,2"
              pointerEvents="none"
            />
          )}
          <rect
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onTouchStart={showTooltip ? handleTooltip : undefined}
            onTouchMove={showTooltip ? handleTooltip : undefined}
            onMouseMove={showTooltip ? handleTooltip : undefined}
            onMouseLeave={showTooltip ? hideTooltip : undefined}
          />
          {lines.map((lineConfig, index) => (
            <LinePath<T>
              key={lineConfig.id}
              curve={allCurves[curveType]}
              data={data}
              x={(d) => xScale(xAccessor(d)) ?? 0}
              y={(d) => yScale(lineConfig.yAccessor(d)) ?? 0}
              pointerEvents="none"
            >
              {({ path }) => {
                const pathData = path(data) || '';
                return (
                  <motion.path
                    d={pathData}
                    stroke={lineConfig.color || theme.colors.primary}
                    strokeWidth={2.5}
                    strokeOpacity={0.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    pointerEvents="none"
                    initial={animate ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 0.9 }}
                    animate={{ pathLength: 1, opacity: 0.9 }}
                    transition={
                      animate
                        ? {
                            pathLength: { duration: 1, delay: index * 0.2, ease: 'easeOut' },
                          }
                        : { duration: 0 }
                    }
                  />
                );
              }}
            </LinePath>
          ))}
        </Group>
        {showTooltip && tooltipData && (
          <PointHighlight margin={margin} tooltipTop={tooltipTop} tooltipLeft={tooltipLeft} yMax={innerHeight} />
        )}
        {showAxisY && (
          <AxisLeft
            top={margin.top}
            left={margin.left}
            strokeWidth={1.5}
            stroke={theme.colors.backgroundAlt}
            labelOffset={42}
            tickStroke={theme.colors.backgroundAlt}
            tickLength={4}
            numTicks={numTicksY}
            tickLabelProps={{
              fill: theme.colors.text,
              fontSize: theme.fontSize.small,
              textAnchor: 'end',
              fontWeight: 500,
            }}
            labelProps={{
              fill: theme.colors.textAlt,
              fontSize: theme.fontSize.small,
              fontWeight: 600,
            }}
            scale={yScale}
            label={axisYLabel}
          />
        )}
        {showAxisX && (
          <AxisBottom
            top={innerHeight + margin.top}
            left={margin.left}
            strokeWidth={1.5}
            stroke={theme.colors.backgroundAlt}
            hideZero
            tickLength={4}
            numTicks={numTicksX}
            tickLabelProps={{
              fill: theme.colors.text,
              fontSize: theme.fontSize.small,
              textAnchor: 'middle',
              fontWeight: 500,
            }}
            labelProps={{
              fill: theme.colors.textAlt,
              fontSize: theme.fontSize.small,
              fontWeight: 600,
            }}
            scale={xScale}
            label={axisXLabel}
          />
        )}
      </svg>
      {showTooltip && tooltipData && (
        <div>
          <TooltipWithBounds
            key={`${name}-tooltip`}
            top={tooltipTop}
            left={tooltipLeft + margin.left + 10}
            style={getDefaultTooltipStyles(theme)}
          >
            <div>
              {lines.map((line) => {
                const value = line.yAccessor(tooltipData.data);
                const displayText = line.tooltipAccessor
                  ? line.tooltipAccessor(tooltipData.data)
                  : line.label
                    ? `${line.label}: ${value}`
                    : value;
                return (
                  <div key={line.id} style={{ marginBottom: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        backgroundColor: line.color || theme.colors.primary,
                        marginRight: '6px',
                        borderRadius: '2px',
                      }}
                    />
                    {displayText}
                  </div>
                );
              })}
            </div>
          </TooltipWithBounds>
          <Tooltip
            top={innerHeight + margin.top - 14}
            left={tooltipLeft + margin.left}
            style={{
              ...getDefaultTooltipStyles(theme),
              minWidth: 72,
              textAlign: 'center',
              transform: 'translateX(-50%)',
            }}
          >
            {formatDate(xAccessor(tooltipData.data))}
          </Tooltip>
        </div>
      )}
    </>
  );
};
