import { Meta, Story } from '@storybook/react';
import { ErrorTemplate } from '.';

export default {
  title: 'Data/ErrorTemplate',
  component: ErrorTemplate
} as Meta;

export const Default: Story = () => (
  <div>
    <ErrorTemplate description="NOT FOUND" title="404" />
  </div>
);
