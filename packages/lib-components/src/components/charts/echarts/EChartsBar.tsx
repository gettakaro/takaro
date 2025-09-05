import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';

export interface EChartsBarProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  xAccessor: (d: T) => string | number;
  yAccessor: (d: T) => number;
  seriesName?: string;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  subtitle?: string;
  barWidth?: string | number;
  barGap?: string;
  tooltipFormatter?: (params: any) => string;
  colorBy?: 'series' | 'data';
}

export const EChartsBar: FC<EChartsBarProps> = ({
  data,
  xAccessor,
  yAccessor,
  seriesName = 'Value',
  horizontal = false,
  showGrid = true,
  showLegend = false,
  xAxisLabel,
  yAxisLabel,
  title,
  subtitle,
  barWidth,
  barGap = '30%',
  tooltipFormatter,
  colorBy = 'series',
  ...chartProps
}) => {
  const option: EChartsOption = useMemo(() => {
    const categories = data.map(xAccessor);
    const values = data.map(yAccessor);

    const xAxisConfig = {
      type: horizontal ? 'value' : 'category',
      data: horizontal ? undefined : categories,
      name: xAxisLabel,
      nameLocation: 'middle',
      nameGap: 30,
    };

    const yAxisConfig = {
      type: horizontal ? 'category' : 'value',
      data: horizontal ? categories : undefined,
      name: yAxisLabel,
      nameLocation: 'middle',
      nameGap: 50,
    };

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
        axisPointer: {
          type: 'shadow',
        },
        formatter: tooltipFormatter,
      },
      xAxis: xAxisConfig as any,
      yAxis: yAxisConfig as any,
      series: [
        {
          name: seriesName,
          type: 'bar',
          data: values,
          barWidth: barWidth,
          barGap: barGap,
          itemStyle:
            colorBy === 'data'
              ? {
                  color: (params: any) => {
                    const colors = ['#664de5', '#3ccd6A', '#f57c00', '#ff4252', '#06b6d4'];
                    return colors[params.dataIndex % colors.length];
                  },
                }
              : undefined,
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
    horizontal,
    showGrid,
    showLegend,
    xAxisLabel,
    yAxisLabel,
    title,
    subtitle,
    barWidth,
    barGap,
    tooltipFormatter,
    colorBy,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
