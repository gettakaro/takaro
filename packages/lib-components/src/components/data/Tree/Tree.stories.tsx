import { Meta, Story } from '@storybook/react';
import { Tree, TreeProps } from '.';
import { styled } from '../../../styled';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
  text-align: left;

  & > div {
    margin: 1rem;
  }
`;

export default {
  title: 'Data/Tree',
  component: Tree,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
} as Meta;

const Template: Story<TreeProps> = (args) => <Tree {...args} />;
export const Default = Template.bind({});
Default.args = {
  columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
  rowData: [
    { make: 'Toyota', model: 'Celica', price: 35000 },
    { make: 'Ford', model: 'Mondeo', price: 32000 },
    { make: 'Porsche', model: 'Boxster', price: 72000 },
  ],
  width: '600px',
  height: '400px',
};
