import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsBar, EChartsBarProps } from './EChartsBar';
import { styled } from '../../../styled';
import { Card } from '../../../components';
import { faker } from '@faker-js/faker';

export default {
  title: 'Charts/ECharts/Bar',
  component: EChartsBar,
  args: {
    horizontal: false,
    showGrid: true,
    showLegend: true,
    xAxisLabel: 'Category',
    yAxisLabel: 'Value',
    title: 'Bar Chart Example',
    colorBy: 'data',
  },
} as Meta<EChartsBarProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface CategoryData {
  name: string;
  value: number;
}

// Generate sample category data
function generateCategoryData(count: number = 10): CategoryData[] {
  const categories = [
    'Weapons',
    'Armor',
    'Tools',
    'Food',
    'Materials',
    'Potions',
    'Books',
    'Gems',
    'Artifacts',
    'Misc',
  ];

  return categories.slice(0, count).map((name) => ({
    name,
    value: faker.number.int({ min: 10, max: 200 }),
  }));
}

export const Default: StoryFn<EChartsBarProps<CategoryData>> = (args) => {
  const data = generateCategoryData(8);

  return (
    <Wrapper>
      <EChartsBar<CategoryData>
        {...args}
        data={data}
        xAccessor={(d) => d.name}
        yAccessor={(d) => d.value}
        seriesName="Sales"
      />
    </Wrapper>
  );
};

export const HorizontalBar: StoryFn<EChartsBarProps<CategoryData>> = (args) => {
  const data = generateCategoryData(6);

  return (
    <Wrapper>
      <EChartsBar<CategoryData>
        {...args}
        data={data}
        xAccessor={(d) => d.name}
        yAccessor={(d) => d.value}
        seriesName="Inventory"
        horizontal={true}
        title="Item Inventory"
        subtitle="Current stock levels"
        xAxisLabel="Quantity"
        yAxisLabel=""
      />
    </Wrapper>
  );
};

export const TopSellingItems: StoryFn = () => {
  const products = [
    { name: 'Diamond Sword', revenue: 15000 },
    { name: 'Iron Pickaxe', revenue: 12000 },
    { name: 'Golden Apple', revenue: 9500 },
    { name: 'Enchanted Book', revenue: 8000 },
    { name: 'Ender Pearl', revenue: 6500 },
  ];

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Top Selling Items" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsBar
              data={products}
              xAccessor={(d) => d.name}
              yAccessor={(d) => d.revenue}
              seriesName="Revenue"
              colorBy="data"
              showGrid={true}
              yAxisLabel="Revenue ($)"
              tooltipFormatter={(params: any) => {
                return `${params[0].name}<br/>Revenue: $${params[0].value.toLocaleString()}`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};

export const MonochromeBar: StoryFn<EChartsBarProps<CategoryData>> = (args) => {
  const data = generateCategoryData(12);

  return (
    <Wrapper>
      <EChartsBar<CategoryData>
        {...args}
        data={data}
        xAccessor={(d) => d.name}
        yAccessor={(d) => d.value}
        seriesName="Activity"
        colorBy="series"
        title="Player Activity by Hour"
        barWidth="60%"
      />
    </Wrapper>
  );
};
