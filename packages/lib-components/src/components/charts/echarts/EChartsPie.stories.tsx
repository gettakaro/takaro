import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsPie, EChartsPieProps } from './EChartsPie';
import { styled } from '../../../styled';
import { Card } from '../../../components';
import { faker } from '@faker-js/faker';

export default {
  title: 'Charts/ECharts/Pie',
  component: EChartsPie,
  args: {
    donut: false,
    showLegend: true,
    showLabel: true,
    title: 'Pie Chart Example',
  },
} as Meta<EChartsPieProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface SegmentData {
  category: string;
  count: number;
}

// Generate sample segment data
function generateSegmentData(): SegmentData[] {
  return [
    { category: 'New Players', count: faker.number.int({ min: 100, max: 300 }) },
    { category: 'Regular Players', count: faker.number.int({ min: 200, max: 500 }) },
    { category: 'VIP Players', count: faker.number.int({ min: 50, max: 150 }) },
    { category: 'Inactive', count: faker.number.int({ min: 30, max: 100 }) },
  ];
}

export const Default: StoryFn<EChartsPieProps<SegmentData>> = (args) => {
  const data = generateSegmentData();

  return (
    <Wrapper>
      <EChartsPie<SegmentData>
        {...args}
        data={data}
        nameAccessor={(d) => d.category}
        valueAccessor={(d) => d.count}
        seriesName="Player Segments"
      />
    </Wrapper>
  );
};

export const DonutChart: StoryFn<EChartsPieProps<SegmentData>> = (args) => {
  const data = generateSegmentData();

  return (
    <Wrapper>
      <EChartsPie<SegmentData>
        {...args}
        data={data}
        nameAccessor={(d) => d.category}
        valueAccessor={(d) => d.count}
        seriesName="Distribution"
        donut={true}
        title="Customer Segments"
        subtitle="Based on purchase frequency"
      />
    </Wrapper>
  );
};

export const RoseChart: StoryFn<EChartsPieProps<SegmentData>> = (args) => {
  const categories = [
    { category: 'Monday', count: 120 },
    { category: 'Tuesday', count: 200 },
    { category: 'Wednesday', count: 150 },
    { category: 'Thursday', count: 180 },
    { category: 'Friday', count: 290 },
    { category: 'Saturday', count: 330 },
    { category: 'Sunday', count: 310 },
  ];

  return (
    <Wrapper>
      <EChartsPie
        {...args}
        data={categories}
        nameAccessor={(d) => d.category}
        valueAccessor={(d) => d.count}
        seriesName="Activity by Day"
        roseType="radius"
        title="Weekly Activity Distribution"
        showLegend={false}
      />
    </Wrapper>
  );
};

export const OrderStatusDistribution: StoryFn = () => {
  const orderStatus = [
    { category: 'Completed', count: 450 },
    { category: 'Paid', count: 120 },
    { category: 'Pending', count: 80 },
    { category: 'Cancelled', count: 35 },
  ];

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Order Status Distribution" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsPie
              data={orderStatus}
              nameAccessor={(d) => d.category}
              valueAccessor={(d) => d.count}
              seriesName="Orders"
              donut={true}
              radius={['45%', '75%']}
              tooltipFormatter={(params: any) => {
                return `${params.seriesName}<br/>${params.name}: ${params.value} (${params.percent}%)`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};
