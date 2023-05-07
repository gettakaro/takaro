import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { CheckBox, CheckBoxProps } from '../../../components';
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
  component: CheckBox,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    name: 'checkbox',
    loading: false,
    defaultValue: false,
    readOnly: false,
    label: 'this is the label',
    labelPosition: 'left',
    disabled: false,
    required: true,
    size: 'medium',
  },
} as Meta<CheckBoxProps>;

export const Default: StoryFn<CheckBoxProps> = (args) => {
  const { control } = useForm();
  return <CheckBox {...args} control={control} />;
};
