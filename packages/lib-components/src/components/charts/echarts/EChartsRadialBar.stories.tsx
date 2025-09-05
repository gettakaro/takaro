import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsRadialBar, EChartsRadialBarProps } from './EChartsRadialBar';
import { styled } from '../../../styled';
import { Card } from '../../../components';
import { faker } from '@faker-js/faker';

export default {
  title: 'Charts/ECharts/RadialBar',
  component: EChartsRadialBar,
  args: {
    showLegend: true,
    title: 'Radial Bar Chart',
    angleAxis: true,
  },
} as Meta<EChartsRadialBarProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface CategoryData {
  category: string;
  value: number;
}

// Generate sample category data
function generateCategoryData(): CategoryData[] {
  return [
    { category: 'Weapons', value: faker.number.int({ min: 50, max: 150 }) },
    { category: 'Armor', value: faker.number.int({ min: 40, max: 120 }) },
    { category: 'Consumables', value: faker.number.int({ min: 60, max: 180 }) },
    { category: 'Materials', value: faker.number.int({ min: 30, max: 100 }) },
    { category: 'Special', value: faker.number.int({ min: 20, max: 80 }) },
  ];
}

export const Default: StoryFn<EChartsRadialBarProps<CategoryData>> = (args) => {
  const data = generateCategoryData();

  return (
    <Wrapper>
      <EChartsRadialBar<CategoryData>
        {...args}
        data={data}
        nameAccessor={(d) => d.category}
        valueAccessor={(d) => d.value}
        seriesName="Sales"
      />
    </Wrapper>
  );
};

export const CategoryPerformance: StoryFn = () => {
  const categories = [
    { category: 'Building', value: 85 },
    { category: 'Combat', value: 120 },
    { category: 'Exploration', value: 95 },
    { category: 'Crafting', value: 110 },
    { category: 'Trading', value: 75 },
    { category: 'Farming', value: 60 },
  ];

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Category Performance" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsRadialBar
              data={categories}
              nameAccessor={(d) => d.category}
              valueAccessor={(d) => d.value}
              seriesName="Performance Score"
              showLegend={false}
              radius={['25%', '75%']}
              tooltipFormatter={(params: any) => {
                return `${params.name}<br/>Score: ${params.value}`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};

export const SmallRadius: StoryFn<EChartsRadialBarProps<CategoryData>> = (args) => {
  const data = generateCategoryData().slice(0, 4);

  return (
    <Wrapper>
      <EChartsRadialBar<CategoryData>
        {...args}
        data={data}
        nameAccessor={(d) => d.category}
        valueAccessor={(d) => d.value}
        seriesName="Inventory"
        title="Stock Levels"
        subtitle="Current inventory status"
        radius={['40%', '60%']}
      />
    </Wrapper>
  );
};

export const AlternateAxis: StoryFn<EChartsRadialBarProps<CategoryData>> = (args) => {
  const data = generateCategoryData();

  return (
    <Wrapper>
      <EChartsRadialBar<CategoryData>
        {...args}
        data={data}
        nameAccessor={(d) => d.category}
        valueAccessor={(d) => d.value}
        seriesName="Distribution"
        angleAxis={false}
        title="Resource Distribution"
      />
    </Wrapper>
  );
};
