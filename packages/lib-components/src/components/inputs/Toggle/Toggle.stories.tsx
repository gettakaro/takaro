import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { Toggle, ToggleProps } from '.';

const WrapperDecorator = styled.div`
  padding: 5rem;
  border-radius: 1rem;
  background-color: ${({ theme }): string => theme.colors.background};
  span {
    font-weight: 900;
  }
`;

export default {
  title: 'Inputs/Toggle',
  component: Toggle,
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>]
} as Meta;

const Template: Story<ToggleProps> = (args) => <Toggle {...args} />;
export const Basic = Template.bind({});
Basic.args = {
  items: ['true', 'false'],
  size: 'medium'
};
