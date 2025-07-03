import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Takaro',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',
  url: 'https://docs.takaro.io',
  baseUrl: '/',
  organizationName: 'gettakaro',
  projectName: 'takaro',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',

          sidebarPath: './sidebars.ts',
          sidebarCollapsible: true,
          sidebarCollapsed: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl: 'https://github.com/gettakaro/takaro',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  scripts: [{ src: 'https://plausible.io/js/script.js', defer: true, 'data-domain': 'takaro.io' }],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },

    navbar: {
      title: 'Takaro Documentation',
      logo: {
        alt: 'Takaro Logo',
        src: 'img/takaro.png',
      },
      items: [
        {
          href: 'https://aka.takaro.io/github',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Homepage',
              href: 'https://takaro.io',
            },
            {
              label: 'Github',
              href: 'https://aka.takaro.io/github',
            },
            {
              label: 'Discord',
              href: 'https://aka.takaro.io/discord',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Takaro`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    algolia: {
      // The application ID provided by Algolia
      appId: 'EGKNUF24JA',
      // Public API key: it is safe to commit it
      apiKey: 'c346de81a50d15e8653e738f76871c15',
      indexName: 'takaro',
      // Optional: see doc section below
      contextualSearch: true,
      // Optional: Algolia search parameters
      searchParameters: {},
      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
