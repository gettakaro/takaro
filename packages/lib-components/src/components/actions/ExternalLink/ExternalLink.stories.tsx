import type { Meta, StoryObj } from '@storybook/react';
import { ExternalLink } from './';

const meta: Meta<typeof ExternalLink> = {
  title: 'Actions/ExternalLink',
  component: ExternalLink,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'The URL to link to',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: 'https://example.com',
    children: 'Visit Example.com',
  },
};

export const WithIcon: Story = {
  args: {
    href: 'https://steamcommunity.com/profiles/76561198028175941',
    children: (
      <>
        🔗 Steam Profile
      </>
    ),
  },
};

export const InText: Story = {
  render: () => (
    <p>
      This is some text with an{' '}
      <ExternalLink href="https://scamalytics.com/ip/192.168.1.1">
        external link
      </ExternalLink>{' '}
      in the middle of it.
    </p>
  ),
};