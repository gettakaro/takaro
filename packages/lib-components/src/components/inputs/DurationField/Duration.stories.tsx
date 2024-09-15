import React from 'react';
import { DurationField, DurationFieldProps } from '../../../components';
import { z } from 'zod';
import { StoryFn, Meta } from '@storybook/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default {
  title: 'Inputs/DurationField',
  component: DurationField,
  args: {
    label: 'Duration',
    placeholder: 'this is the placeholder',
    description: 'This is the description',
    hint: 'this is the hint',
    disabled: false,
    readOnly: false,
    required: false,
    size: 'medium',
  },
} as Meta<DurationFieldProps>;

export const Default: StoryFn<DurationFieldProps> = (args) => {
  const [result, setResult] = React.useState<number | undefined>(undefined);

  const validationSchema = z.object({
    duration: z.number().positive(),
  });

  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    resolver: zodResolver(validationSchema),
  });
  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ duration }) => {
    setResult(duration);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DurationField
          loading={false}
          control={control}
          description={args.description}
          hint={args.hint}
          label={args.label}
          name="duration"
          placeholder={args.placeholder}
          required={args.required}
          size={args.size}
          disabled={args.disabled}
          readOnly={args.readOnly}
        />
      </form>
      <p>Result: {result ? result : ''}</p>
    </>
  );
};
