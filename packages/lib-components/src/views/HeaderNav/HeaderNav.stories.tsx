import { Meta, Story } from '@storybook/react';
import { HeaderNav as HeaderNavComponent } from '.';

export default {
  title: 'Views/HeaderNav',
  component: HeaderNavComponent
} as Meta;

export const Default: Story = () => <HeaderNavComponent />;
