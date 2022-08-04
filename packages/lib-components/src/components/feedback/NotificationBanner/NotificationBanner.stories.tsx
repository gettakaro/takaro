import { Meta, Story } from '@storybook/react';
import { NotificationBanner, NotificationBannerProps } from '.';

export default {
  title: 'Feedback/NotificationBanner',
  component: NotificationBanner
} as Meta;

export const Default: Story<NotificationBannerProps> = (args) => (
  <NotificationBanner description="this is the description" title="this is the title" />
);
