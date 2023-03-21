const path = require('path');
const { getLoader, loaderByName } = require('@craco/craco');

const uiPath = path.join(__dirname, '../lib-components');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName('babel-loader')
      );
      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include];
        match.loader.include = include.concat([uiPath]);
      }

      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) =>
          constructor && constructor.name === 'ModuleScopePlugin'
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      webpackConfig['resolve']['fallback'] = {
        url: require.resolve('url'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
        Buffer: require.resolve('buffer'),
        cluster: false,
        os: false,
        fs: false,
        v8: false,
        async_hooks: false,
      };
      return webpackConfig;
    },
  },
};
