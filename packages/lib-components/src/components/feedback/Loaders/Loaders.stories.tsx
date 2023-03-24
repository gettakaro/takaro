import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import {
  Spinner as SpinnerComponent,
  SpinnerProps,
  Loading,
  LoadingProps,
} from '..';

const WrapperDecorator = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 5rem;
  border-radius: 1rem;
  background-color: ${({ theme }): string => theme.colors.background};
  span {
    font-weight: 900;
  }
`;

export default {
  title: 'Feedback/Spinner',
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>],
  subcomponents: { SpinnerComponent, Loading },
} as Meta<SpinnerProps>;

export const Spinner: StoryFn<SpinnerProps> = (args) => (
  <SpinnerComponent {...args} />
);

export const LoadingPage: StoryFn<LoadingProps> = (args) => {
  return <Loading {...args} />;
};
