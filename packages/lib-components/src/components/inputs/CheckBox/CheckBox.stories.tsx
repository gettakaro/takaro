import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { CheckBox, CheckBoxProps, Button } from '../../../components';
import { useForm, useWatch } from 'react-hook-form';

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

export const OnSubmit: StoryFn<CheckBoxProps> = (args) => {
  const { control, handleSubmit } = useForm();
  const [result, setResult] = React.useState<boolean>(false);

  const onSubmit = (val) => {
    setResult(val.checkbox);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CheckBox {...args} control={control} />
        <Button type="submit" text="submit" />
      </form>
      <pre>value: {result}</pre>
    </>
  );
};

export const OnChange: StoryFn<CheckBoxProps> = (args) => {
  const { control } = useForm();
  const CheckBoxValue = useWatch({ control, name: args.name });

  return (
    <>
      <CheckBox {...args} control={control} />
      <pre>value: {CheckBoxValue}</pre>
    </>
  );
};
