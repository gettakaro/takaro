import { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: [
    { directory: '../packages/lib-components/src', files: '**/*.stories.@(tsx|ts)', titlePrefix: 'Lib Components' },
    { directory: '../packages/web-main/src', files: '**/*.stories.@(mdx|tsx|ts)', titlePrefix: 'Web Main' },
    { directory: '../packages/lib-components/src', files: '**/*.stories.@(mdx)', titlePrefix: 'Design System' },
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  addons: ['@storybook/addon-essentials', '@storybook/addon-links', '@storybook/addon-a11y'],
  staticDirs: ['../packages/lib-components/public', '../packages/web-main/public'],
  viteFinal: async (config) => {
    const buildSourceMap = config.build ? true : false;

    // related to storybook out of memory: https://github.com/storybookjs/storybook/issues/12348
    return mergeConfig(config, {
      core: {
        disableTelemetry: true,
      },
      build: {
        sourcemap: buildSourceMap,
      },
      plugins: [
        tsconfigPaths({ projects: ['packages/lib-components/tsconfig.json', 'packages/web-main/tsconfig.json'] }),
      ],
    });
  },
};

export default config;
