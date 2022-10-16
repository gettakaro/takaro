import { Meta, Story } from '@storybook/react';
import { Order, OrderProps } from '.';

export default {
  title: 'Data/OrderedItems',
  component: Order,
} as Meta;

const Template: Story<OrderProps> = (args) => <Order {...args} />;
export const Default = Template.bind({});
Default.args = {
  items: [
    {
      id: '123',
      name: 'Micro Backpack',
      description: `Are you a minimalist looking for a compact carry option? The Micro Backpack is 
      the perfect size for your essential everyday carry items.Wear it like a backpack or carry it 
      like a stachel for all - day use.`,
      price: 70,
    },
    {
      id: '321',
      name: 'Nomad Shopping Tote',
      description: `This durable shopping tote is perfect for the world traveler. Its yellow canvas construction
      is water, fray, tear resistant. The matching handle, backpack straps, and shoulder loops provide multiple
      carry options for a day out on your next adventure.`,
      price: 90,
    },
  ],
  orderId: 'WU88191111',
  date: 'Jul 6, 2021',
  invoiceUrl: ''
};
