import React from 'react';
import { styled } from '../../../styled';
import { Meta, StoryFn } from '@storybook/react';
import { useRef, useState } from 'react';
import { EditableFieldProps, EditableField } from '.';

export default {
  title: 'Inputs/EditableField',
  component: EditableField,
  args: {
    disabled: false,
    isEditing: false,
    text: 'I am the text, double click me',
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
  const [text, setText] = useState(args.text);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Container>
      <EditableField
        text={text}
        childRef={inputRef}
        isEditing={args.isEditing}
        placeholder={args.placeholder}
        disabled={args.disabled}
        allowEmpty={args.allowEmpty}
      >
        <input
          onChange={(e) => setText(e.target.value)}
          ref={inputRef}
          value={text}
        />
      </EditableField>
    </Container>
  );
};
