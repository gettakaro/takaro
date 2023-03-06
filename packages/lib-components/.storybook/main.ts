import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [{ directory: '../src', files: '**/*.stories.@(tsx|ts)' }],
  framework: { name: '@storybook/react-vite', options: {} },
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
  ],
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    // related to storybook out of memory: https://github.com/storybookjs/storybook/issues/12348
    if (config.build) {
      config.build.sourcemap = false;
    }
    return config;
  },
};

export default config;

/*
  const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
  webpackFinal: async (config) => {
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: config.resolve.extensions
      })
    ];
    // Polyfills for crypto and stream modules of node.
    config.resolve.fallback.crypto = require.resolve('crypto-browserify');
    config.resolve.fallback.stream = require.resolve('stream-browserify');
    return {
      ...config,
      plugins: config.plugins.filter((plugin) => {
        if (plugin.constructor.name === 'ESLintWebpackPlugin') {
          return false;
        }
        return true;
      })
    };
  }
  */
