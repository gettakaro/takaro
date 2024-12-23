import { Meta, StoryFn } from '@storybook/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EvenntNameSelectProps, EventNameSelectField } from '.';

export default {
  title: 'EventNameSelectField',
  component: EventNameSelectField,
  args: {
    multiple: false,
    required: false,
    canClear: false,
    disabled: false,
    readOnly: false,
    description: 'this is the interesting description about the event names select field',
  },
} as Meta<EvenntNameSelectProps>;

interface IFormInputs {
  eventNames: string[];
}

export const Default: StoryFn<EvenntNameSelectProps> = (args) => {
  const { control, handleSubmit } = useForm<IFormInputs>();
  const onSubmit: SubmitHandler<IFormInputs> = ({ eventNames }) => {
    console.log(eventNames);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <EventNameSelectField
        control={control}
        multiple={true}
        required={args.required}
        canClear={args.canClear}
        disabled={args.disabled}
        readOnly={args.readOnly}
        description={args.description}
        name="eventNames"
      />
    </form>
  );
};
