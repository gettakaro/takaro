import { bisector, extent, max } from '@visx/vendor/d3-array';
import * as allCurves from '@visx/curve';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { ParentSize } from '@visx/responsive';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { useTooltip, Tooltip, TooltipWithBounds } from '@visx/tooltip';
import { timeFormat } from '@visx/vendor/d3-time-format';

import { useTheme } from '../../../hooks';
import { useCallback, useMemo } from 'react';
import { Margin, ChartProps, InnerChartProps, getDefaultTooltipStyles } from '../util';
import { localPoint } from '@visx/event';
import { PointHighlight } from '../PointHighlight';
import { EmptyChart } from '../EmptyChart';

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
const defaultShowAxisX = true;
const defaultShowAxisY = true;

type CurveType = keyof typeof allCurves;
// eslint-disable-next-line quotes
const formatDate = timeFormat("%b %d, '%y");

export interface LineChartProps<T> extends ChartProps {
  data: T[];
  xAccessor: (d: T) => Date;
  yAccessor: (d: T) => number;
  tooltipAccessor?: (d: T) => string;
  margin?: Margin;
  curveType?: CurveType;
}

export const LineChart = <T,>({
  data,
  xAccessor,
  yAccessor,
  tooltipAccessor,
  margin = defaultMargin,
  name,
  axisYLabel,
  axisXLabel,
  showGrid,
  showAxisX = defaultShowAxisX,
  showAxisY = defaultShowAxisY,
  curveType = 'curveBasis',
}: LineChartProps<T>) => {
  if (!data || data.length === 0) return <EmptyChart />;

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
          showGrid={showGrid}
          margin={margin}
          axisYLabel={axisYLabel}
          axisXLabel={axisXLabel}
          showAxisX={showAxisX}
          showAxisY={showAxisY}
          curveType={curveType}
        />
      )}
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
  yAccessor,
  margin = defaultMargin,
  tooltipAccessor,
  showAxisX,
  showAxisY,
  axisYLabel,
  axisXLabel,
}: InnerLineChartProps<T>) => {
  const theme = useTheme();

  const bottomAxisHeight = showAxisX ? 25 : 0;
  const leftAxisWidth = showAxisX ? 25 : 0;
  const innerWidth = width - margin.left - margin.right - leftAxisWidth;
  const innerHeight = height - margin.top - margin.bottom - bottomAxisHeight;

  const { hideTooltip, showTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip<T>();

  const xScale = useMemo(
    () =>
      scaleTime<number>({
        range: [margin.left, innerWidth],
        domain: extent(data, xAccessor) as [Date, Date],
      }),
    [innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [innerHeight, margin.bottom],
        domain: [0, max(data, yAccessor) as number],
      }),
    [innerHeight],
  );

  const handleTooltip = useCallback(
    (event: React.TouchEvent<SVGElement> | React.MouseEvent<SVGElement>) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x - margin.left);
      let index = bisector<T, Date>(xAccessor).left(data, x0);

      // Clamp the index to ensure it's within the range of data points
      index = Math.min(data.length - 1, Math.max(0, index));

      const d = data[index];
      const tooltipX = xScale(xAccessor(d));
      const tooltipY = yScale(yAccessor(d));

      showTooltip({
        tooltipData: d,
        tooltipLeft: tooltipX,
        tooltipTop: tooltipY,
      });
    },
    [yScale, xScale, data, yAccessor, xAccessor, width, height],
  );

  return width === 10 ? null : (
    <>
      <svg width={width} height={height}>
        <rect width={width} height={height} fill={theme.colors.background} rx={14} ry={14} />
        <Group top={margin.top} left={margin.left}>
          <rect
            x={margin.left}
            width={innerWidth - margin.left - margin.right}
            height={innerHeight}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={hideTooltip}
          />
          <LinePath<T>
            curve={allCurves[curveType]}
            data={data}
            x={(d) => xScale(xAccessor(d)) ?? 0}
            y={(d) => yScale(yAccessor(d)) ?? 0}
            stroke={theme.colors.primary}
            strokeWidth={1.2}
            strokeOpacity={0.6}
            shapeRendering="geometricPrecision"
          />
        </Group>
        {tooltipData && (
          <PointHighlight margin={margin} tooltipTop={tooltipTop} tooltipLeft={tooltipLeft} yMax={innerHeight} />
        )}
        {showAxisY && (
          <AxisLeft
            top={margin.top}
            left={margin.left + margin.left}
            strokeWidth={1}
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
            top={innerHeight + margin.top}
            left={margin.left}
            strokeWidth={1}
            stroke={theme.colors.backgroundAlt}
            hideZero
            tickLabelProps={{
              fill: theme.colors.text,
              fontSize: theme.fontSize.small,
              textAnchor: 'middle',
            }}
            labelProps={{
              fill: theme.colors.textAlt,
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
            top={innerHeight + margin.top - 14}
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
    </>
  );
};
