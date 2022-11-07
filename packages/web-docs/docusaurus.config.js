/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

async function createConfig() {
  return {
    title: 'Takaro',
    tagline: 'Multi-gameserver manager',
    url: 'https://docs.takaro.io',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    markdown: {
      mermaid: true,
    },
    themes: ['@docusaurus/theme-mermaid'],

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: 'niekcandaele', // Usually your GitHub org/user name.
    projectName: 'takaro', // Usually your repo name.

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },

    plugins: [
      [
        'docusaurus-plugin-typedoc',

        // Plugin / TypeDoc options
        {
          entryPoints: ['../..'],
          entryPointStrategy: 'packages',
          sidebar: {
            categoryLabel: 'Packages API',
            fullNames: true,
          },
          tsconfig: '../lib-config/tsconfig.json',
          out: 'development/packages',
        },
      ],
    ],

    presets: [
      [
        'classic',
        /** @type {import('@docusaurus/preset-classic').Options} */
        ({
          docs: {
            routeBasePath: '/',
            remarkPlugins: [],
            sidebarPath: require.resolve('./sidebars.js'),
            // Please change this to your repo.
            // Remove this to remove the "edit this page" links.
            editUrl:
              'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          },
          blog: false,
          theme: {
            customCss: require.resolve('./src/css/custom.css'),
          },
        }),
      ],
    ],

    themeConfig:
      /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
      ({
        navbar: {
          title: 'Takaro',
          logo: {
            alt: 'My Site Logo',
            src: 'img/logo.svg',
          },
          items: [
            {
              type: 'doc',
              docId: 'application/modules',
              position: 'left',
              label: 'Docs',
            },
            {
              type: 'doc',
              docId: 'development/getting-started',
              position: 'left',
              label: 'Development',
            },
            {
              href: 'https://github.com/niekcandaele/takaro',
              label: 'GitHub',
              position: 'right',
            },
          ],
        },
        footer: {
          style: 'dark',
          links: [
            {
              title: 'Docs',
              items: [
                {
                  label: 'Tutorial',
                  to: '/development/getting-started',
                },
              ],
            },
            {
              title: 'Community',
              items: [
                {
                  label: 'Discord',
                  href: 'https://discord.catalysm.net',
                },
              ],
            },
            {
              title: 'More',
              items: [
                {
                  label: 'GitHub',
                  href: 'https://github.com/niekcandaele/takaro',
                },
              ],
            },
          ],
          copyright: `Copyright © ${new Date().getFullYear()} Takaro.`,
        },
        prism: {
          theme: lightCodeTheme,
          darkTheme: darkCodeTheme,
        },
      }),
  };
}

module.exports = createConfig;
