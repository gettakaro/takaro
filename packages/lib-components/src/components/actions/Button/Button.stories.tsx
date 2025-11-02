import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Button, ButtonProps } from '.';
import { AiFillCloud as Icon } from 'react-icons/ai';

const Wrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, auto);
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};

  div {
    button {
      margin: 15px 0;
    }
  }
`;

export default {
  title: 'Actions/Button',
  component: Button,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    size: 'medium',
    children: 'basic button',
    variant: 'default',
    type: 'button',
    disabled: false,
    isLoading: false,
    color: 'primary',
    onClick: undefined,
  },
} as Meta<ButtonProps>;

export const Default: StoryFn<ButtonProps> = (args) => <Button {...args} />;

export const Examples = () => (
  <>
    {/* Default */}
    <Button
      onClick={() => {
        /* */
      }}
    >
      Default Button
    </Button>
    <Button
      icon={<Icon size={20} />}
      onClick={() => {
        /* */
      }}
    >
      Icon Button
    </Button>
    <Button
      disabled
      onClick={() => {
        /* */
      }}
    >
      Disabled Button
    </Button>
    <Button
      isLoading
      onClick={() => {
        /* */
      }}
    >
      Loading Button
    </Button>

    {/* Outline */}
    <Button
      onClick={() => {
        /* */
      }}
      variant="outline"
    >
      Outlined Button
    </Button>
    <Button
      icon={<Icon size={20} />}
      onClick={() => {
        /* */
      }}
      variant="outline"
    >
      Icon Button
    </Button>
    <Button
      disabled
      onClick={() => {
        /* */
      }}
      variant="outline"
    >
      Disabled Button
    </Button>
    <Button
      isLoading
      onClick={() => {
        /* */
      }}
      variant="outline"
    >
      Loading Button
    </Button>

    {/* Clear */}
    <Button
      onClick={() => {
        /* */
      }}
      variant="clear"
    >
      Clear Button
    </Button>
    <Button
      icon={<Icon size={20} />}
      onClick={() => {
        /* */
      }}
      variant="clear"
    >
      Icon Button
    </Button>
    <Button
      disabled
      onClick={() => {
        /* */
      }}
      variant="clear"
    >
      Disabled Button
    </Button>
    <Button
      isLoading
      onClick={() => {
        /* */
      }}
      variant="clear"
    >
      Loading Button
    </Button>

    {/* white */}
    <Button
      onClick={() => {
        /* */
      }}
      variant="white"
    >
      White Button
    </Button>
    <Button
      icon={<Icon size={20} />}
      onClick={() => {
        /* */
      }}
      variant="white"
    >
      Icon Button
    </Button>
    <Button
      disabled
      onClick={() => {
        /* */
      }}
      variant="white"
    >
      Disabled Button
    </Button>
    <Button
      isLoading
      onClick={() => {
        /* */
      }}
      variant="white"
    >
      Loading Button
    </Button>
  </>
);
