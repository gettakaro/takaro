import { FC, useMemo } from 'react';
import { EChartsOption } from 'echarts';
import { ResponsiveECharts, EChartsBaseProps } from './EChartsBase';

export interface EChartsPieProps<T = any> extends Omit<EChartsBaseProps, 'option'> {
  data: T[];
  nameAccessor: (d: T) => string;
  valueAccessor: (d: T) => number;
  seriesName?: string;
  donut?: boolean;
  roseType?: boolean | 'radius' | 'area';
  showLegend?: boolean;
  showLabel?: boolean;
  title?: string;
  subtitle?: string;
  radius?: string | [string, string];
  center?: [string, string];
  tooltipFormatter?: (params: any) => string;
  legendOrient?: 'horizontal' | 'vertical';
  legendLeft?: string | number;
  legendTop?: string | number;
}

export const EChartsPie: FC<EChartsPieProps> = ({
  data,
  nameAccessor,
  valueAccessor,
  seriesName = 'Value',
  donut = false,
  roseType = false,
  showLegend = true,
  showLabel = false,
  title,
  subtitle,
  radius,
  center = ['50%', '50%'],
  tooltipFormatter,
  legendOrient = 'vertical',
  legendLeft = 'left',
  legendTop = 'middle',
  ...chartProps
}) => {
  const option: EChartsOption = useMemo(() => {
    const pieData = data.map((d) => ({
      name: nameAccessor(d),
      value: valueAccessor(d),
    }));

    const defaultRadius = donut ? ['40%', '70%'] : '70%';
    const actualRadius = radius || defaultRadius;

    const series: any = {
      name: seriesName,
      type: 'pie',
      radius: actualRadius,
      center: center,
      data: pieData,
      label: showLabel
        ? {
            show: true,
            formatter: '{b}: {d}%',
          }
        : {
            show: false,
          },
      labelLine: {
        show: showLabel,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    };

    // Only add roseType if it's not false
    if (roseType !== false) {
      series.roseType = roseType;
    }

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
            orient: legendOrient,
            left: legendLeft,
            top: legendTop,
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        formatter: tooltipFormatter || '{a} <br/>{b}: {c} ({d}%)',
      },
      series: [series],
    };
  }, [
    data,
    nameAccessor,
    valueAccessor,
    seriesName,
    donut,
    roseType,
    showLegend,
    showLabel,
    title,
    subtitle,
    radius,
    center,
    tooltipFormatter,
    legendOrient,
    legendLeft,
    legendTop,
  ]);

  return <ResponsiveECharts option={option} {...chartProps} />;
};
