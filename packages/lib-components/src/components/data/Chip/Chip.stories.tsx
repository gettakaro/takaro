import React from 'react';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { styled } from '../../../styled';
import { AiOutlineArrowRight as LinkIcon } from 'react-icons/ai';
import { Chip, ChipProps } from '../../data';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  text-align: left;

  & > div {
    margin: 1rem;
  }
`;

export default {
  title: 'Data/Chip',
  component: Chip,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    label: 'Default chip',
    color: 'backgroundAccent',
    disabled: false,
    dot: false,
    variant: 'default',
    isLoading: false,
  },
} as Meta<ChipProps>;

export const Default: StoryFn<ChipProps> = (args) => <Chip {...args} />;

export const ClickableChip: StoryObj<ChipProps> = {
  args: {
    label: 'Clickable chip',
    onClick: () => {
      /* */
    },
  },
};
export const DeletableChip: StoryObj<ChipProps> = {
  args: {
    label: 'Deletable chip',
    onDelete: () => {
      /* */
    },
  },
};

export const LoadingChip: StoryObj<ChipProps> = {
  args: {
    label: 'loading chip',
    isLoading: true,
  },
};

export const IconChip: StoryObj<ChipProps> = {
  args: {
    label: 'Chip with icon',
    icon: <LinkIcon />,
    showIcon: 'hover',
  },
};
