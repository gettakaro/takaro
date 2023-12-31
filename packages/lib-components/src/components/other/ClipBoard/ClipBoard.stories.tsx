import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ClipBoard, ClipBoardProps } from '.';

export default {
  title: 'Other/ClipBoard',
  component: ClipBoard,
  args: {
    text: 'https://docs.csmm.app/en/CSMM/advanced-feature-guide-chathook.html#creating-the-listen-hook-for-specific-content-in-a-chatmessage',
    maxWidth: 500,
  },
} as Meta<ClipBoardProps>;

export const Default: StoryFn<ClipBoardProps> = (args) => <ClipBoard {...args} />;
