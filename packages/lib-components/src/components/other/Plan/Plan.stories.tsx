import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Plan, PlanProps } from '.';

export default {
  title: 'Other/Plan',
  component: Plan,
  args: {
    title: 'Hobby plan',
    description:
      'Lorem ipsum dolor sit amet consect etur adipisicing elit. Itaque amet indis perferendis blanditiis repellendus etur quidem assumenda.',
    price: '20',
    items: ['Lorem ipsum', 'dolor sit amet', 'etur adipisicing elit', 'Itaque amet indis perferendis blanditiis '],
    buttonText: 'Get access',
    to: 'https://takaro.io',
  },
} as Meta<PlanProps>;

export const Default: StoryFn<PlanProps> = (args) => {
  return <Plan {...args} />;
};
