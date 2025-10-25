import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Stats, StatsProps } from '../../../components';
import { AiOutlineDollar, AiOutlineUser, AiOutlineShoppingCart, AiOutlineEye } from 'react-icons/ai';

export default {
  title: 'Data/Stat',
  component: Stats,
  args: {
    direction: 'horizontal',
    grouped: false,
    size: 'medium',
  },
} as Meta<StatsProps>;

export const HorizontalGrouped: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '1000px' }}>
      <Stats direction="horizontal" grouped>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const HorizontalSeparated: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '1000px' }}>
      <Stats direction="horizontal" grouped={false}>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const VerticalGrouped: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '300px' }}>
      <Stats direction="vertical" grouped>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const VerticalSeparated: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '300px' }}>
      <Stats direction="vertical" grouped={false}>
        <Stats.Stat description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const LoadingState: StoryFn<StatsProps> = (args) => {
  return (
    <div style={{ width: '700px' }}>
      <Stats direction={args.direction} grouped={args.grouped}>
        <Stats.Stat isLoading description="Credits" value="$0.00" />
        <Stats.Stat description="Current month so far" value="$0.00" />
        <Stats.Stat description="Last invoice" value="$0.00" />
      </Stats>
    </div>
  );
};

export const WithIcons: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '1000px' }}>
      <Stats direction="horizontal" grouped>
        <Stats.Stat description="Revenue" value="$12,345" icon={<AiOutlineDollar />} />
        <Stats.Stat description="Active Users" value={1234} icon={<AiOutlineUser />} />
        <Stats.Stat description="Total Orders" value="567" icon={<AiOutlineShoppingCart />} />
      </Stats>
    </div>
  );
};

export const WithTrends: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '1000px' }}>
      <Stats direction="horizontal" grouped>
        <Stats.Stat
          description="Revenue"
          value="$12,345"
          icon={<AiOutlineDollar />}
          trend={{ direction: 'up', value: '+12.5%' }}
        />
        <Stats.Stat
          description="Active Users"
          value={1234}
          icon={<AiOutlineUser />}
          trend={{ direction: 'down', value: '-5.2%' }}
        />
        <Stats.Stat
          description="Page Views"
          value="45.2K"
          icon={<AiOutlineEye />}
          trend={{ direction: 'up', value: '+8%' }}
        />
      </Stats>
    </div>
  );
};

export const SizeVariants: StoryFn<StatsProps> = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3>Small</h3>
        <Stats direction="horizontal" grouped size="small">
          <Stats.Stat description="Revenue" value="$12,345" icon={<AiOutlineDollar />} />
          <Stats.Stat description="Users" value="1,234" icon={<AiOutlineUser />} />
        </Stats>
      </div>
      <div>
        <h3>Medium (Default)</h3>
        <Stats direction="horizontal" grouped size="medium">
          <Stats.Stat description="Revenue" value="$12,345" icon={<AiOutlineDollar />} />
          <Stats.Stat description="Users" value="1,234" icon={<AiOutlineUser />} />
        </Stats>
      </div>
      <div>
        <h3>Large</h3>
        <Stats direction="horizontal" grouped size="large">
          <Stats.Stat description="Revenue" value="$12,345" icon={<AiOutlineDollar />} />
          <Stats.Stat description="Users" value="1,234" icon={<AiOutlineUser />} />
        </Stats>
      </div>
    </div>
  );
};

export const AllFeatures: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '1000px' }}>
      <Stats direction="horizontal" grouped size="medium">
        <Stats.Stat
          description="Total Revenue"
          value="$45,231"
          icon={<AiOutlineDollar />}
          trend={{ direction: 'up', value: '+20.1%' }}
        />
        <Stats.Stat
          description="Active Users"
          value="2,345"
          icon={<AiOutlineUser />}
          trend={{ direction: 'up', value: '+12%' }}
        />
        <Stats.Stat
          description="Orders"
          value="892"
          icon={<AiOutlineShoppingCart />}
          trend={{ direction: 'down', value: '-3.5%' }}
        />
        <Stats.Stat description="Page Views" value="123.4K" icon={<AiOutlineEye />} />
      </Stats>
    </div>
  );
};

export const VerticalWithAllFeatures: StoryFn<StatsProps> = () => {
  return (
    <div style={{ width: '350px' }}>
      <Stats direction="vertical" grouped size="medium">
        <Stats.Stat
          description="Total Revenue"
          value="$45,231"
          icon={<AiOutlineDollar />}
          trend={{ direction: 'up', value: '+20.1%' }}
        />
        <Stats.Stat
          description="Active Users"
          value="2,345"
          icon={<AiOutlineUser />}
          trend={{ direction: 'up', value: '+12%' }}
        />
        <Stats.Stat
          description="Total Orders"
          value="892"
          icon={<AiOutlineShoppingCart />}
          trend={{ direction: 'down', value: '-3.5%' }}
        />
      </Stats>
    </div>
  );
};
