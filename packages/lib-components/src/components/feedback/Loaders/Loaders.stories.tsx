import { Meta, Story } from '@storybook/react';
import { styled } from '../../../styled';
import { Spinner, SpinnerProps, Loading } from '..';

const WrapperDecorator = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 5rem;
  border-radius: 1rem;
  background-color: ${({ theme }): string => theme.colors.background};
  span {
    font-weight: 900;
  }
`;

export default {
  title: 'Feedback/Spinner',
  component: Spinner,
  decorators: [(story) => <WrapperDecorator>{story()}</WrapperDecorator>]
} as Meta;

export const Sizes: Story<SpinnerProps> = () => {
  return (
    <>
      <Spinner size="tiny" />
      <Spinner size="small" />
      <Spinner size="medium" />
      <Spinner size="large" />
      <Spinner size="huge" />
    </>
  );
};

export const LoadingPage: Story = () => {
  return <Loading />;
};
