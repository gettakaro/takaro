import type { Meta, StoryObj } from '@storybook/react';
import { SteamIdLink } from './';

const meta: Meta<typeof SteamIdLink> = {
  title: 'Data/SteamIdLink',
  component: SteamIdLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    steamId: {
      control: 'text',
      description: 'The Steam ID to link to Steam Community',
    },
    placeholder: {
      control: 'text',
      description: 'Custom text to display instead of the Steam ID',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    steamId: '76561198028175941',
  },
};

export const WithPlaceholder: Story = {
  args: {
    steamId: '76561198028175941',
    placeholder: 'View Steam Profile',
  },
};

export const NoSteamId: Story = {
  args: {
    steamId: undefined,
  },
};

export const NoSteamIdWithPlaceholder: Story = {
  args: {
    steamId: undefined,
    placeholder: 'No Steam ID available',
  },
};