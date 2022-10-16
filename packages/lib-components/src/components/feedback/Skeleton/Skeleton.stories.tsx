import { Meta, Story, StoryFn, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonProps } from '.';

export default {
  title: 'Feedback/Skeleton',
  component: Skeleton,
} as Meta<SkeletonProps>;

export const Default: StoryFn<SkeletonProps> = (args) => <Skeleton {...args} />;


export const Example = () => (
  <>
    <Skeleton variant="text" />
    <Skeleton height="40px" variant="circular" width="40px" />
    <Skeleton height="180px" variant="rectangular" width="210px" />
  </>
);

export const Example2 = () => (
  <>
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
  </>
);
