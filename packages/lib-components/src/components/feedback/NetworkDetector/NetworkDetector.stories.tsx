import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { NetworkDetector } from '.';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
`;

export default {
  title: 'Feedback/NetworkDetector',
  component: NetworkDetector,
} as Meta;

export const Default: StoryFn = () => (
  <Wrapper>
    <p>You can simulate an offline state in the browsers network tab.</p>
    <NetworkDetector />
  </Wrapper>
);
