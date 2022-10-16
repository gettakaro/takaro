import { Meta, StoryFn } from '@storybook/react';
import { Welcome as WelcomeComponent } from '.';

export default {
  title: 'Views/Welcome',
  component: WelcomeComponent
} as Meta;

export const Default: StoryFn = (args) => <WelcomeComponent {...args} />;
