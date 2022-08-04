import { Meta, Story } from '@storybook/react';
import { Skeleton, SkeletonProps } from '.';

export default {
  title: 'Feedback/Skeleton',
  component: Skeleton
} as Meta;

export const Default: Story<SkeletonProps> = (args) => (
  <>
    <Skeleton variant="text" />
    <Skeleton height="40px" variant="circular" width="40px" />
    <Skeleton height="180px" variant="rectangular" width="210px" />
  </>
);

export const Text: Story<SkeletonProps> = (args) => (
  <>
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
  </>
);
