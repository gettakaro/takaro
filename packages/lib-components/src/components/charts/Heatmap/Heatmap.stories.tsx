import React from 'react';
import { HeatMap, HeatmapProps } from '.';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { DateTime } from 'luxon';

export default {
  title: 'Charts/Heatmap',
  component: HeatMap,
} as Meta<HeatmapProps<number>>;

const Wrapper = styled.div`
  height: 250px;
  width: 250px;
`;

interface Data {
  timestamp: string;
  value: boolean;
}

// this represents a month of a player's online status
const data: Data[] = Array.from({ length: 30 }, (_, i) => ({
  timestamp: DateTime.local().minus({ days: i }).toISODate()!,
  value: Math.random() > 0.5,
}));

export const Default: StoryFn<HeatmapProps<number>> = () => {
  // Extract the day of the week from the timestamp (0 for Sunday, 6 for Saturday)
  const yAccessor = (d: Data) => DateTime.fromISO(d.timestamp).weekday;
  // Extract the week of the month from the timestamp
  const xAccessor = (d: Data): number => Math.floor(DateTime.fromISO(d.timestamp).day / 7);
  // Convert boolean value to 0 or 1 because the heatmap expects a number
  const zAccessor = (d: Data) => (d.value ? 1 : 0);

  const tooltipAccessor = (d: Data) => {
    const date = DateTime.fromISO(d.timestamp);
    // format: "Sun, 10 jan: online
    return `${date.weekdayShort}, ${date.day} ${date.monthShort}: ${d.value ? 'online' : 'offline'}`;
  };

  return (
    <Wrapper>
      <HeatMap<Data>
        data={data}
        xAccessor={xAccessor}
        yAccessor={yAccessor}
        zAccessor={zAccessor}
        tooltipAccessor={tooltipAccessor}
        variant="month"
        name="online"
      />
    </Wrapper>
  );
};
