import { Meta, StoryFn } from '@storybook/react';
import { ModuleOnboarding as ModuleOnboardingComponent } from '.';

export default {
  title: 'Views/ModuleOnboarding',
  component: ModuleOnboardingComponent,
} as Meta;

export const Default: StoryFn = () => <ModuleOnboardingComponent />;
