import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Empty, EmptyPage, EmptyProps } from '.';
import { Button } from '../../../components';
import { AiOutlinePlus as AddIcon } from 'react-icons/ai';

export default {
  title: 'Other/Empty',
  component: Empty,
  args: {
    header: 'Earn recurring revenue',
    description: 'Subscriptions allow you to grow recurring revenue by charging subscribers on a regular basis',
    actions: [
      <Button key="new-project-button " size="medium" icon={<AddIcon />}>
        New project
      </Button>,
    ],
    size: 'medium',
  },
} as Meta<EmptyProps>;

export const Default: StoryFn<EmptyProps> = (args) => {
  return (
    <EmptyPage>
      <Empty {...args} />
    </EmptyPage>
  );
};
