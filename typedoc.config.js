import { OptionDefaults } from 'typedoc';

/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
  entryPoints: [
    'packages/app-api',
    'packages/app-connector',
    'packages/lib-apiclient',
    'packages/lib-auth',
    'packages/lib-aws',
    'packages/lib-config',
    'packages/lib-db',
    'packages/lib-email',
    'packages/lib-gameserver',
    'packages/lib-function-helpers',
    'packages/lib-http',
    'packages/lib-modules',
    'packages/lib-queues',
    'packages/lib-util',
  ],
  name: 'Takaro',
  entryPointStrategy: 'packages',
  includeVersion: true,
  out: './reports/api-docs',
  // Extend the default blockTags to include the problematic tags from generated API files
  blockTags: [...OptionDefaults.blockTags, '@export', '@memberof'],
};

export default config;
