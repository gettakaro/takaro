import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { IconButton, IconButtonProps } from '.';
import { AiOutlineBell as Icon } from 'react-icons/ai';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
`;

export default {
  title: 'Actions/IconButton',
  component: IconButton,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    size: 'medium',
    color: 'primary',
    isLoading: false,
    icon: <Icon />,
  },
} as Meta<IconButtonProps>;

export const Default: StoryFn<IconButtonProps> = (args) => (
  <IconButton {...args} />
);
