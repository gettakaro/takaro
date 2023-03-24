import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { Empty, EmptyProps } from '.';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  padding: 5rem;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  span {
    font-weight: 900;
  }
`;

export default {
  title: 'Other/Empty',
  component: Empty,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
} as Meta<EmptyProps>;

export const Default: StoryFn<EmptyProps> = (args) => <Empty {...args} />;

export const CustomDescription: StoryObj<EmptyProps> = {
  ...Default,
  args: {
    description: 'custom description',
  },
};
export const CustomStyledSpan: StoryObj<EmptyProps> = {
  ...Default,
  args: {
    description: (
      <span className="custom-styled-span">
        custom description with custom styling
      </span>
    ),
  },
};
