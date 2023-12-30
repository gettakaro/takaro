import { Margin, ChartProps, InnerChartProps } from '..';
import { ParentSize } from '@visx/responsive';
import { GridColumns } from '@visx/grid';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, Line, Bar } from '@visx/shape';
import { max, extent } from '@visx/vendor/d3-array';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { useTooltip, Tooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { timeFormat } from '@visx/vendor/d3-time-format';
import { PatternLines } from '@visx/pattern';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';

import { useTheme } from '../../../hooks';
import { useGradients } from '../useGradients';
import { BrushHandle } from '../BrushHandle';

export interface AreaChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => Date;
  xBisector: (array: ArrayLike<T>, x: Date, lo?: number | undefined, hi?: number | undefined) => number;
  yAccessor: (d: T) => number;

  margin?: Margin;
  showBrush?: boolean;
  brushMargin?: Margin;
}
const formatDate = timeFormat("%b %d, '%y");

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
const defaultBrushMargin = { top: 0, bottom: 0, left: 10, right: 10 };
const defaultShowAxisX = true;
const defaultShowAxisY = true;
const defaultShowGrid = true;

export const AreaChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  margin = defaultMargin,
  showGrid = defaultShowGrid,
  showBrush = false,
  brushMargin = defaultBrushMargin,
  name,
  showAxisX = defaultShowAxisX,
  showAxisY = defaultShowAxisY,
  axisXLabel,
  xBisector,
  axisYLabel,
}: AreaChartProps<T>) => {
  // TODO: handle empty data
  if (!data || data.length === 0) return null;

  // TODO: handle loading state

  return (
    <>
      <ParentSize>
        {(parent) => (
          <Chart<T>
            name={name}
            xAccessor={xAccessor}
            yAccessor={yAccessor}
            data={data}
            width={parent.width}
            height={parent.height}
            brushMargin={brushMargin}
            showBrush={showBrush}
            showGrid={showGrid}
            margin={margin}
            axisYLabel={axisYLabel}
            axisXLabel={axisXLabel}
            xBisector={xBisector}
            showAxisX={showAxisX}
            showAxisY={showAxisY}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerBarChartProps<T> = InnerChartProps & AreaChartProps<T>;

const Chart = <T,>({
  data,
  xAccessor,
  yAccessor,
  width,
  height,
  margin = defaultMargin,
  showGrid = defaultShowGrid,
  showBrush = false,
  brushMargin = defaultBrushMargin,
  name,
  showAxisX = defaultShowAxisX,
  showAxisY = defaultShowAxisY,
  axisYLabel,
  xBisector,
  axisXLabel,
}: InnerBarChartProps<T>) => {
  const PATTERN_ID = `${name}-brush_pattern`;
  const theme = useTheme();
  const gradients = useGradients(name);

  const brushRef = useRef(null);
  const { hideTooltip, showTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip<T>();
  const [filteredData, setFilteredData] = useState<T[]>(data);

  const tickFormatDate = (val: Date | { valueOf(): number }) => {
    let date: Date;

    if (val instanceof Date) {
      date = val;
    } else {
      // Here, 'val' is either a number or an object with a 'valueOf()' method.
      date = new Date(val.valueOf());
    }

    return formatDate(date);
  };

  const brushHeight = showBrush ? brushMargin.bottom + brushMargin.top + 100 : 0;
  const bottomAxisHeight = showAxisX ? 25 : 0;

  // Actual chart dimensions
  const mainChartInnerHeight = height - margin.top - margin.bottom - brushHeight - bottomAxisHeight;
  const mainChartInnerWidth = width - margin.left - margin.right;

  const separationBetweenBrushAndChart = 50;
  const mainChartAreaHeight = 0.85 * mainChartInnerHeight - separationBetweenBrushAndChart;
  const brushAreaHeight = mainChartInnerHeight - mainChartAreaHeight - separationBetweenBrushAndChart;

  const brushAreaInnerWidth = Math.max(mainChartInnerWidth - brushMargin.left - brushMargin.right, 0);
  const brushAreaInnerHeight = Math.max(brushAreaHeight - brushMargin.top - brushMargin.bottom, 0);
  const brushAreaTopPosition = margin.top + mainChartInnerHeight + separationBetweenBrushAndChart + brushMargin.top;

  const xScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, mainChartInnerWidth],
        domain: extent(filteredData, xAccessor) as [Date, Date],
      }),
    [mainChartInnerWidth, filteredData, mainChartInnerWidth]
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [mainChartInnerHeight, 0],
        domain: [0, (max(filteredData, yAccessor) || 0) + mainChartInnerHeight / 3],
        nice: true,
      }),
    [mainChartInnerHeight, filteredData, mainChartInnerHeight]
  );

  const xBrushScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, brushAreaInnerWidth],
        domain: extent(data, xAccessor) as [Date, Date],
      }),
    [brushAreaInnerWidth, mainChartInnerWidth]
  );

  const yBrushScale = useMemo(
    () =>
      scaleLinear({
        range: [brushAreaInnerHeight, 0],
        domain: [0, max(data, yAccessor) || 0],
        nice: true,
      }),
    [brushAreaInnerHeight, data, mainChartInnerHeight]
  );

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const filtered = data.filter((d) => {
      const x = xAccessor(d).getTime();
      const y = yAccessor(d);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredData(filtered);
  };

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x - margin.left);
      let index = xBisector(filteredData, x0);

      // Clamp the index to ensure it's within the range of data points
      index = Math.min(filteredData.length - 1, Math.max(0, index));

      const d = filteredData[index];
      const tooltipX = xScale(xAccessor(d));
      const tooltipY = yScale(yAccessor(d));

      showTooltip({
        tooltipData: d,
        tooltipLeft: tooltipX,
        tooltipTop: tooltipY,
      });
    },
    [showTooltip, yScale, xScale, xBisector, filteredData, yAccessor, xAccessor]
  );

  return (
    <div>
      <svg width={width} height={height}>
        {gradients.chart.gradient}
        {gradients.background.gradient}
        <rect width={width} height={height} fill={`url(#${gradients.background.id})`} rx={14} />
        {showGrid && (
          <GridColumns
            top={margin.top}
            left={margin.left}
            scale={xScale}
            height={mainChartInnerHeight}
            strokeDasharray="1,3"
            stroke={theme.colors.primary}
            strokeOpacity={0.2}
            pointerEvents="none"
          />
        )}
        <Group id="chart" top={margin.top} left={margin.left}>
          <AreaClosed<T>
            x={(d) => xScale(xAccessor(d)) ?? 0}
            y={(d) => yScale(yAccessor(d)) ?? 0}
            data={filteredData}
            yScale={yScale}
            strokeWidth={2}
            stroke={theme.colors.primary}
            fill={`url(#${gradients.chart.id})`}
            curve={curveMonotoneX}
          />
        </Group>
        <Bar
          x={margin.left}
          y={margin.top}
          width={mainChartInnerWidth}
          height={mainChartInnerHeight}
          fill="transparent"
          rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={(e) => {
            handleTooltip(e);
          }}
          onMouseLeave={() => hideTooltip()}
        />
        {tooltipData && (
          <Group left={margin.left} top={margin.top}>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: mainChartInnerHeight + margin.top }}
              stroke={theme.colors.tertiary}
              strokeWidth={1}
              pointerEvents="none"
              strokeDasharray="4,1"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop}
              r={4}
              fill={theme.colors.tertiary}
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </Group>
        )}

        {/* brush chart */}
        {showBrush && (
          <Group left={margin.left + brushMargin.left} top={brushAreaTopPosition}>
            <AreaClosed<T>
              x={(d) => xBrushScale(xAccessor(d)) ?? 0}
              y={(d) => yBrushScale(yAccessor(d)) ?? 0}
              width={brushAreaInnerWidth}
              data={data}
              yScale={yBrushScale}
              strokeWidth={1}
              stroke={`url(#${gradients.chart.id})`}
              fill={`url(#${gradients.chart.id})`}
              curve={curveMonotoneX}
            />
            );
            <PatternLines
              id={PATTERN_ID}
              height={8}
              width={8}
              stroke={theme.colors.tertiary}
              strokeWidth={1}
              orientation={['diagonal']}
            />
            <Brush
              xScale={xBrushScale}
              yScale={yBrushScale}
              width={brushAreaInnerWidth}
              height={brushAreaInnerHeight}
              innerRef={brushRef}
              resizeTriggerAreas={['left', 'right']}
              brushDirection="horizontal"
              margin={brushMargin}
              onChange={onBrushChange}
              selectedBoxStyle={{
                fill: `url(#${PATTERN_ID})`,
                stroke: theme.colors.tertiary,
              }}
              useWindowMoveEvents
              handleSize={8}
              renderBrushHandle={(props) => <BrushHandle {...props} />}
            />
          </Group>
        )}
        {showAxisY && (
          <AxisLeft
            top={margin.top}
            left={margin.left}
            strokeWidth={3}
            hideZero
            stroke={theme.colors.backgroundAlt}
            labelOffset={42}
            tickStroke={theme.colors.backgroundAlt}
            tickLabelProps={{
              fill: theme.colors.text,
              fontSize: theme.fontSize.small,
              textAnchor: 'end',
            }}
            scale={yScale}
            label={axisYLabel}
          />
        )}

        {showAxisX && (
          <AxisBottom
            top={mainChartInnerHeight + margin.top - 0}
            left={margin.left}
            strokeWidth={3}
            stroke={theme.colors.backgroundAlt}
            tickLabelProps={{
              fill: theme.colors.textAlt,
              fontSize: theme.fontSize.small,
              textAnchor: 'middle',
            }}
            tickFormat={tickFormatDate}
            scale={xScale}
            label={axisXLabel}
          />
        )}
      </svg>
      {tooltipData && (
        <div>
          <TooltipWithBounds
            key={`${name}-tooltip`}
            top={tooltipTop - 12}
            left={tooltipLeft + 12 + margin.left}
            style={{
              ...defaultStyles,
              background: theme.colors.background,
              border: `1px solid ${theme.colors.text}`,
              color: theme.colors.text,
              fontSize: theme.fontSize.small,
            }}
          >
            {yAccessor(tooltipData)}
          </TooltipWithBounds>
          <Tooltip
            top={mainChartInnerHeight + margin.top - 14}
            left={tooltipLeft}
            style={{
              ...defaultStyles,
              minWidth: 72,
              textAlign: 'center',
              transform: 'translateX(-50%)',
            }}
          >
            {formatDate(xAccessor(tooltipData))}
          </Tooltip>
        </div>
      )}
    </div>
  );
};
