import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Usage, UsageProps } from './Usage';

export default {
  title: 'Other/Usage',
  component: Usage,
  args: {
    unit: 'Functions',
    total: 5,
    value: 1,
  },
} as Meta<UsageProps>;

export const Default: StoryFn<UsageProps> = (args) => {
  return (
    <div style={{ width: '250px' }}>
      <Usage {...args} />
    </div>
  );
};
