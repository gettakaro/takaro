import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Button, ButtonProps } from '.';
import { AiFillCloud as Icon } from 'react-icons/ai';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;

  div {
    button {
      margin: 15px 0;
    }
  }
`;

export default {
  title: 'Inputs/Button',
  component: Button,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    size: 'medium',
    text: 'basic button',
    variant: 'default',
    type: 'button',
    disabled: false,
    isLoading: false,
    color: 'primary',
    isWhite: false,
    onClick: undefined
  }
} as Meta<ButtonProps>;

export const Default: StoryFn<ButtonProps> = (args) => <Button {...args} />;

export const Examples = () => (
  <div>
    <Button
      isWhite
      onClick={() => {
        /* */
      }}
      text="White Button"
    />
    <Button
      icon={<Icon size={20} />}
      onClick={() => {
        /* */
      }}
      text="Icon Button"
    />
    <Button
      disabled
      onClick={() => {
        /* */
      }}
      text="Disabled Button"
    />
    <Button
      isLoading
      onClick={() => {
        /* */
      }}
      text="Loading Button"
    />
    {/* Outline */}
    <Button
      onClick={() => {
        /* */
      }}
      text="Outlined Button"
      variant="outline"
    />
    <Button
      icon={<Icon size={20} />}
      onClick={() => {
        /* */
      }}
      text="Icon Button"
      variant="outline"
    />
    <Button
      disabled
      onClick={() => {
        /* */
      }}
      text="Disabled Button"
      variant="outline"
    />
    <Button
      isLoading
      onClick={() => {
        /* */
      }}
      text="Loading Button"
      variant="outline"
    />
  </div>
);

