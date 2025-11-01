import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Button, TagField, TagFieldProps } from '../../../components';
import { z } from 'zod';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';

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
    description: 'Very basic description. But atleast it is here and can be improved in the future.',
    name: 'fruits',
    hint: '',
    onBlur: () => {},
  },
} as Meta<TagFieldProps>;

interface FormInputs {
  tags: string[];
}

export const OnSubmit: StoryFn<TagFieldProps> = (args) => {
  const [result, setResult] = useState<string[]>([]);
  const { control, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      tags: ['jari'],
    },
  });

  const beforeAddValidationSchema = z.object({
    tags: z.array(z.string()),
  });

  const onSubmit: SubmitHandler<FormInputs> = ({ tags }) => {
    setResult(() => [...tags]);
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <h1>Add Fruits</h1>
      <pre>paste tester: apple,banana,jeroen</pre>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TagField {...args} tagValidationSchema={beforeAddValidationSchema} control={control} name="tags" />
        <Button type="submit">Submit</Button>
      </form>
      <pre>result: {result.join(', ')}</pre>
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
