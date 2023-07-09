import { Meta, StoryObj } from '@storybook/react';
import { FormError, FormErrorProps } from '.';

export default {
  title: 'Feedback/FormError',
  component: FormError,
  args: {
    message: 'This is the text',
  },
} as Meta<FormErrorProps>;

export const Success: StoryObj<FormErrorProps> = {
  args: {
    message: 'Your password must be at least 8 characters',
  },
};

export const Error: StoryObj<FormErrorProps> = {
  args: {
    message: [
      'Your password must be at least 8 characters',
      'Your password must include at least one pro wrestling finishing move',
    ],
  },
};
