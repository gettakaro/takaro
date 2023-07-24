import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ErrorMessage, ErrorMessageProps } from '.';

export default {
  title: 'Inputs/ErrorMessage',
  args: {
    message: 'This is an error message',
  },
} as Meta<ErrorMessageProps>;

export const SingleLine: StoryFn<ErrorMessageProps> = (args) => {
  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <span>I am the longer reference element, this way the message can be shown on a single line</span>
      <ErrorMessage {...args} />
    </div>
  );
};

export const Wrapped: StoryFn<ErrorMessageProps> = (args) => {
  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <span>I am the reference element</span>
      <ErrorMessage {...args} />
    </div>
  );
};
