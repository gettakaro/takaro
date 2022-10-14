import { Explorer } from '.';
import { styled } from '../../../styled';
import { Meta, Story } from '@storybook/react';

const Wrapper = styled.div`
  height: 100vh;
  width: 15%;
  background: ${({ theme }) => theme.colors.background};
  text-align: left;

  & > div {
    padding: 2px 10px;
  }
`;

export default {
  title: 'Navigation/Explorer',
  component: Explorer,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
} as Meta;

const Template: Story<IExplorerProps> = (args) => <Explorer {...args} />;
export const Default = Template.bind({});
Default.args = {
  nodes: [
    { name: 'Module A', children: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}] },
    { name: 'Module B', children: [{name: 'foo'}, {name: 'bar'}, {name: 'baz'}] },
  ],
};
