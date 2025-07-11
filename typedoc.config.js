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
  blockTags: [
    '@abstract',
    '@access',
    '@alias',
    '@async',
    '@author',
    '@beta',
    '@callback',
    '@class',
    '@classdesc',
    '@constant',
    '@constructs',
    '@copyright',
    '@default',
    '@deprecated',
    '@description',
    '@enum',
    '@event',
    '@example',
    '@experimental',
    '@extends',
    '@external',
    '@file',
    '@fires',
    '@function',
    '@generator',
    '@global',
    '@hideconstructor',
    '@ignore',
    '@implements',
    '@inheritdoc',
    '@inner',
    '@instance',
    '@interface',
    '@kind',
    '@lends',
    '@license',
    '@listens',
    '@member',
    '@memberof',
    '@mixes',
    '@mixin',
    '@module',
    '@name',
    '@namespace',
    '@override',
    '@package',
    '@param',
    '@private',
    '@property',
    '@protected',
    '@public',
    '@readonly',
    '@requires',
    '@returns',
    '@see',
    '@since',
    '@static',
    '@summary',
    '@this',
    '@throws',
    '@todo',
    '@tutorial',
    '@type',
    '@typedef',
    '@variation',
    '@version',
    '@yields',
    '@export',
  ],
};

export default config;
