import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { UsageCard, UsageCardProps } from './UsageCard';

export default {
  title: 'Other/UsageCard',
  component: UsageCard,
  args: {
    title: 'Functions included in your plan',
    info: 'Here we can add some extra details?',
    description: 'Here we can add some extra details about something.',
    unit: 'Functions',
    total: 100000,
    value: 52329,
  },
} as Meta<UsageCardProps>;

export const Default: StoryFn<UsageCardProps> = (args) => {
  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 500 }}>Summary</h1>
        <p>Resets on Sept 1st, 2025</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <UsageCard {...args} />
        <UsageCard {...args} />
      </div>
    </>
  );
};
