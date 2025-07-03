import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { IpLink, IpLinkProps } from './';

export default {
  title: 'Data/IpLink',
  component: IpLink,
  args: {
    ip: '178.116.125.71',
  },
} as Meta<IpLinkProps>;

export const Default: StoryFn<IpLinkProps> = (args) => <IpLink {...args} />;

export const WithPlaceholder: StoryFn<IpLinkProps> = () => (
  <IpLink ip="192.168.1.1" placeholder="Check IP Reputation" />
);

export const NoIp: StoryFn<IpLinkProps> = () => <IpLink />;

export const NoIpWithPlaceholder: StoryFn<IpLinkProps> = () => <IpLink placeholder="No IP available" />;
