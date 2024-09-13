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
          href: 'https://github.com/gettakaro/takaro',
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
              href: 'https://github.com/gettakaro/takaro',
            },
            {
              label: 'Discord',
              href: 'https://catalysm.net/discord',
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
  } satisfies Preset.ThemeConfig,
};

export default config;
