import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useRef, useState } from 'react';
import { EditableFieldProps, EditableField } from '.';

export default {
  title: 'Inputs/EditableField',
  component: EditableField,
  args: {
    disabled: false,
    editable: false,
    text: 'I am the text, double click me',
  },
} as Meta<EditableFieldProps>;

export const Default: StoryFn<EditableFieldProps> = (args) => {
  const [text, setText] = useState(args.text);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <EditableField
        text={text}
        childRef={inputRef}
        editable={args.editable}
        placeholder={args.placeholder}
        disabled={args.disabled}
      >
        <input
          onChange={(e) => setText(e.target.value)}
          ref={inputRef}
          value={text}
        />
      </EditableField>
    </div>
  );
};
