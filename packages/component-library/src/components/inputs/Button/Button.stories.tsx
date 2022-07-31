import { Meta, Story } from '@storybook/react';
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
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;

const Template: Story<ButtonProps> = (args) => <Button {...args} />;

// Default Button
export const Default = Template.bind({});
Default.args = {
  text: 'Basic Button',
  size: 'medium',
  type: 'button',
  variant: 'default'
};

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

/* ===================================
    DIFFERENT SIZED DEFAULT BUTTONS
  ====================================
*/
export const Sizes = () => (
  <div>
    <Button
      onClick={() => {
        /* */
      }}
      size="tiny"
      text="Tiny Button"
    />
    <Button
      onClick={() => {
        /* */
      }}
      size="small"
      text="Small Button"
    />
    <Button
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Medium Button"
    />
    <Button
      onClick={() => {
        /* */
      }}
      size="large"
      text="Large Button"
    />
    <Button
      onClick={() => {
        /* */
      }}
      size="huge"
      text="Huge Button"
    />
  </div>
);

export const Colors = () => (
  <div>
    <Button
      color="primary"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Primary Button"
    />
    <Button
      color="secondary"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Secondary Button"
    />
    <Button
      color="tertiary"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Tertiary Button"
    />
    <Button
      color="quaternary"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Quaternary Button"
    />
    <Button
      color="info"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Info Button"
    />
    <Button
      color="success"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Success Button"
    />
    <Button
      color="warning"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Warning Button"
    />
    <Button
      color="error"
      onClick={() => {
        /* */
      }}
      size="medium"
      text="Error Button"
    />
  </div>
);
