import { MouseEvent, useCallback } from 'react';
import { Arc } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleRadial } from '@visx/scale';
import { Text } from '@visx/text';
import { shade } from 'polished';

import { Margin, InnerChartProps, getDefaultTooltipStyles } from '../util';
import { useTheme } from '../../../hooks';
import { ParentSize } from '@visx/responsive';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import localPoint from '@visx/event/lib/localPointGeneric';
import { useGradients } from '../useGradients';

const defaultMargin = { top: 10, right: 0, bottom: 25, left: 40 };
export interface RadialBarChartProps<T> {
  name: string;
  data: T[];
  margin?: Margin;
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  tooltipAccessor: (d: T) => string;
}

export const RadialBarChart = <T,>({
  xAccessor,
  data,
  margin,
  yAccessor,
  tooltipAccessor,
  name,
}: RadialBarChartProps<T>) => {
  return (
    <>
      <ParentSize>
        {(parent) => (
          <Chart<T>
            name={name}
            data={data}
            width={parent.width}
            height={parent.height}
            margin={margin}
            yAccessor={yAccessor}
            xAccessor={xAccessor}
            tooltipAccessor={tooltipAccessor}
          />
        )}
      </ParentSize>
    </>
  );
};

type InnerRadialBarChartProps<T> = InnerChartProps & RadialBarChartProps<T>;

const Chart = <T,>({
  name,
  width,
  height,
  xAccessor,
  yAccessor,
  tooltipAccessor,
  data,
  margin = defaultMargin,
}: InnerRadialBarChartProps<T>) => {
  const toDegrees = (x: number) => (x * 180) / Math.PI;
  const theme = useTheme();
  const gradients = useGradients(name);

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip<string>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const handleMouseOver = useCallback(
    (event: MouseEvent, data: T) => {
      const target = event.target as SVGElement;
      const coords = localPoint(target.ownerSVGElement!, event);
      showTooltip({
        tooltipLeft: coords?.x,
        tooltipTop: coords?.y,
        tooltipData: tooltipAccessor(data),
      });
    },
    [data, tooltipAccessor],
  );

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const radiusMax = Math.min(xMax, yMax) / 2;
  const innerRadius = radiusMax / 3;

  const xScale = scaleBand<string>({
    range: [0, 2 * Math.PI],
    domain: data.map(xAccessor),
  });

  const yScale = scaleRadial<number>({
    range: [innerRadius, radiusMax],
    domain: [0, Math.max(...data.map(yAccessor))],
  });

  return width < 10 ? null : (
    <svg ref={containerRef} width={width} height={height}>
      {gradients.background.gradient}
      <rect width={width} height={height} fill="url(#radial-bars-green)" rx={14} />
      <Group top={yMax / 2 + margin.top} left={xMax / 2 + margin.left}>
        {data.map((d) => {
          const xVal = xAccessor(d);
          const startAngle = xScale(xVal) ?? 0;
          const midAngle = startAngle + xScale.bandwidth() / 2;
          const endAngle = startAngle + xScale.bandwidth();
          const outerRadius = yScale(yAccessor(d)) ?? 0;

          // convert polar coordinates to cartesian for drawing labels
          const textRadius = outerRadius + 4;
          const textX = textRadius * Math.cos(midAngle - Math.PI / 2);
          const textY = textRadius * Math.sin(midAngle - Math.PI / 2);

          return (
            <>
              <Arc
                key={`bar-${xVal}`}
                cornerRadius={3}
                startAngle={startAngle}
                endAngle={endAngle}
                outerRadius={outerRadius}
                innerRadius={innerRadius}
                fill={shade(0.5, theme.colors.primary)}
                stroke={theme.colors.primary}
                onMouseOver={(e) => handleMouseOver(e, d)}
                onMouseOut={hideTooltip}
                onMouseLeave={hideTooltip}
                style={{ cursor: 'pointer' }}
              />
              <Text
                x={textX}
                y={textY}
                dominantBaseline="end"
                textAnchor="middle"
                fontSize={theme.fontSize.small}
                fontWeight="bold"
                fill={theme.colors.text}
                angle={toDegrees(midAngle)}
              >
                {xVal}
              </Text>
            </>
          );
        })}
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
