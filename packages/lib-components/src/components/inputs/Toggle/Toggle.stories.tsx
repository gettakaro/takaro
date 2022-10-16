import { Meta } from '@storybook/react';
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
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>],
  args: {
    items: ['true', 'false'],
    size: 'medium'
  }
} as Meta<ToggleProps>;

