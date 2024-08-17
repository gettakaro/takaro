import React, { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../../styled';
import { Button, DatePicker, DatePickerProps } from '../../../../components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateTime } from 'luxon';

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 50%;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export default {
  title: 'Inputs/DatePicker',
  component: DatePicker,
  args: {
    label: 'date',
    name: 'date',
    required: false,
    description: 'This is a description',
    popOverPlacement: 'bottom',
    readOnly: false,
    allowPastDates: true,
    allowFutureDates: true,
    loading: false,
    timePickerOptions: {
      interval: 30,
    },
    relativePickerOptions: {
      showFriendlyName: true,
      timeDirection: 'future',
    },
  },
} as Meta<DatePickerProps>;

const validationSchema = z.object({
  date: z.string().datetime({ offset: true }),
});
type FormFields = { date: string };

export const OnDateSubmit: StoryFn<DatePickerProps> = (args) => {
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ date }) => {
    setResult(date);
  };

  return (
    <Wrapper>
      Note: for zod to accept the date, an extra option is needed: {'{ offset: true }'}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DatePicker
          mode="absolute"
          control={control}
          label={args.label}
          name={args.name}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
          description={args.description}
          popOverPlacement={args.popOverPlacement}
          allowFutureDates={args.allowFutureDates}
          allowPastDates={args.allowPastDates}
        />
        <Button type="submit" text="Submit form" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};

export const CustomDateFilter: StoryFn<DatePickerProps> = (args) => {
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ date }) => {
    setResult(date);
  };

  return (
    <Wrapper>
      Note: for zod to accept the date, an extra option is needed: {'{ offset: true }'}
      <strong>Custom datefilter that only allows weekends</strong>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DatePicker
          mode="absolute"
          control={control}
          label={args.label}
          name={args.name}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
          description={args.description}
          popOverPlacement={args.popOverPlacement}
          customDateFilter={(date) => date.weekday == 6 || date.weekday == 7}
        />
        <Button type="submit" text="Submit form" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};

export const OnDateAndTimeSubmit: StoryFn<DatePickerProps> = (args) => {
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ date }) => {
    setResult(date);
  };

  return (
    <Wrapper>
      Note: for zod to accept the date, an extra option is needed: {'{ offset: true }'}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DatePicker
          mode="absolute"
          control={control}
          label={args.label}
          name={args.name}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
          format={DateTime.DATETIME_SHORT}
          timePickerOptions={args.timePickerOptions}
          description={args.description}
          popOverPlacement={args.popOverPlacement}
          allowPastDates={args.allowPastDates}
          allowFutureDates={args.allowFutureDates}
        />
        <Button type="submit" text="Submit form" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};

export const OnTimeSubmit: StoryFn<DatePickerProps> = (args) => {
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ date }) => {
    setResult(date);
  };

  return (
    <Wrapper>
      Note: for zod to accept the date, an extra option is needed: {'{ offset: true }'}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DatePicker
          mode="absolute"
          control={control}
          label={args.label}
          name={args.name}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
          format={DateTime.TIME_SIMPLE}
          timePickerOptions={args.timePickerOptions}
          description={args.description}
          popOverPlacement={args.popOverPlacement}
          allowPastDates={args.allowPastDates}
          allowFutureDates={args.allowFutureDates}
        />
        <Button type="submit" text="Submit form" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};

export const RelativeSubmit: StoryFn<DatePickerProps> = (args) => {
  const [result, setResult] = useState<string>('none');

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ date }) => {
    setResult(date);
  };

  return (
    <Wrapper>
      Note: for zod to accept the date, an extra option is needed: {'{ offset: true }'}
      <form onSubmit={handleSubmit(onSubmit)}>
        <DatePicker
          mode="relative"
          control={control}
          label={args.label}
          name={args.name}
          required={args.required}
          loading={args.loading}
          hint={args.hint}
          format={DateTime.DATETIME_MED_WITH_SECONDS}
          timePickerOptions={args.timePickerOptions}
          relativePickerOptions={args.relativePickerOptions}
          description={args.description}
          popOverPlacement={args.popOverPlacement}
          allowPastDates={args.allowPastDates}
          allowFutureDates={args.allowFutureDates}
        />
        <Button type="submit" text="Submit form" />
      </form>
      <p>result: {result}</p>
    </Wrapper>
  );
};
