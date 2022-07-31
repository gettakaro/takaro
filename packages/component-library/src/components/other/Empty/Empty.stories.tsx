import { Meta, Story } from '@storybook/react';
import { Empty, EmptyProps } from '.';
import { styled } from 'styled';

const Wrapper = styled.div`
  padding: 5rem;
  border-radius: 1rem;
  span {
    font-weight: 900;
  }
`;

export default {
  title: 'Other/Empty',
  component: Empty,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;

const Template: Story<EmptyProps> = (args) => <Empty {...args} />;
export const Basic = Template.bind({});

export const Example = () => (
  <>
    <Empty />
    <Empty description="custom description" />
    <Empty
      description={
        <span className="custom-styled-span">custom description with custom styling</span>
      }
    />
  </>
);
