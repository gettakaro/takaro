import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ItemSelect, ItemSelectProps } from '.';
import { z } from 'zod';
import { Button } from '@takaro/lib-components';
import { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export default {
  title: 'ItemSelectQueryField',
  component: ItemSelect,
} as Meta<ItemSelectProps>;

type FormFields = { name: string };

export const Default: StoryFn<ItemSelectProps> = (args) => {
  const [selectItem, setSelectedItem] = useState<string>('');
  const validationSchema = z.object({
    item: z.string().min(6).nonempty('Name is a required field.'),
  });

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ name }) => {
    setSelectedItem(name);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ItemSelect {...args} control={control} name="item" label="Item" placeholder="Select an item" />
        <Button type="submit" text="submit" />
      </form>
      <div>Selected Item: {selectItem}</div>
    </>
  );
};
