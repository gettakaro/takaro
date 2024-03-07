import { Meta, StoryFn } from '@storybook/react';
import { NotificationBanner, NotificationBannerProps } from '.';

export default {
  title: 'Feedback/NotificationBanner',
  component: NotificationBanner,
  args: {
    title: 'This is the notification banner title',
    description: 'This is the notification banner description',
  },
} as Meta<NotificationBannerProps>;

export const Default: StoryFn<NotificationBannerProps> = (args) => <NotificationBanner {...args} />;
