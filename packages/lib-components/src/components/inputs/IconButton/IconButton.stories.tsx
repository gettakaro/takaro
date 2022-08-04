import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { IconButton, IconButtonProps } from '.';
import { AiFillAccountBook as Icon } from 'react-icons/ai';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
`;

export default {
  title: 'Inputs/IconButton',
  component: IconButton,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
} as Meta;

const Template: Story<IconButtonProps> = (args) => <IconButton {...args} />;

// Default Button
export const Default = Template.bind({});
Default.args = {
  onClick: undefined,
  size: 'medium',
  color: 'primary',
  icon: <Icon />
};

export const Variants = () => (
  <>
    <IconButton
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="medium"
      variant="default"
    />
    <IconButton
      color="secondary"
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="medium"
      variant="clear"
    />
    <IconButton
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="medium"
      variant="outline"
    />
  </>
);

export const Colors = () => (
  <Grid>
    <IconButton
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="medium"
      variant="default"
    />
    <IconButton
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="medium"
      variant="clear"
    />
    <IconButton
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="medium"
      variant="outline"
    />
  </Grid>
);

export const Sizes = () => (
  <>
    <IconButton
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="tiny"
    />
    <IconButton
      icon={<Icon />}
      onClick={() => {
        /* */
      }}
      size="small"
    />
    <IconButton
      icon={<Icon size={18} />}
      onClick={() => {
        /* */
      }}
      size="medium"
    />
    <IconButton
      icon={<Icon size={24} />}
      onClick={() => {
        /* */
      }}
      size="large"
    />
    <IconButton
      icon={<Icon size={32} />}
      onClick={() => {
        /* */
      }}
      size="huge"
    />
  </>
);
