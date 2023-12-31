import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Card, CardProps } from '.';

export default {
  title: 'Layout/Card',
  component: Card,
  args: {
    variant: 'default',
  },
} as Meta<CardProps>;

export const Default: StoryFn<CardProps> = (args) => {
  return (
    <Card {...args} onClick={() => {}}>
      this is the content
    </Card>
  );
};
