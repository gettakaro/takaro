import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsArea, EChartsAreaProps } from './EChartsArea';
import { styled } from '../../../styled';
import { Card } from '../../../components';
import { faker } from '@faker-js/faker';

export default {
  title: 'Charts/ECharts/Area',
  component: EChartsArea,
  args: {
    smooth: true,
    gradient: true,
    showGrid: true,
    showLegend: true,
    xAxisLabel: 'Date',
    yAxisLabel: 'Revenue ($)',
    title: 'Area Chart Example',
  },
} as Meta<EChartsAreaProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface RevenueData {
  date: string;
  revenue: number;
}

// Generate sample revenue data
function generateRevenueData(days: number = 30): RevenueData[] {
  const data: RevenueData[] = [];
  const now = new Date();
  const baseValue = 1000;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Add some realistic variation
    const dayOfWeek = date.getDay();
    const weekendBonus = dayOfWeek === 0 || dayOfWeek === 6 ? 300 : 0;
    const randomVariation = faker.number.int({ min: -200, max: 400 });
    const trendGrowth = i * 5; // Slight upward trend

    data.push({
      date: date.toLocaleDateString(),
      revenue: baseValue + weekendBonus + randomVariation + trendGrowth,
    });
  }

  return data;
}

export const Default: StoryFn<EChartsAreaProps<RevenueData>> = (args) => {
  const data = generateRevenueData();

  return (
    <Wrapper>
      <EChartsArea<RevenueData>
        {...args}
        data={data}
        xAccessor={(d) => d.date}
        yAccessor={(d) => d.revenue}
        seriesName="Daily Revenue"
      />
    </Wrapper>
  );
};

export const NoGradient: StoryFn<EChartsAreaProps<RevenueData>> = (args) => {
  const data = generateRevenueData();

  return (
    <Wrapper>
      <EChartsArea<RevenueData>
        {...args}
        data={data}
        xAccessor={(d) => d.date}
        yAccessor={(d) => d.revenue}
        seriesName="Revenue"
        gradient={false}
        title="Revenue Trend"
        subtitle="Solid fill area chart"
      />
    </Wrapper>
  );
};

export const ShopAnalytics: StoryFn = () => {
  const data = generateRevenueData(90);

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Revenue Over Time" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsArea
              data={data}
              xAccessor={(d) => d.date}
              yAccessor={(d) => d.revenue}
              seriesName="Revenue"
              smooth={true}
              gradient={true}
              showGrid={true}
              yAxisLabel="Revenue ($)"
              tooltipFormatter={(params: any) => {
                const value = params[0].value;
                return `${params[0].name}<br/>Revenue: $${value.toLocaleString()}`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};

export const StackedArea: StoryFn<EChartsAreaProps<RevenueData>> = (args) => {
  const data = generateRevenueData(20);

  return (
    <Wrapper>
      <EChartsArea<RevenueData>
        {...args}
        data={data}
        xAccessor={(d) => d.date}
        yAccessor={(d) => d.revenue}
        seriesName="Product Sales"
        stack={true}
        title="Stacked Revenue"
        subtitle="Multiple product categories"
      />
    </Wrapper>
  );
};
