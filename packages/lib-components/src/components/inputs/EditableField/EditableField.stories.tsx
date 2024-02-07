import React from 'react';
import { styled } from '../../../styled';
import { Meta, StoryFn } from '@storybook/react';
import { EditableFieldProps, EditableField } from '.';
import { z } from 'zod';

export default {
  title: 'Inputs/EditableField',
  component: EditableField,
  args: {
    disabled: false,
    isEditing: false,
    value: 'I am the text, double click me',
    required: true,
    label: 'label',
    validationSchema: z
      .string()
      .refine((value) => !value.includes('/'), { message: 'The field must not contain slashes.' }),
  },
} as Meta<EditableFieldProps>;

const Container = styled.div`
  width: 50%;
  input {
    width: 100%;
  }
`;

export const Default: StoryFn<EditableFieldProps> = (args) => {
  const [value, setValue] = React.useState(args.value);

  return (
    <Container>
      <EditableField
        name="editableField"
        isEditing={args.isEditing}
        disabled={args.disabled}
        required={args.required}
        value={args.value}
        validationSchema={args.validationSchema}
        onEdited={(value) => setValue(value)}
      />
      <div>The value: {value}</div>
    </Container>
  );
};

export const RemoteEditEnable: StoryFn<EditableFieldProps> = (args) => {
  const [editing, setEditing] = React.useState<boolean>(false);

  return (
    <Container>
      This tests if we can change the state to editing from outside the component
      <EditableField
        name="editableField"
        isEditing={editing}
        disabled={args.disabled}
        required={args.required}
        value={args.value}
      />
      <button onClick={() => setEditing(!editing)}>toggle editing state</button>
      <span>current state: {editing ? 'true' : 'false'}</span>
    </Container>
  );
};
