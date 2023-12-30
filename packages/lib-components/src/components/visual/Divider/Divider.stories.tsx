import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Divider, DividerProps } from '.';

export default {
  title: 'Layout/Divider',
  component: Divider,
  args: {
    label: { text: 'label', labelPosition: 'center' },
  },
} as Meta<DividerProps>;

export const Default: StoryFn<DividerProps> = (args) => (
  <div>
    <div>this is the content above</div>
    <Divider {...args} />
    <div> this is the content after</div>
  </div>
);
