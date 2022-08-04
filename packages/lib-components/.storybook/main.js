const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/preset-create-react-app',
    '@storybook/addon-a11y'
  ],
  features: {
    storyStoreV7: true // Optimize story loading with baabel mode 7
  },
  staticDirs: ['../public'],
  core: { builder: 'webpack5' },
  logLevel: 'debug',
  reactOptions: {
    fastRefresh: true
  },
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
};
