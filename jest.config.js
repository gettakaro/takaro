
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  //A map from regular expressions to paths to transformers.A transformer is a module that provides a synchronous function for transforming source files.For example, if you wanted to be able to use a new language feature in your modules or tests that aren't yet supported by node, you might plug in one of many compilers that compile a future version of JavaScript to a current one
  'transform': {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  'snapshotResolver': '<rootDir>/src/test/snapshotResolver.js',

  // An array of regexp pattern strings that are matched against all source file paths before transformation. If the file path matches any of the patterns, it will not be transformed.
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(ts|tsx)$'],

  // In webpack projects, we often allow importing things like css files or jpg
  // files, and let a webpack loader plugin take care of loading these resources.
  // In a unit test, though, we're running in node.js which doesn't know how
  // to import these, so this tells jest what to do for these.
  moduleNameMapper: {
    '^test-utils': '<rootDir>/src/test/testUtils.tsx',
    // Resolve .css and similar files to identity-obj-proxy instead?.
    '.+\\.(css|styl|less|sass|scss)$': 'identity-obj-proxy',
    // Resolve .jpg and similar files to __mocks__/file-mock.js
    '.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/test/__mocks__/fileMock.ts',
  },

  // By default Jest does not include jsdom anymore.
  setupFiles: [
    'react-app-polyfill/jsdom',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  testEnvironment: 'jsdom',
};
