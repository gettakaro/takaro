import React, { useMemo } from 'react';
import { styled } from '../../../styled';
import { Meta, StoryFn } from '@storybook/react';
import { EditableFieldProps, EditableField } from '.';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useValidationSchema } from '../../../hooks';

export default {
  title: 'Inputs/EditableField',
  component: EditableField,
  args: {
    disabled: false,
    isEditing: false,
    value: 'I am the text, double click me',
    required: true,
    label: 'label',
  },
} as Meta<EditableFieldProps>;

const Container = styled.div`
  width: 50%;

  input {
    width: 100%;
  }
`;

export const Default: StoryFn<EditableFieldProps> = (args) => {
  type FormFields = {
    editableField: string;
  };

  const validationSchema = useMemo(
    () =>
      yup.object<Record<keyof FormFields, yup.AnySchema>>({
        editableField: yup
          .string()
          .min(12)
          .required('This is a required field'),
      }),
    []
  );

  const { control } = useForm<FormFields>({
    resolver: useValidationSchema(validationSchema),
    mode: 'all',
  });

  return (
    <Container>
      <EditableField
        name="editableField"
        isEditing={args.isEditing}
        disabled={args.disabled}
        required={args.required}
        control={control}
        value={args.value}
        label={args.label}
      />
    </Container>
  );
};
