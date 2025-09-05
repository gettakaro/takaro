import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { EChartsHeatmap, EChartsHeatmapProps } from './EChartsHeatmap';
import { styled } from '../../../styled';
import { Card } from '../../../components';
import { faker } from '@faker-js/faker';

export default {
  title: 'Charts/ECharts/Heatmap',
  component: EChartsHeatmap,
  args: {
    title: 'Heatmap Example',
    xAxisLabel: 'Hour',
    yAxisLabel: 'Day',
    showLabel: false,
  },
} as Meta<EChartsHeatmapProps>;

const Wrapper = styled.div`
  height: 500px;
  width: 100%;
`;

interface HeatmapData {
  hour: number;
  day: number;
  value: number;
}

// Generate sample heatmap data
function generateHeatmapData(): HeatmapData[] {
  const data: HeatmapData[] = [];
  const days = 7;
  const hours = 24;

  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < hours; hour++) {
      // Simulate peak hours (lunch and evening)
      let baseValue = 10;
      if (hour >= 11 && hour <= 13) baseValue = 40; // Lunch peak
      if (hour >= 18 && hour <= 21) baseValue = 60; // Evening peak
      if (hour >= 0 && hour <= 6) baseValue = 2; // Night low

      // Weekend bonus
      if (day === 5 || day === 6) baseValue *= 1.5;

      data.push({
        hour,
        day,
        value: baseValue + faker.number.int({ min: -5, max: 20 }),
      });
    }
  }

  return data;
}

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hourLabels = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`,
);

export const Default: StoryFn<EChartsHeatmapProps<HeatmapData>> = (args) => {
  const data = generateHeatmapData();

  return (
    <Wrapper>
      <EChartsHeatmap<HeatmapData>
        {...args}
        data={data}
        xAccessor={(d) => d.hour}
        yAccessor={(d) => d.day}
        valueAccessor={(d) => d.value}
        xCategories={hourLabels}
        yCategories={dayNames}
      />
    </Wrapper>
  );
};

export const PeakSalesHeatmap: StoryFn = () => {
  const data = generateHeatmapData();

  return (
    <Wrapper>
      <Card variant="outline">
        <Card.Title label="Peak Sales Heatmap" />
        <Card.Body>
          <div style={{ height: '400px' }}>
            <EChartsHeatmap
              data={data}
              xAccessor={(d) => d.hour}
              yAccessor={(d) => d.day}
              valueAccessor={(d) => d.value}
              xCategories={hourLabels}
              yCategories={dayNames}
              xAxisLabel="Hour of Day"
              yAxisLabel="Day of Week"
              tooltipFormatter={(params: any) => {
                const value = params.value;
                return `${dayNames[value[1]]}, ${hourLabels[value[0]]}<br/>Sales: ${value[2]}`;
              }}
            />
          </div>
        </Card.Body>
      </Card>
    </Wrapper>
  );
};

export const PlayerActivityHeatmap: StoryFn<EChartsHeatmapProps<HeatmapData>> = (args) => {
  const data = generateHeatmapData().map((d) => ({
    ...d,
    value: d.value * 2, // Higher values for player activity
  }));

  return (
    <Wrapper>
      <EChartsHeatmap<HeatmapData>
        {...args}
        data={data}
        xAccessor={(d) => d.hour}
        yAccessor={(d) => d.day}
        valueAccessor={(d) => d.value}
        xCategories={hourLabels}
        yCategories={dayNames}
        title="Player Activity Patterns"
        subtitle="Average players online by hour and day"
        showLabel={false}
        minValue={0}
        maxValue={150}
      />
    </Wrapper>
  );
};

export const WithLabels: StoryFn<EChartsHeatmapProps<HeatmapData>> = (args) => {
  // Smaller dataset for label visibility
  const data: HeatmapData[] = [];
  for (let day = 0; day < 5; day++) {
    for (let hour = 0; hour < 12; hour++) {
      data.push({
        hour: hour * 2, // Every 2 hours
        day,
        value: faker.number.int({ min: 10, max: 100 }),
      });
    }
  }

  const sparseHours = hourLabels.filter((_, i) => i % 2 === 0);
  const weekdays = dayNames.slice(0, 5);

  return (
    <Wrapper>
      <EChartsHeatmap<HeatmapData>
        {...args}
        data={data}
        xAccessor={(d) => d.hour / 2}
        yAccessor={(d) => d.day}
        valueAccessor={(d) => d.value}
        xCategories={sparseHours}
        yCategories={weekdays}
        title="Resource Usage"
        showLabel={true}
      />
    </Wrapper>
  );
};
