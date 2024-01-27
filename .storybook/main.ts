import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    { directory: '../packages/lib-components/src', files: '**/*.stories.@(tsx|ts)', titlePrefix: 'Lib-components' },
    { directory: '../packages/web-main/src', files: '**/*.stories.@(tsx|ts)', titlePrefix: 'Web-main' },
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  addons: ['@storybook/addon-essentials', '@storybook/addon-links', '@storybook/addon-a11y'],
  staticDirs: ['../packages/lib-components/public', '../packages/web-main/public'],
  viteFinal: async (config) => {
    // related to storybook out of memory: https://github.com/storybookjs/storybook/issues/12348
    if (config.build) {
      config.build.sourcemap = false;
    }
    return config;
  },
};

export default config;
