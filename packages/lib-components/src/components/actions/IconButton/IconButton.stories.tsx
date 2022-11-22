import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { IconButton, IconButtonProps } from '.';
import { AiFillAccountBook as Icon } from 'react-icons/ai';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
`;

export default {
  title: 'Inputs/IconButton',
  component: IconButton,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    onClick: undefined,
    size: 'medium',
    color: 'primary',
    icon: <Icon />,
  },
} as Meta<IconButtonProps>;

export const Default: StoryFn<IconButtonProps> = (args) => (
  <IconButton {...args} />
);
