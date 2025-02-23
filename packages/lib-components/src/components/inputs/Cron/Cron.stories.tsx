import React, { useState } from 'react';
import { Meta } from '@storybook/react';
import { Cron, CronProps } from '../../../components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export default {
  title: 'Inputs/Cron',
  component: Cron,
  args: {
    readOnly: false,
    disabled: false,
    canClear: false,
    popOverPlacement: 'bottom',
    loading: false,
    description: 'This is a description',
    required: true,
  },
} as Meta<typeof Cron>;

const validationSchema = z.object({
  cron: z.string(),
});

export const Something = (args: CronProps) => {
  const { control, handleSubmit } = useForm<z.infer<typeof validationSchema>>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });
  const [result, setResult] = useState<string>();

  const onSubmit: SubmitHandler<z.infer<typeof validationSchema>> = ({ cron }) => {
    setResult(cron);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Cron
          control={control}
          required={args.required}
          canClear={args.canClear}
          description={args.description}
          loading={args.loading}
          popOverPlacement={args.popOverPlacement}
          disabled={args.disabled}
          readOnly={args.readOnly}
          name="cron"
          label="cron"
          size="medium"
        />
      </form>
      <p>result: {result}</p>
    </div>
  );
};
