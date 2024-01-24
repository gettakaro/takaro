import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { CopyId, CopyIdProps } from '../../../components';

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
  title: 'Data/CopyId',
  component: CopyId,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    id: '3141592653589793238462643383279',
  },
} as Meta<CopyIdProps>;

export const Default: StoryFn<CopyIdProps> = (args) => <CopyId {...args} />;

export const CustomPlaceholder: StoryObj<CopyIdProps> = {
  args: {
    placeholder: 'custom placeholder',
    id: '3141592653589793238462643383279',
  },
};
