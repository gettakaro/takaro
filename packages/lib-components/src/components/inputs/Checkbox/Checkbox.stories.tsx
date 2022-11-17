import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { Checkbox, CheckboxProps } from '.';
import { useForm } from 'react-hook-form';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  grid-gap: 2rem;
  padding: 5rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
`;

export default {
  title: 'Inputs/Checkbox/Default',
  component: Checkbox,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    name: 'checkbox',
    loading: false,
    defaultValue: false,
    readOnly: false,
    label: 'this is the label',
    labelPosition: 'left',
  },
} as Meta<CheckboxProps>;

export const Default: StoryFn<CheckboxProps> = (args) => {
  const { control } = useForm();
  return <Checkbox {...args} control={control} />;
};
