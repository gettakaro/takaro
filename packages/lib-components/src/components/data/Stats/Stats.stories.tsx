import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Stats, StatsProps } from '../../../components';

export default {
  title: 'Data/Stat',
  component: Stats,
  args: {
    direction: 'horizontal',
    border: false,
  },
} as Meta<StatsProps>;

export const HorizontalWithBorder: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '1000px' }}>
      <Stats direction="horizontal" border>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const HorizontalWithoutBorder: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '1000px' }}>
      <Stats direction="horizontal" border={false}>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const VerticalWithBorder: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '300px' }}>
      <Stats direction="vertical" border>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const VerticalWithoutBorder: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '300px' }}>
      <Stats direction="vertical" border={false}>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const LoadingWithoutBorder: StoryFn<StatsProps> = (args) => {
  return (
    <div style={{ width: '700px' }}>
      <Stats direction={args.direction} border={args.border}>
        <Stats.Stat isLoading description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};
