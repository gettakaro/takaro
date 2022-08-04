import { Meta, Story } from '@storybook/react';
import { GetStarted as GetStartedComponent, GetStartedProps } from '.';

export default {
  title: 'Views/GetStarted',
  component: GetStartedComponent
} as Meta;

export const Default: Story<GetStartedProps> = () => <GetStartedComponent to="/get-started" />;
