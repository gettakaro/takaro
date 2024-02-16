import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { InfiniteScroll, InfiniteScrollProps } from '.';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  height: 100vh;
  overflow: scroll;
`;

const Filler = styled.div`
  height: 100vh;
`;

export default {
  title: 'Data/InfiniteScroll',
  component: InfiniteScroll,
  args: {
    hasNextPage: true,
    isFetching: false,
    isFetchingNextPage: false,
    fetchNextPage: () => {},
  },
} as Meta<InfiniteScrollProps>;

export const Default: StoryFn<InfiniteScrollProps> = (args) => {
  return (
    <Wrapper>
      <Filler />
      <InfiniteScroll {...args} />
    </Wrapper>
  );
};
