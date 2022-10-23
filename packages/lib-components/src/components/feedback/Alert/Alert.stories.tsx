import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { Alert, AlertProps } from '.';

export default {
  title: 'Feedback/Alert',
  component: Alert,
  args: {
    text: 'This is the title',
    variant: 'info',
  }

} as Meta<AlertProps>;

export const Default: StoryFn<AlertProps> = (args) => (<Alert {...args} />);

export const Success: StoryObj<AlertProps> = {
  args: {
    title: 'Order complete',
    text: 'Your order has been sucessfully processed. We are completing the report.',
    variant: 'success',
    dismiss: true
  }
};

export const Error: StoryObj<AlertProps> = {
  args: {
    title: 'There were errors with your submission',
    text: [
      'Your password must be at least 8 characters',
      'Your password must include at least one pro wrestling finishing move'
    ],
    variant: 'error',
  }
};

export const Warning: StoryObj<AlertProps> = {
  args: {
    title: 'Attention required',
    text: 'This is a warning! Please read this carefully before you continue!',
    variant: 'warning',
    action: {
      execute: () => {/* */ },
      text: 'View status'
    }
  }
};

export const SingleLine: StoryObj<AlertProps> = {
  args: {
    text: 'This is a single line now',
    variant: 'info'
  }
};
