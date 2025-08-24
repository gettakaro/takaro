import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';
import { useTheme } from '../../../hooks';

export interface EChartsAreaProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  xAccessor: (d: T) => string | number | Date;
  yAccessor: (d: T) => number;
  seriesName?: string;
  smooth?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  subtitle?: string;
  gradient?: boolean;
  tooltipFormatter?: (params: any) => string;
  stack?: boolean;
}

export const EChartsArea: FC<EChartsAreaProps> = ({
  data,
  xAccessor,
  yAccessor,
  seriesName = 'Value',
  smooth = true,
  showGrid = true,
  showLegend = false,
  xAxisLabel,
  yAxisLabel,
  title,
  subtitle,
  gradient = true,
  tooltipFormatter,
  stack = false,
  ...chartProps
}) => {
  const theme = useTheme();

  const option: EChartsOption = useMemo(() => {
    const xData = data.map(xAccessor);
    const yData = data.map(yAccessor);

    return {
      title: title
        ? {
            text: title,
            subtext: subtitle,
            left: 'center',
          }
        : undefined,
      legend: showLegend
        ? {
            data: [seriesName],
            top: 30,
          }
        : undefined,
      grid: showGrid
        ? {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        formatter: tooltipFormatter,
      },
      xAxis: {
        type: 'category',
        data: xData,
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: 30,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: 50,
      },
      series: [
        {
          name: seriesName,
          type: 'line',
          data: yData,
          smooth: smooth,
          stack: stack ? 'total' : undefined,
          areaStyle: gradient
            ? {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: theme.colors.primary + '80', // 50% opacity
                    },
                    {
                      offset: 1,
                      color: theme.colors.primary + '10', // 6% opacity
                    },
                  ],
                },
              }
            : {},
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
  }, [
    data,
    xAccessor,
    yAccessor,
    seriesName,
    smooth,
    showGrid,
    showLegend,
    xAxisLabel,
    yAxisLabel,
    title,
    subtitle,
    gradient,
    tooltipFormatter,
    stack,
    theme,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
