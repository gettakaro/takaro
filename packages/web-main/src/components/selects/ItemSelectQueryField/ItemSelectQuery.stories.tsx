import { useState } from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ItemSelectQueryView, ItemSelectQueryViewProps } from '.';
import { z } from 'zod';
import { Button } from '@takaro/lib-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GameServerOutputDTO, ItemsOutputDTO } from '@takaro/apiclient';

export default {
  title: 'ItemSelectQueryField',
  component: ItemSelectQueryView,
} as Meta<ItemSelectQueryViewProps>;

type FormFields = { item: string };

export const Default: StoryFn<ItemSelectQueryViewProps> = (args) => {
  const [selectItem, setSelectedItem] = useState<string>('');
  const validationSchema = z.object({
    item: z.string().min(6, 'Item must atleast have 6 characters'),
  });

  const gameServer: GameServerOutputDTO = {
    id: '1',
    createdAt: '',
    updatedAt: '',
    name: 'Online Mock Server 1',
    type: 'MOCK',
    reachable: true,
    enabled: true,
    connectionInfo: {},
  };

  const items: ItemsOutputDTO[] = [
    {
      id: '1',
      createdAt: '',
      updatedAt: '',
      name: 'Item 1',
      code: 'item1',
      gameserverId: '1',
    },
    {
      id: '2',
      createdAt: '',
      updatedAt: '',
      name: 'Item 2',
      code: 'item2',
      gameserverId: '1',
    },
    {
      id: '3',
      createdAt: '',
      updatedAt: '',
      name: 'Item 3',
      code: 'item3',
      gameserverId: '1',
    },
  ];

  const { control, handleSubmit } = useForm<FormFields>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<FormFields> = ({ item }) => {
    setSelectedItem(item);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ItemSelectQueryView
          control={control}
          name="item"
          label="Item"
          required={args.required}
          readOnly={args.readOnly}
          loading={args.loading}
          disabled={args.disabled}
          description={args.description}
          placeholder={args.placeholder}
          hint={args.hint}
          size={args.size}
          setItemName={setSelectedItem}
          gameServer={gameServer}
          hasNextPage={false}
          isFetchingNextPage={false}
          isFetching={false}
          optionCount={items.length + 1}
          fetchNextPage={() => {}}
          items={items}
        />
        <Button type="submit">Submit</Button>
      </form>
      <div>The search will not work since the items are placeholders. </div>
      <div>Selected Item: {selectItem}</div>
    </>
  );
};
