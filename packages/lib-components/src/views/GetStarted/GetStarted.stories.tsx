import { Meta, StoryFn } from '@storybook/react';
import { GetStarted as GetStartedComponent, GetStartedProps } from '.';

export default {
  title: 'Views/GetStarted',
  component: GetStartedComponent,
  args: {
    to: '/get-started',
  }
} as Meta<GetStartedProps>;

export const Default: StoryFn<GetStartedProps> = (args) => <GetStartedComponent {...args} />;
