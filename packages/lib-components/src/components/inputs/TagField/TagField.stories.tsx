import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { TagField, TagFieldProps } from '../../../components';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';

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

export const OnSubmit: StoryFn<TagFieldProps> = (args) => {
  const { control } = useForm();

  const beforeAddValidationSchema = z.object({
    tags: z.array(z.string()),
  });

  return (
    <div style={{ marginBottom: '32px' }}>
      <h1>Add Fruits</h1>
      <pre>paste tester: apple,banana,jeroen</pre>
      <TagField
        {...args}
        tagValidationSchema={beforeAddValidationSchema}
        control={control}
      />
    </div>
  );
};

export const OnChange: StoryFn<TagFieldProps> = (args) => {
  const { control } = useForm({ mode: 'onChange' });
  const TagFieldValues = useWatch({ control, name: args.name });

  return (
    <>
      <TagField {...args} control={control} />
      <pre>{TagFieldValues}</pre>
    </>
  );
};
