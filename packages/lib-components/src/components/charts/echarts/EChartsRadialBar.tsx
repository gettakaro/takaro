import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';

export interface EChartsRadialBarProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  nameAccessor: (d: T) => string;
  valueAccessor: (d: T) => number;
  seriesName?: string;
  showLegend?: boolean;
  showLabel?: boolean;
  title?: string;
  subtitle?: string;
  tooltipFormatter?: (params: any) => string;
  radius?: [string, string];
  angleAxis?: boolean;
}

export const EChartsRadialBar: FC<EChartsRadialBarProps> = ({
  data,
  nameAccessor,
  valueAccessor,
  seriesName = 'Value',
  showLegend = true,
  showLabel = false,
  title,
  subtitle,
  tooltipFormatter,
  radius = ['30%', '80%'],
  angleAxis = true,
  ...chartProps
}) => {
  const option: EChartsOption = useMemo(() => {
    const categories = data.map(nameAccessor);
    const values = data.map(valueAccessor);
    const maxValue = Math.max(...values);

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
            show: true,
            top: 'bottom',
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        formatter: tooltipFormatter,
      },
      polar: {
        radius: radius,
      },
      radiusAxis: angleAxis
        ? {
            type: 'category',
            data: categories,
            z: 10,
          }
        : {
            max: maxValue * 1.1,
          },
      angleAxis: angleAxis
        ? {
            max: maxValue * 1.1,
          }
        : {
            type: 'category',
            data: categories,
          },
      series: [
        {
          name: seriesName,
          type: 'bar',
          data: values.map((value, index) => ({
            value,
            name: categories[index],
            itemStyle: {
              opacity: 0.9,
            },
          })),
          coordinateSystem: 'polar',
          label: showLabel
            ? {
                show: true,
                position: 'middle',
                formatter: '{b}: {c}',
              }
            : {
                show: false,
              },
          emphasis: {
            focus: 'series',
          },
        },
      ],
    };
  }, [
    data,
    nameAccessor,
    valueAccessor,
    seriesName,
    showLegend,
    showLabel,
    title,
    subtitle,
    tooltipFormatter,
    radius,
    angleAxis,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
