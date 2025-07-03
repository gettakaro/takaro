import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ExternalLink, ExternalLinkProps } from './';

export default {
  title: 'Actions/ExternalLink',
  component: ExternalLink,
  args: {
    href: 'https://example.com',
    children: 'Visit Example.com',
  },
} as Meta<ExternalLinkProps>;

export const Default: StoryFn<ExternalLinkProps> = (args) => <ExternalLink {...args} />;

export const WithIcon: StoryFn<ExternalLinkProps> = () => (
  <ExternalLink href="https://steamcommunity.com/profiles/76561198028175941">🔗 Steam Profile</ExternalLink>
);

export const InText: StoryFn<ExternalLinkProps> = () => (
  <p>
    This is some text with an <ExternalLink href="https://scamalytics.com/ip/192.168.1.1">external link</ExternalLink>{' '}
    in the middle of it.
  </p>
);
