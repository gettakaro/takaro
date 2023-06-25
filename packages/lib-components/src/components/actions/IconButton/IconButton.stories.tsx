import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Tooltip, IconButton, IconButtonProps } from '../../../components';
import { styled } from '../../../styled';
import { AiOutlineBell as Icon } from 'react-icons/ai';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
`;

interface ExtraIconButtonStoryProps {
  tooltipLabel: string;
}

export default {
  title: 'Actions/IconButton',
  component: IconButton,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    size: 'medium',
    color: 'primary',
    icon: <Icon />,
    tooltipLabel: 'This is the tooltip',
  },
} as Meta<IconButtonProps & ExtraIconButtonStoryProps>;

export const Default: StoryFn<IconButtonProps & ExtraIconButtonStoryProps> = (
  args
) => (
  <Tooltip label={args.tooltipLabel} placement="bottom">
    <IconButton size={args.size} color={args.color} icon={args.icon} />
  </Tooltip>
);
