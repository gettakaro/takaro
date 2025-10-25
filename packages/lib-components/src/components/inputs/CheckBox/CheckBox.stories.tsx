import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { CheckBox, CheckBoxProps, Button } from '../../../components';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';

const Wrapper = styled.div`
  padding: 5rem;
`;

export default {
  title: 'Inputs/Checkbox',
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

export const OnSubmit: StoryFn<CheckBoxProps & { defaultValue: boolean }> = (args) => {
  type FormFields = { checkbox: boolean };

  const { control, handleSubmit } = useForm<FormFields>({
    defaultValues: {
      checkbox: args.defaultValue,
    },
  });
  const [result, setResult] = React.useState<boolean>(false);

  const onSubmit: SubmitHandler<FormFields> = (values) => {
    setResult(values[args.name]);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CheckBox {...args} control={control} />
        <Button type="submit">submit</Button>
      </form>
      <pre>value: {result ? 'true' : 'false'}</pre>
      <p>NOTE: defaultValue will only be set on initial load. Limitation of react-hook-form.</p>
    </>
  );
};

export const OnChange: StoryFn<CheckBoxProps> = (args) => {
  const { control } = useForm();
  const CheckBoxValue = useWatch({ control, name: args.name });

  return (
    <>
      <CheckBox {...args} control={control} />
      <pre>value: {CheckBoxValue ? 'true' : 'false'}</pre>
    </>
  );
};
