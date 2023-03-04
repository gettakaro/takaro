import React from 'react';
import { styled } from '../../../styled';
import { Meta, StoryFn } from '@storybook/react';
import { EditableFieldProps, EditableField } from '.';

export default {
  title: 'Inputs/EditableField',
  component: EditableField,
  args: {
    disabled: false,
    isEditing: false,
    value: 'I am the text, double click me',
    required: true,
    label: 'label',
    allowEmpty: false,
  },
} as Meta<EditableFieldProps>;

const Container = styled.div`
  width: 50%;

  input {
    width: 100%;
  }
`;

export const Default: StoryFn<EditableFieldProps> = (args) => {
  const [value, setValue] = React.useState('');

  return (
    <Container>
      <EditableField
        name="editableField"
        allowEmpty={args.allowEmpty}
        isEditing={args.isEditing}
        disabled={args.disabled}
        required={args.required}
        value={args.value}
        onEdited={(value) => setValue(value)}
      />

      <div>field edited: {value ? 'true' : 'false'}</div>
    </Container>
  );
};

export const RemoteEditEnable: StoryFn<EditableFieldProps> = (args) => {
  const [editing, setEditing] = React.useState<boolean>(false);

  return (
    <Container>
      This tests if we can change the state to editing from outside the
      component
      <EditableField
        name="editableField"
        allowEmpty={args.allowEmpty}
        isEditing={editing}
        disabled={args.disabled}
        required={args.required}
        value={args.value}
        onEdited={(value) => setValue(value)}
      />
      <button onClick={() => setEditing(!editing)}>toggle editing state</button>
      <span>current state: {editing ? 'true' : 'false'}</span>
    </Container>
  );
};
