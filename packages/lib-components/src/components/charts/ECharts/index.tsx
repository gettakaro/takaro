import { useEffect, useRef, FC } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  PolarComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption } from 'echarts';
import { ParentSize } from '@visx/responsive';
import { useTheme } from '../../../hooks';
import { shade, lighten } from 'polished';

// Register required components
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  PolarComponent,
  CanvasRenderer,
]);

export interface EChartsProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  loading?: boolean;
  notMerge?: boolean;
  lazyUpdate?: boolean;
  onChartReady?: (instance: any) => void;
  onEvents?: Record<string, (params: any) => void>;
}

const createTheme = (isDark: boolean, colors: any) => {
  const backgroundColor = isDark ? colors.background : colors.background;
  const textColor = isDark ? colors.text : colors.text;
  const axisLineColor = isDark ? colors.backgroundAccent : colors.backgroundAlt;

  return {
    color: [
      colors.primary,
      colors.success,
      colors.warning,
      colors.error,
      colors.info,
      lighten(0.1, colors.primary),
      shade(0.2, colors.success),
      lighten(0.1, colors.warning),
    ],
    backgroundColor: backgroundColor,
    textStyle: {
      color: textColor,
    },
    title: {
      textStyle: {
        color: textColor,
      },
      subtextStyle: {
        color: colors.textAlt,
      },
    },
    line: {
      itemStyle: {
        borderWidth: 1,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 4,
      symbol: 'circle',
      smooth: true,
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisLabel: {
        show: true,
        color: textColor,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [axisLineColor],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [backgroundColor],
        },
      },
    },
    valueAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisLabel: {
        show: true,
        color: textColor,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [axisLineColor],
          type: 'dashed',
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [backgroundColor],
        },
      },
    },
    logAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisLabel: {
        show: true,
        color: textColor,
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [axisLineColor],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [backgroundColor],
        },
      },
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisLabel: {
        show: true,
        color: textColor,
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [axisLineColor],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [backgroundColor],
        },
      },
    },
    toolbox: {
      iconStyle: {
        borderColor: textColor,
      },
      emphasis: {
        iconStyle: {
          borderColor: colors.primary,
        },
      },
    },
    legend: {
      textStyle: {
        color: textColor,
      },
    },
    tooltip: {
      backgroundColor: isDark ? colors.backgroundAlt : colors.white,
      borderColor: axisLineColor,
      borderWidth: 1,
      textStyle: {
        color: textColor,
      },
      axisPointer: {
        lineStyle: {
          color: axisLineColor,
          width: 1,
        },
        crossStyle: {
          color: axisLineColor,
          width: 1,
        },
      },
    },
    timeline: {
      lineStyle: {
        color: axisLineColor,
        width: 1,
      },
      itemStyle: {
        color: colors.primary,
        borderWidth: 1,
      },
      controlStyle: {
        color: axisLineColor,
        borderColor: axisLineColor,
        borderWidth: 0.5,
      },
      checkpointStyle: {
        color: colors.primary,
        borderColor: colors.primary,
      },
      label: {
        color: textColor,
      },
      emphasis: {
        itemStyle: {
          color: colors.primary,
        },
        controlStyle: {
          color: axisLineColor,
          borderColor: axisLineColor,
          borderWidth: 0.5,
        },
        label: {
          color: textColor,
        },
      },
    },
    visualMap: {
      textStyle: {
        color: textColor,
      },
    },
    dataZoom: {
      backgroundColor: 'transparent',
      dataBackgroundColor: isDark ? colors.backgroundAccent : colors.backgroundAlt,
      fillerColor: isDark ? 'rgba(102, 77, 229, 0.2)' : 'rgba(102, 77, 229, 0.15)',
      handleColor: colors.primary,
      handleSize: '100%',
      textStyle: {
        color: textColor,
      },
    },
    markPoint: {
      label: {
        color: backgroundColor,
      },
      emphasis: {
        label: {
          color: backgroundColor,
        },
      },
    },
  };
};

export const EChartsBase: FC<EChartsProps> = ({
  option,
  style,
  className,
  loading = false,
  notMerge = false,
  lazyUpdate = true,
  onChartReady,
  onEvents,
}) => {
  const theme = useTheme();
  const chartRef = useRef<any>(null);
  const themeNameRef = useRef<string>('');

  useEffect(() => {
    const isDark = theme.name === 'dark';
    const themeName = `takaro_${theme.name}`;

    // Only register theme if it hasn't been registered or theme changed
    if (themeNameRef.current !== themeName) {
      const themeConfig = createTheme(isDark, theme.colors);
      echarts.registerTheme(themeName, themeConfig);
      themeNameRef.current = themeName;
    }
  }, [theme]);

  return (
    <ReactEChartsCore
      ref={chartRef}
      echarts={echarts}
      option={option}
      style={style}
      className={className}
      theme={`takaro_${theme.name}`}
      notMerge={notMerge}
      lazyUpdate={lazyUpdate}
      showLoading={loading}
      onChartReady={onChartReady}
      onEvents={onEvents}
    />
  );
};

export const ECharts: FC<Omit<EChartsProps, 'style'>> = (props) => {
  return (
    <ParentSize>
      {(parent) => <EChartsBase {...props} style={{ width: parent.width, height: parent.height }} />}
    </ParentSize>
  );
};
