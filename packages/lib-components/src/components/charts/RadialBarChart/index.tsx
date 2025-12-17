import { MouseEvent, useCallback } from 'react';
import { arc } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleRadial } from '@visx/scale';
import { shade } from 'polished';
import { motion } from 'framer-motion';

import { Margin, InnerChartProps, getDefaultTooltipStyles, TooltipConfig } from '../util';
import { useTheme } from '../../../hooks';
import { ParentSize } from '@visx/responsive';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import localPoint from '@visx/event/lib/localPointGeneric';
import { useGradients } from '../useGradients';
import { EmptyChart } from '../EmptyChart';

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };
export interface RadialBarChartProps<T> {
  name: string;
  data: T[];
  margin?: Margin;
  xAccessor: (d: T) => string;
  yAccessor: (d: T) => number;
  tooltip?: TooltipConfig<T>;
  animate?: boolean;
}

export const RadialBarChart = <T,>({
  xAccessor,
  data,
  margin,
  yAccessor,
  tooltip,
  name,
  animate = true,
}: RadialBarChartProps<T>) => {
  const hasData = data.length > 0;

  return (
    <>
      <ParentSize>
        {hasData
          ? (parent) => (
              <Chart<T>
                name={name}
                data={data}
                width={parent.width}
                height={parent.height}
                margin={margin}
                yAccessor={yAccessor}
                xAccessor={xAccessor}
                tooltip={tooltip}
                animate={animate}
              />
            )
          : () => <EmptyChart />}
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
  tooltip,
  data,
  margin = defaultMargin,
  animate = true,
}: InnerRadialBarChartProps<T>) => {
  const toDegrees = (x: number) => (x * 180) / Math.PI;
  const theme = useTheme();
  const gradients = useGradients(name);

  const tooltipAccessor = tooltip?.accessor;
  const showTooltipEnabled = tooltip?.enabled ?? true;

  const { tooltipData, tooltipLeft, tooltipTop, tooltipOpen, hideTooltip, showTooltip } = useTooltip<string>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const handleMouseOver = useCallback(
    (event: MouseEvent, data: T) => {
      if (!showTooltipEnabled || !tooltipAccessor) return;
      const target = event.target as SVGElement;
      const coords = localPoint(target.ownerSVGElement!, event);
      showTooltip({
        tooltipLeft: coords?.x,
        tooltipTop: coords?.y,
        tooltipData: tooltipAccessor(data),
      });
    },
    [data, tooltipAccessor, showTooltipEnabled],
  );

  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;
  const radiusMax = Math.min(xMax, yMax) / 2;
  const innerRadius = radiusMax / 3;

  const centerX = margin.left + xMax / 2;
  const centerY = margin.top + yMax / 2;

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
      <Group top={centerY} left={centerX}>
        {data.map((d, index) => {
          const xVal = xAccessor(d);
          const startAngle = xScale(xVal) ?? 0;
          const midAngle = startAngle + xScale.bandwidth() / 2;
          const endAngle = startAngle + xScale.bandwidth();
          const outerRadius = yScale(yAccessor(d)) ?? 0;

          const arcGenerator = arc<{
            innerRadius: number;
            outerRadius: number;
            startAngle: number;
            endAngle: number;
          }>({
            cornerRadius: 3,
          });

          // Generate path data for static path
          const pathData = arcGenerator({
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
          });

          // convert polar coordinates to cartesian for drawing labels
          const textRadius = outerRadius + 4;
          const textX = textRadius * Math.cos(midAngle - Math.PI / 2);
          const textY = textRadius * Math.sin(midAngle - Math.PI / 2);

          return (
            <g key={`bar-${xVal}`}>
              <motion.path
                d={pathData ?? undefined}
                fill={shade(0.5, theme.colors.primary)}
                stroke={theme.colors.primary}
                onMouseOver={(e) => handleMouseOver(e, d)}
                onMouseOut={hideTooltip}
                onMouseLeave={hideTooltip}
                style={{ cursor: 'pointer' }}
                initial={
                  animate
                    ? {
                        d:
                          arcGenerator({
                            startAngle,
                            endAngle,
                            innerRadius,
                            outerRadius: innerRadius,
                          }) ?? undefined,
                      }
                    : {
                        d: pathData ?? undefined,
                      }
                }
                animate={{
                  d: pathData ?? undefined,
                }}
                transition={
                  animate
                    ? {
                        duration: 0.2,
                        delay: index * 0.1,
                        ease: 'easeOut',
                      }
                    : { duration: 0 }
                }
              />
              <motion.text
                x={textX}
                y={textY}
                dominantBaseline="end"
                textAnchor="middle"
                fontSize={theme.fontSize.small}
                fontWeight="bold"
                fill={theme.colors.text}
                transform={`rotate(${toDegrees(midAngle)} ${textX} ${textY})`}
                initial={animate ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={
                  animate
                    ? {
                        duration: 0.3,
                        delay: index * 0.1 + 0.3,
                        ease: 'easeOut',
                      }
                    : { duration: 0 }
                }
              >
                {xVal}
              </motion.text>
            </g>
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
