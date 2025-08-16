import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';

export interface EChartsLineProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  xAccessor: (d: T) => string | number | Date;
  yAccessor: (d: T) => number;
  seriesName?: string;
  smooth?: boolean;
  area?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  subtitle?: string;
  tooltipFormatter?: (params: any) => string;
}

export const EChartsLine: FC<EChartsLineProps> = ({
  data,
  xAccessor,
  yAccessor,
  seriesName = 'Value',
  smooth = true,
  area = false,
  showGrid = true,
  showLegend = false,
  xAxisLabel,
  yAxisLabel,
  title,
  subtitle,
  tooltipFormatter,
  ...chartProps
}) => {
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
          areaStyle: area ? {} : undefined,
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
    area,
    showGrid,
    showLegend,
    xAxisLabel,
    yAxisLabel,
    title,
    subtitle,
    tooltipFormatter,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
