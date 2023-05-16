import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { GenericTagField as TagField, GenericTagFieldProps } from '.';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

export default {
  title: 'Inputs/TagField',
  component: TagField,
  args: {
    label: 'Url',
    placeholder: 'placeholder',
    required: true,
    disabled: false,
    isEditOnRemove: false,
  },
} as Meta<GenericTagFieldProps>;

export const Default: StoryFn<GenericTagFieldProps> = (args) => {
  const [selected, setSelected] = useState(['papaya']);
  const { control } = useForm();

  const beforeAddValidationSchema = z.object({
    tags: z.array(z.string()),
  });

  return (
    <div style={{ marginBottom: '32px' }}>
      <h1>Add Fruits</h1>
      <pre>{JSON.stringify(selected)}</pre>
      <TagField
        value={selected}
        onChange={setSelected}
        name="fruits"
        control={control}
        placeholder="press ENTER to save a value"
        disabled={args.disabled}
        isEditOnRemove={args.isEditOnRemove}
        tagValidationSchema={beforeAddValidationSchema}
        required={args.required}
      />
    </div>
  );
};
