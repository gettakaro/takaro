import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { TagField, TagFieldProps } from '../../../components';
import { z } from 'zod';
import { useForm } from 'react-hook-form';

export default {
  title: 'Inputs/TagField',
  component: TagField,
  args: {
    label: 'Fruits',
    placeholder: 'Press ENTER to save a value',
    required: true,
    disabled: false,
    isEditOnRemove: true,
    readOnly: false,
    separators: [','],
    description:
      'Very basic description. But atleast it is here and can be improved in the future.',
    name: 'fruits',
    hint: '',
    onBlur: () => {},
  },
} as Meta<TagFieldProps>;

export const Default: StoryFn<TagFieldProps> = (args) => {
  const [selected, setSelected] = useState(['papaya']);
  const { control } = useForm();

  const beforeAddValidationSchema = z.object({
    tags: z.array(z.string()),
  });

  return (
    <div style={{ marginBottom: '32px' }}>
      <h1>Add Fruits</h1>
      <pre>paste tester: apple,banana,jeroen</pre>
      <pre>{JSON.stringify(selected)}</pre>
      <TagField
        onChange={(tags) => setSelected(tags)}
        name={args.name}
        label={args.label}
        control={control}
        hint={args.hint}
        placeholder={args.placeholder}
        disabled={args.disabled}
        isEditOnRemove={args.isEditOnRemove}
        tagValidationSchema={beforeAddValidationSchema}
        required={args.required}
        readOnly={args.readOnly}
        separators={args.separators}
        description={args.description}
      />
    </div>
  );
};
