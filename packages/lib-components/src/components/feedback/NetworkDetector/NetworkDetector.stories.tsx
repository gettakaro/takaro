import { Meta, Story } from '@storybook/react';
import { NetworkDetector } from '.';

export default {
  title: 'Feedback/NetworkDetector',
  component: NetworkDetector
} as Meta;

export const Default: Story = () => (
  <div>
    <p>You can simulate an offline state in the browsers network tab.</p>
    <NetworkDetector />
  </div>
);
