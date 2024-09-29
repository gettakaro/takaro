import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Badge, BadgeProps } from '.';

export default {
  title: 'Feedback/Badge',
  component: Badge,
  args: {
    variant: 'warning',
    animate: false,
  },
} as Meta<BadgeProps>;

export const Default: StoryFn<BadgeProps> = (args) => (
  <div>
    <h2 style={{ backgroundColor: 'orange', position: 'relative', width: 'fit-content' }}>
      this is the title{' '}
      <Badge variant={args.variant} animate={args.animate}>
        here
      </Badge>
    </h2>
  </div>
);
