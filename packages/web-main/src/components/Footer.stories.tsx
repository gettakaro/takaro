import { Meta, StoryFn } from '@storybook/react';
import { Footer } from './Footer';

export default {
  title: 'Footer',
  component: Footer,
} as Meta;

export const Default: StoryFn = () => {
  return <Footer />;
};
