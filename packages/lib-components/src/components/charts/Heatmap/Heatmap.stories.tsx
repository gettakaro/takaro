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
  height: 50vh;
  width: 100%;
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
  const getTimestamp = (d: Data) => d.timestamp;
  const getValue = (d: Data) => (d.value ? 1 : 0);

  return (
    <Wrapper>
      <HeatMap<Data> data={data} xAccessor={getTimestamp} yAccessor={getValue} variant="month" name="online" />
    </Wrapper>
  );
};
