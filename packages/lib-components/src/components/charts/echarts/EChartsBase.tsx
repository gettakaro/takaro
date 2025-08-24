import { FC, useEffect, useRef, useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  PolarComponent,
} from 'echarts/components';
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  TreeChart,
  TreemapChart,
  GraphChart,
  GaugeChart,
  FunnelChart,
  ParallelChart,
  SankeyChart,
  BoxplotChart,
  CandlestickChart,
  EffectScatterChart,
  LinesChart,
  HeatmapChart,
  PictorialBarChart,
  ThemeRiverChart,
  SunburstChart,
  CustomChart,
} from 'echarts/charts';
import { useTheme } from '../../../hooks';
import { ParentSize } from '@visx/responsive';
import { EChartsOption } from 'echarts';

// Register all components
echarts.use([
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkLineComponent,
  MarkPointComponent,
  MarkAreaComponent,
  PolarComponent,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  MapChart,
  TreeChart,
  TreemapChart,
  GraphChart,
  GaugeChart,
  FunnelChart,
  ParallelChart,
  SankeyChart,
  BoxplotChart,
  CandlestickChart,
  EffectScatterChart,
  LinesChart,
  HeatmapChart,
  PictorialBarChart,
  ThemeRiverChart,
  SunburstChart,
  CustomChart,
]);

export interface EChartsBaseProps {
  option: EChartsOption;
  height?: string | number;
  width?: string | number;
  loading?: boolean;
  onChartReady?: (instance: any) => void;
  onEvents?: Record<string, (params: any) => void>;
  style?: React.CSSProperties;
  className?: string;
}

export const EChartsBase: FC<EChartsBaseProps> = ({
  option,
  height = '100%',
  width = '100%',
  loading = false,
  onChartReady,
  onEvents,
  style,
  className,
}) => {
  const theme = useTheme();
  const chartRef = useRef<ReactEChartsCore>(null);

  // Create theme-aware default options
  const themeOptions = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      textStyle: {
        color: theme.colors.text,
        fontFamily: 'inherit',
      },
      title: {
        textStyle: {
          color: theme.colors.text,
          fontSize: 16,
          fontWeight: 'bold',
        },
        subtextStyle: {
          color: theme.colors.textAlt,
          fontSize: 12,
        },
      },
      legend: {
        textStyle: {
          color: theme.colors.text,
        },
        pageTextStyle: {
          color: theme.colors.text,
        },
      },
      tooltip: {
        backgroundColor: theme.colors.backgroundAlt,
        borderColor: theme.colors.backgroundAccent,
        borderWidth: 1,
        textStyle: {
          color: theme.colors.text,
        },
        extraCssText: `box-shadow: ${theme.elevation[200]};`,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        axisLine: {
          lineStyle: {
            color: theme.colors.backgroundAccent,
          },
        },
        axisTick: {
          lineStyle: {
            color: theme.colors.backgroundAccent,
          },
        },
        axisLabel: {
          color: theme.colors.textAlt,
        },
        splitLine: {
          lineStyle: {
            color: theme.colors.backgroundAccent,
            type: 'dashed',
          },
        },
      },
      yAxis: {
        axisLine: {
          lineStyle: {
            color: theme.colors.backgroundAccent,
          },
        },
        axisTick: {
          lineStyle: {
            color: theme.colors.backgroundAccent,
          },
        },
        axisLabel: {
          color: theme.colors.textAlt,
        },
        splitLine: {
          lineStyle: {
            color: theme.colors.backgroundAccent,
            type: 'dashed',
          },
        },
      },
      color: [
        theme.colors.primary,
        theme.colors.success,
        theme.colors.warning,
        theme.colors.error,
        theme.colors.info,
        '#8b5cf6',
        '#06b6d4',
        '#f59e0b',
        '#ec4899',
        '#10b981',
      ],
    };
  }, [theme]);

  // Merge theme options with provided options
  const mergedOptions = useMemo(() => {
    // Check if this is a chart type that doesn't use axes
    const hasNonCartesianChart =
      option.series &&
      Array.isArray(option.series) &&
      option.series.some((s: any) =>
        ['pie', 'radar', 'gauge', 'funnel', 'sankey', 'graph', 'tree', 'treemap', 'sunburst'].includes(s.type),
      );

    // Create adjusted theme options based on chart type
    const adjustedThemeOptions = hasNonCartesianChart
      ? {
          backgroundColor: themeOptions.backgroundColor,
          textStyle: themeOptions.textStyle,
          title: themeOptions.title,
          legend: themeOptions.legend,
          tooltip: themeOptions.tooltip,
          color: themeOptions.color,
        }
      : themeOptions;

    return echarts.util.merge(adjustedThemeOptions, option);
  }, [themeOptions, option]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        const instance = chartRef.current.getEchartsInstance();
        instance.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ReactEChartsCore
      ref={chartRef}
      echarts={echarts}
      option={mergedOptions}
      style={{ height, width, ...style }}
      className={className}
      showLoading={loading}
      onChartReady={onChartReady}
      onEvents={onEvents}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

// Wrapper with ParentSize for responsive sizing
export const ResponsiveECharts: FC<Omit<EChartsBaseProps, 'width' | 'height'>> = (props) => {
  return <ParentSize>{({ width, height }) => <EChartsBase {...props} width={width} height={height} />}</ParentSize>;
};
