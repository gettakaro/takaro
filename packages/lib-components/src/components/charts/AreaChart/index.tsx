import { useCallback, useMemo, useRef, useState } from 'react';

import { ParentSize } from '@visx/responsive';
import { GridColumns } from '@visx/grid';
import { Group } from '@visx/group';
import { AreaClosed, Bar } from '@visx/shape';
import { max, extent } from '@visx/vendor/d3-array';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { useTooltip, Tooltip, TooltipWithBounds } from '@visx/tooltip';
import { timeFormat } from '@visx/vendor/d3-time-format';
import { PatternLines } from '@visx/pattern';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import { bisector } from '@visx/vendor/d3-array';

import { useTheme } from '../../../hooks';
import { useGradients } from '../useGradients';
import { Margin, ChartProps, InnerChartProps, getDefaultTooltipStyles } from '../util';
import { BrushHandle } from '../BrushHandle';
import { PointHighlight } from '../PointHighlight';

export interface AreaChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => Date;
  yAccessor: (d: T) => number;
  tooltipAccessor?: (d: T) => string;
  margin?: Margin;
  showBrush?: boolean;
  brushMargin?: Margin;
}

// eslint-disable-next-line quotes
const formatDate = timeFormat("%b %d, '%y");

const defaultMargin = { top: 20, left: 50, bottom: 20, right: 5 };
const defaultBrushMargin = { top: 10, bottom: 15, left: 50, right: 5 };
const defaultShowAxisX = true;
const defaultShowAxisY = true;
const defaultShowGrid = true;

export const AreaChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  tooltipAccessor,
  margin = defaultMargin,
  showGrid = defaultShowGrid,
  showBrush = false,
  brushMargin = defaultBrushMargin,
  name,
  showAxisX = defaultShowAxisX,
  showAxisY = defaultShowAxisY,
  axisXLabel,
  axisYLabel,
}: AreaChartProps<T>) => {
  // TODO: handle empty data
  if (!data || data.length === 0) return null;

  // TODO: handle loading state
  return (
    <ParentSize>
      {(parent) => (
        <Chart<T>
          name={name}
          xAccessor={xAccessor}
          yAccessor={yAccessor}
          tooltipAccessor={tooltipAccessor}
          data={data}
          width={parent.width}
          height={parent.height}
          brushMargin={brushMargin}
          showBrush={showBrush}
          showGrid={showGrid}
          margin={margin}
          axisYLabel={axisYLabel}
          axisXLabel={axisXLabel}
          showAxisX={showAxisX}
          showAxisY={showAxisY}
        />
      )}
    </ParentSize>
  );
};

type InnerAreaChartProps<T> = InnerChartProps & AreaChartProps<T>;

