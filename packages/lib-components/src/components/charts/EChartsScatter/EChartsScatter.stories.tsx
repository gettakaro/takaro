import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ECharts, EChartsProps } from '../ECharts';
import { styled } from '../../../styled';
import { EChartsOption } from 'echarts';

export default {
  title: 'Charts/ECharts/Scatter',
  component: ECharts,
} as Meta<EChartsProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
  padding: 20px;
`;

const generateScatterData = (count: number = 50) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push([Math.random() * 100, Math.random() * 100]);
  }
  return data;
};

const generateCorrelationData = (count: number = 100) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = x + (Math.random() - 0.5) * 30;
    data.push([x, Math.max(0, Math.min(100, y))]);
  }
  return data;
};

const generateBubbleData = (count: number = 30) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push([Math.random() * 100, Math.random() * 100, Math.random() * 100]);
  }
  return data;
};

export const BasicScatter: StoryFn<EChartsProps> = () => {
  const data = generateScatterData();

  const option: EChartsOption = {
    title: {
      text: 'Basic Scatter Plot',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(2)}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'X Axis',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      type: 'value',
      name: 'Y Axis',
      nameLocation: 'middle',
      nameGap: 40,
    },
    series: [
      {
        name: 'Data Points',
        type: 'scatter',
        data: data,
        emphasis: {
          focus: 'self',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const CorrelationScatter: StoryFn<EChartsProps> = () => {
  const data1 = generateCorrelationData();
  const data2 = generateCorrelationData().map(([x, y]) => [x, 100 - y + (Math.random() - 0.5) * 20]);

  const option: EChartsOption = {
    title: {
      text: 'Correlation Analysis',
      subtext: 'Positive vs Negative Correlation',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.seriesName}<br/>X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(2)}`;
      },
    },
    legend: {
      data: ['Positive Correlation', 'Negative Correlation'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Independent Variable',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      type: 'value',
      name: 'Dependent Variable',
      nameLocation: 'middle',
      nameGap: 40,
    },
    series: [
      {
        name: 'Positive Correlation',
        type: 'scatter',
        data: data1,
        emphasis: {
          focus: 'series',
        },
      },
      {
        name: 'Negative Correlation',
        type: 'scatter',
        data: data2,
        emphasis: {
          focus: 'series',
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const BubbleChart: StoryFn<EChartsProps> = () => {
  const data = generateBubbleData();

  const option: EChartsOption = {
    title: {
      text: 'Bubble Chart',
      subtext: 'Size Represents Third Dimension',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(2)}<br/>Size: ${params.value[2].toFixed(2)}`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Performance',
      nameLocation: 'middle',
      nameGap: 30,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: 'Efficiency',
      nameLocation: 'middle',
      nameGap: 40,
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'Metrics',
        type: 'scatter',
        data: data,
        symbolSize: (value: number[]) => {
          return Math.sqrt(value[2]) * 3;
        },
        emphasis: {
          focus: 'self',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        itemStyle: {
          opacity: 0.8,
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const MultipleBubbleSeries: StoryFn<EChartsProps> = () => {
  const generateCategoryData = () => generateBubbleData(20);

  const option: EChartsOption = {
    title: {
      text: 'Product Comparison',
      subtext: 'Price vs Quality vs Market Share',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.seriesName}<br/>Price: $${params.value[0].toFixed(0)}<br/>Quality: ${params.value[1].toFixed(0)}%<br/>Market Share: ${params.value[2].toFixed(0)}%`;
      },
    },
    legend: {
      data: ['Electronics', 'Clothing', 'Food', 'Services'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Price ($)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: 100,
    },
    yAxis: {
      type: 'value',
      name: 'Quality Score (%)',
      nameLocation: 'middle',
      nameGap: 40,
      min: 0,
      max: 100,
    },
    series: [
      {
        name: 'Electronics',
        type: 'scatter',
        data: generateCategoryData(),
        symbolSize: (value: number[]) => Math.sqrt(value[2]) * 4,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.7,
        },
      },
      {
        name: 'Clothing',
        type: 'scatter',
        data: generateCategoryData(),
        symbolSize: (value: number[]) => Math.sqrt(value[2]) * 4,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.7,
        },
      },
      {
        name: 'Food',
        type: 'scatter',
        data: generateCategoryData(),
        symbolSize: (value: number[]) => Math.sqrt(value[2]) * 4,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.7,
        },
      },
      {
        name: 'Services',
        type: 'scatter',
        data: generateCategoryData(),
        symbolSize: (value: number[]) => Math.sqrt(value[2]) * 4,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.7,
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const ScatterWithRegression: StoryFn<EChartsProps> = () => {
  const data = generateCorrelationData(50);

  // Simple linear regression
  const n = data.length;
  const sumX = data.reduce((acc, [x]) => acc + x, 0);
  const sumY = data.reduce((acc, [, y]) => acc + y, 0);
  const sumXY = data.reduce((acc, [x, y]) => acc + x * y, 0);
  const sumX2 = data.reduce((acc, [x]) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const regressionLine = [
    [0, intercept],
    [100, slope * 100 + intercept],
  ];

  const option: EChartsOption = {
    title: {
      text: 'Scatter with Trend Line',
      subtext: 'Linear Regression Analysis',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesName === 'Trend Line') {
          return 'Trend Line';
        }
        return `Data Point<br/>X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(2)}`;
      },
    },
    legend: {
      data: ['Data Points', 'Trend Line'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'X Variable',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      type: 'value',
      name: 'Y Variable',
      nameLocation: 'middle',
      nameGap: 40,
    },
    series: [
      {
        name: 'Data Points',
        type: 'scatter',
        data: data,
        emphasis: {
          focus: 'self',
        },
      },
      {
        name: 'Trend Line',
        type: 'line',
        data: regressionLine,
        lineStyle: {
          type: 'dashed',
          width: 2,
        },
        symbol: 'none',
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const DensityScatter: StoryFn<EChartsProps> = () => {
  const generateClusterData = (centerX: number, centerY: number, count: number) => {
    const data = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20;
      data.push([centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius]);
    }
    return data;
  };

  const cluster1 = generateClusterData(30, 30, 150);
  const cluster2 = generateClusterData(70, 70, 150);
  const cluster3 = generateClusterData(30, 70, 100);
  const cluster4 = generateClusterData(70, 30, 100);

  const option: EChartsOption = {
    title: {
      text: 'Cluster Analysis',
      subtext: 'Density Distribution',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.seriesName}<br/>X: ${params.value[0].toFixed(2)}<br/>Y: ${params.value[1].toFixed(2)}`;
      },
    },
    legend: {
      data: ['Cluster A', 'Cluster B', 'Cluster C', 'Cluster D'],
      bottom: 10,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: 'Feature 1',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: 100,
    },
    yAxis: {
      type: 'value',
      name: 'Feature 2',
      nameLocation: 'middle',
      nameGap: 40,
      min: 0,
      max: 100,
    },
    series: [
      {
        name: 'Cluster A',
        type: 'scatter',
        data: cluster1,
        symbolSize: 3,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.6,
        },
      },
      {
        name: 'Cluster B',
        type: 'scatter',
        data: cluster2,
        symbolSize: 3,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.6,
        },
      },
      {
        name: 'Cluster C',
        type: 'scatter',
        data: cluster3,
        symbolSize: 3,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.6,
        },
      },
      {
        name: 'Cluster D',
        type: 'scatter',
        data: cluster4,
        symbolSize: 3,
        emphasis: {
          focus: 'series',
        },
        itemStyle: {
          opacity: 0.6,
        },
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};
