import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { SteamIdLink, SteamIdLinkProps } from './';

export default {
  title: 'Data/SteamIdLink',
  component: SteamIdLink,
  args: {
    steamId: '76561198028175941',
  },
} as Meta<SteamIdLinkProps>;

export const Default: StoryFn<SteamIdLinkProps> = (args) => <SteamIdLink {...args} />;

export const WithPlaceholder: StoryFn<SteamIdLinkProps> = () => (
  <SteamIdLink steamId="76561198028175941" placeholder="View Steam Profile" />
);

export const NoSteamId: StoryFn<SteamIdLinkProps> = () => <SteamIdLink />;

export const NoSteamIdWithPlaceholder: StoryFn<SteamIdLinkProps> = () => (
  <SteamIdLink placeholder="No Steam ID available" />
);
