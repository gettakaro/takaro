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
        {...args}
        name="contributions"
        data={data}
        dateAccessor={(d) => d.date}
        valueAccessor={(d) => d.count}
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
        {...args}
        name="contributions-3months"
        data={data}
        dateAccessor={(d) => d.date}
        valueAccessor={(d) => d.count}
        startDate={startDate}
        endDate={new Date()}
      />
    </Wrapper>
  );
};