const Chart = <T,>({
  data,
  xAccessor,
  yAccessor,
  tooltipAccessor,
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
  axisXLabel,
}: InnerAreaChartProps<T>) => {
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
      // 'val' is either a number or an object with a 'valueOf()' method.
      date = new Date(val.valueOf());
    }
    return formatDate(date);
  };

  const chartSeparation = 15;
  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = chartSeparation + 10;
  const topChartHeight = showBrush ? 0.8 * innerHeight - topChartBottomMargin : innerHeight;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight - margin.bottom, 0);

  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

  const xScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredData, xAccessor) as [Date, Date],
      }),
    [xMax, filteredData],
  );

  const yScale = useMemo(
    () =>
      scaleLinear({
        range: [yMax, 0],
        domain: [0, max(filteredData, yAccessor) || 0],
        nice: true,
      }),
    [yMax, filteredData],
  );

  const xBrushScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(data, xAccessor) as [Date, Date],
      }),
    [xBrushMax],
  );

  const yBrushScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(data, yAccessor) || 0],
        nice: true,
      }),
    [yBrushMax],
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: xBrushScale(xAccessor(data[0])) },
      end: { x: xBrushScale(xAccessor(data[data.length - 1])) },
    }),
    [xBrushScale],
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
      let index = bisector<T, Date>(xAccessor).left(filteredData, x0);

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
    [yScale, xScale, filteredData, yAccessor, xAccessor, width, height],
  );

  if (width < 10) return null;
  return (
    <div>
      <svg width={width} height={height}>
        {gradients.chart.gradient}
        {gradients.background.gradient}
        <rect x={0} y={0} width={width} height={height} fill={`url(#${gradients.background.id})`} rx={14} />
        {showGrid && (
          <GridColumns
            top={margin.top}
            left={margin.left}
            scale={xScale}
            height={yMax}
            strokeDasharray="1,5"
            stroke={theme.colors.backgroundAccent}
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
            strokeWidth={1}
            stroke={theme.colors.primary}
            fill={`url(#${gradients.chart.id})`}
            curve={curveMonotoneX}
          />
        </Group>
        <Bar
          x={margin.left}
          y={margin.top}
          width={xMax}
          height={yMax}
          fill="transparent"
          rx={14}
          onTouchStart={handleTooltip}
          onTouchMove={handleTooltip}
          onMouseMove={handleTooltip}
          onMouseLeave={hideTooltip}
        />
        {tooltipData && (
          <PointHighlight margin={margin} yMax={yMax} tooltipLeft={tooltipLeft} tooltipTop={tooltipTop} />
        )}
        {/* brush chart */}
        {showBrush && (
          <Group left={margin.left} top={topChartHeight + topChartBottomMargin + margin.top}>
            <AreaClosed<T>
              x={(d) => xBrushScale(xAccessor(d)) ?? 0}
              y={(d) => yBrushScale(yAccessor(d)) ?? 0}
              width={xBrushMax}
              data={data}
              yScale={yBrushScale}
              strokeWidth={1}
              stroke={`url(#${gradients.chart.id})`}
              fill={`url(#${gradients.chart.id})`}
              curve={curveMonotoneX}
            />
            <PatternLines
              id={PATTERN_ID}
              height={8}
              width={8}
              stroke={theme.colors.backgroundAccent}
              strokeWidth={1}
              orientation={['diagonal']}
            />
            <Brush
              xScale={xBrushScale}
              yScale={yBrushScale}
              width={xBrushMax}
              height={yBrushMax}
              innerRef={brushRef}
              resizeTriggerAreas={['left', 'right']}
              brushDirection="horizontal"
              initialBrushPosition={initialBrushPosition}
              margin={brushMargin}
              onChange={onBrushChange}
              selectedBoxStyle={{
                fill: `url(#${PATTERN_ID})`,
                stroke: theme.colors.backgroundAccent,
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
            strokeWidth={1}
            hideZero
            numTicks={5}
            stroke={theme.colors.backgroundAlt}
            labelOffset={42}
            tickStroke={theme.colors.backgroundAlt}
            tickLabelProps={{
              fill: theme.colors.text,
              fontSize: theme.fontSize.small,
              textAnchor: 'end',
            }}
            tickFormat={(val) => `${val}`}
            scale={yScale}
            label={axisYLabel}
          />
        )}
        {showAxisX && (
          <AxisBottom
            top={yMax + margin.top}
            left={margin.left}
            strokeWidth={1}
            stroke={theme.colors.backgroundAlt}
            hideZero
            numTicks={4}
            tickLabelProps={{
              fill: theme.colors.textAlt,
              fontSize: theme.fontSize.small,
              textAnchor: 'end',
            }}
            tickFormat={tickFormatDate}
            labelProps={{
              fill: theme.colors.textAlt,
              fontSize: theme.fontSize.tiny,
              y: 35,
              x: width / 2 - margin.left,
            }}
            scale={xScale}
            label={axisXLabel}
          />
        )}
      </svg>
      {tooltipData && (
        <div>
          <TooltipWithBounds
            key={`${name}-tooltip`}
            top={tooltipTop - margin.top}
            left={tooltipLeft + margin.left}
            style={getDefaultTooltipStyles(theme)}
          >
            {tooltipAccessor ? tooltipAccessor(tooltipData) : yAccessor(tooltipData)}
          </TooltipWithBounds>
          <Tooltip
            top={yMax + margin.top - 14}
            left={tooltipLeft + margin.left}
            style={{
              ...getDefaultTooltipStyles(theme),
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
