import React from 'react';
import { HeatMap, HeatmapProps } from '.';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';

export default {
  title: 'Charts/Heatmap',
  component: HeatMap,
  args: {
    showMonthLabels: true,
    showDayLabels: true,
  },
  argTypes: {
    showMonthLabels: { control: 'boolean' },
    showDayLabels: { control: 'boolean' },
  },
} as Meta<HeatmapProps<ContributionData>>;

const Wrapper = styled.div`
  height: 200px;
  width: 100%;
`;

interface ContributionData {
  date: Date;
  count: number;
}

// Generate realistic contribution data (GitHub-style)
const generateContributionData = (): ContributionData[] => {
  const data: ContributionData[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 364); // 1 year ago

  // Generate contributions with realistic patterns
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Simulate realistic patterns:
    // - Less activity on weekends
    // - Random spikes in activity
    // - Some periods of no activity
    let count = 0;

    if (Math.random() > 0.3) {
      if (isWeekend) {
        count = Math.floor(Math.random() * 5);
      } else {
        count = Math.floor(Math.random() * 15);
      }
      if (Math.random() > 0.9) {
        count += Math.floor(Math.random() * 20);
      }
    }

    data.push({
      date: new Date(d),
      count,
    });
  }

  return data;
};

export const Default: StoryFn<HeatmapProps<ContributionData>> = (args) => {
  const data = React.useMemo(() => generateContributionData(), []);

  return (
    <Wrapper>
      <HeatMap<ContributionData>
        name="contributions"
        data={data}
        dateAccessor={(d) => d.date}
        valueAccessor={(d) => d.count}
        showMonthLabels={args.showMonthLabels}
        showDayLabels={args.showDayLabels}
      />
    </Wrapper>
  );
};

export const LastThreeMonths: StoryFn<HeatmapProps<ContributionData>> = (args) => {
  const data = React.useMemo(() => {
    const result: ContributionData[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      result.push({
        date: new Date(d),
        count: Math.floor(Math.random() * 10),
      });
    }

    return result;
  }, []);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  return (
    <Wrapper>
      <HeatMap<ContributionData>
        name="contributions-3months"
        data={data}
        dateAccessor={(d) => d.date}
        valueAccessor={(d) => d.count}
        startDate={startDate}
        endDate={new Date()}
        showMonthLabels={args.showMonthLabels}
        showDayLabels={args.showDayLabels}
      />
    </Wrapper>
  );
};

// Data interface for categorical mode (24h x 7-day)
interface ActivityData {
  hour: number; // 0-23
  day: number; // 0-6 (Mon-Sun)
  value: number;
}

// Generate realistic 24h x 7-day activity data
const generate24x7Data = (): ActivityData[] => {
  const data: ActivityData[] = [];

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      // Base activity level
      let value = 5;

      // Peak hours (lunch and evening)
      if (hour >= 11 && hour <= 13) value = 40; // Lunch peak
      if (hour >= 18 && hour <= 21) value = 60; // Evening peak

      // Night hours (low activity)
      if (hour >= 0 && hour <= 6) value = 2;

      // Weekend boost
      if (day === 5 || day === 6) value *= 1.5;

      // Friday evening extra boost
      if (day === 4 && hour >= 18) value *= 1.3;

      // Add some randomness
      value = Math.floor(value + Math.random() * 20 - 10);
      value = Math.max(0, value); // Ensure non-negative

      data.push({ hour, day, value });
    }
  }

  return data;
};

export const WeeklyActivity: StoryFn<HeatmapProps<ActivityData>> = (args) => {
  const data = React.useMemo(() => generate24x7Data(), []);

  const hourLabels = Array.from({ length: 24 }, (_, i) =>
    i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`,
  );

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Wrapper style={{ height: '250px' }}>
      <HeatMap<ActivityData>
        name="weekly-activity"
        data={data}
        xAccessor={(d) => d.hour}
        yAccessor={(d) => d.day}
        valueAccessor={(d) => d.value}
        xCategories={hourLabels}
        yCategories={dayLabels}
        showDayLabels={args.showDayLabels}
        tooltip={{
          accessor: (d) => {
            const activityData = d as ActivityData;
            return `${dayLabels[activityData.day]}, ${hourLabels[activityData.hour]}\n${activityData.value} activities`;
          },
        }}
      />
    </Wrapper>
  );
};
