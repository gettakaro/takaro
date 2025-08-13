import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ECharts, EChartsProps } from '../ECharts';
import { styled } from '../../../styled';
import { EChartsOption } from 'echarts';

export default {
  title: 'Charts/ECharts/Pie',
  component: ECharts,
} as Meta<EChartsProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
  padding: 20px;
`;

const generatePieData = () => [
  { value: 1048, name: 'Search Engine' },
  { value: 735, name: 'Direct' },
  { value: 580, name: 'Email' },
  { value: 484, name: 'Union Ads' },
  { value: 300, name: 'Video Ads' },
];

export const BasicPie: StoryFn<EChartsProps> = () => {
  const data = generatePieData();

  const option: EChartsOption = {
    title: {
      text: 'Traffic Sources',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Traffic Source',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
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

export const DonutChart: StoryFn<EChartsProps> = () => {
  const data = generatePieData();

  const option: EChartsOption = {
    title: {
      text: 'Revenue Distribution',
      subtext: 'Q4 2024',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 10,
      left: 'center',
      orient: 'horizontal',
    },
    series: [
      {
        name: 'Revenue',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const RoseChart: StoryFn<EChartsProps> = () => {
  const data = [
    { value: 40, name: 'Product A' },
    { value: 38, name: 'Product B' },
    { value: 32, name: 'Product C' },
    { value: 30, name: 'Product D' },
    { value: 28, name: 'Product E' },
    { value: 26, name: 'Product F' },
    { value: 22, name: 'Product G' },
    { value: 18, name: 'Product H' },
  ];

  const option: EChartsOption = {
    title: {
      text: 'Product Performance',
      subtext: 'Rose Diagram',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      left: 'center',
      bottom: 10,
      orient: 'horizontal',
    },
    series: [
      {
        name: 'Performance',
        type: 'pie',
        radius: [20, 140],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8,
        },
        data: data,
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const HalfDonut: StoryFn<EChartsProps> = () => {
  const data = [
    { value: 335, name: 'Category A' },
    { value: 310, name: 'Category B' },
    { value: 234, name: 'Category C' },
    { value: 135, name: 'Category D' },
    { value: 148, name: 'Category E' },
    {
      value: 335 + 310 + 234 + 135 + 148,
      itemStyle: {
        color: 'none',
        decal: {
          symbol: 'none',
        },
      },
      label: {
        show: false,
      },
    },
  ];

  const option: EChartsOption = {
    title: {
      text: 'Gauge Style Pie',
      left: 'center',
      top: '20%',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.name) {
          return `${params.seriesName} <br/>${params.name}: ${params.value} (${params.percent}%)`;
        }
        return '';
      },
    },
    legend: {
      bottom: 10,
      left: 'center',
      orient: 'horizontal',
      data: ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'],
    },
    series: [
      {
        name: 'Metrics',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '60%'],
        startAngle: 180,
        endAngle: 360,
        data: data,
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};

export const NestedPie: StoryFn<EChartsProps> = () => {
  const innerData = [
    { value: 1548, name: 'Technology' },
    { value: 735, name: 'Design' },
    { value: 510, name: 'Marketing' },
    { value: 434, name: 'Sales' },
    { value: 335, name: 'Support' },
  ];

  const outerData = [
    { value: 600, name: 'Frontend' },
    { value: 500, name: 'Backend' },
    { value: 448, name: 'DevOps' },
    { value: 400, name: 'UI/UX' },
    { value: 335, name: 'Graphics' },
    { value: 310, name: 'Digital Marketing' },
    { value: 200, name: 'Content' },
    { value: 234, name: 'B2B Sales' },
    { value: 200, name: 'B2C Sales' },
    { value: 235, name: 'Customer Service' },
    { value: 100, name: 'Technical Support' },
  ];

  const option: EChartsOption = {
    title: {
      text: 'Department Structure',
      subtext: 'Nested Pie Chart',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    series: [
      {
        name: 'Department',
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '30%'],
        label: {
          position: 'inner',
          fontSize: 14,
        },
        labelLine: {
          show: false,
        },
        data: innerData,
      },
      {
        name: 'Team',
        type: 'pie',
        radius: ['45%', '60%'],
        labelLine: {
          length: 30,
        },
        label: {
          formatter: '{b}: {d}%',
        },
        data: outerData,
      },
    ],
  };

  return (
    <Wrapper>
      <ECharts option={option} />
    </Wrapper>
  );
};
