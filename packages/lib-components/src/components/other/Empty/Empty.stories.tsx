import { Meta, StoryFn } from '@storybook/react';
import { Empty, EmptyProps } from '.';
import { Button } from '../../../components';
import { AiOutlinePlus as AddIcon } from 'react-icons/ai';

export default {
  title: 'Other/Empty',
  component: Empty,
  args: {
    header: 'No projects',
    description: 'Get started by creating a new project',
    primaryAction: (
      <Button size="small" icon={<AddIcon />} text="New project" />
    ),
    size: 'medium',
  },
} as Meta<EmptyProps>;

export const Default: StoryFn<EmptyProps> = (args) => {
  return <Empty {...args} />;
};
