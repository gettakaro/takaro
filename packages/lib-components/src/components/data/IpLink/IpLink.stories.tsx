import type { Meta, StoryObj } from '@storybook/react';
import { IpLink } from './';

const meta: Meta<typeof IpLink> = {
  title: 'Data/IpLink',
  component: IpLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ip: {
      control: 'text',
      description: 'The IP address to link to Scamalytics',
    },
    placeholder: {
      control: 'text',
      description: 'Custom text to display instead of the IP',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ip: '178.116.125.71',
  },
};

export const WithPlaceholder: Story = {
  args: {
    ip: '192.168.1.1',
    placeholder: 'Check IP Reputation',
  },
};

export const NoIp: Story = {
  args: {
    ip: undefined,
  },
};

export const NoIpWithPlaceholder: Story = {
  args: {
    ip: undefined,
    placeholder: 'No IP available',
  },
};