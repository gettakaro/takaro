module.exports = {
  framework: {
    name: '@storybook/react-vite',
    options: { fashRefresh: true },
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
  ],
  features: {
    previewCsfV3: true,
    previewMdx2: true,
  },
  staticDirs: ['../public'],
  core: { builder: '@storybook/builder-vite' },
  viteFinal: async (config) => {
    // related to storybook out of memory: https://github.com/storybookjs/storybook/issues/12348
    config.build.sourcemap = false;
    return config;
  },
};

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
