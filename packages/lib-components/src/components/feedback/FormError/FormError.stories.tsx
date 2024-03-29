import { Meta, StoryObj } from '@storybook/react';
import { FormError, FormErrorProps } from '.';

export default {
  title: 'Feedback/FormError',
  component: FormError,
  args: {
    error: 'This is the text',
  },
} as Meta<FormErrorProps>;

export const SingleError: StoryObj<FormErrorProps> = {
  args: {
    error: 'Your password must be at least 8 characters',
  },
};

export const MultipleErrors: StoryObj<FormErrorProps> = {
  args: {
    error: [
      'Your password must be at least 8 characters',
      'Your password must include at least one pro wrestling finishing move',
    ],
  },
};
