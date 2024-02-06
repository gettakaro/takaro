import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Skeleton, SkeletonProps } from '.';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`;

export default {
  title: 'Feedback/Skeleton',
  component: Skeleton,
} as Meta<SkeletonProps>;

export const Default: StoryFn<SkeletonProps> = (args) => <Skeleton {...args} />;

export const Example = () => (
  <Wrapper>
    <Skeleton variant="text" />
    <Skeleton height="40px" variant="circular" width="40px" />
    <Skeleton height="180px" variant="rectangular" width="210px" />
  </Wrapper>
);

export const Example2 = () => (
  <Wrapper>
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
  </Wrapper>
);
