import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ErrorFallback, ErrorFallbackProps } from '.';

export default {
  title: 'Feedback/ErrorFallback',
  component: ErrorFallback,
  args: {},
} as Meta<ErrorFallbackProps>;

export const Default: StoryFn<ErrorFallbackProps> = (args) => (
  <ErrorFallback {...args} />
);
