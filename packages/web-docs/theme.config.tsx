import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';

const config: DocsThemeConfig = {
  logo: <span>Takaro</span>,
  project: {
    link: 'https://github.com/gettakaro/takaro',
  },
  chat: {
    link: 'https://aka.candaele.dev/discord',
  },
  docsRepositoryBase:
    'https://github.com/gettakaro/takaro/tree/main/packages/web-docs',
  footer: {
    text: 'Takaro Documentation',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Takaro',
    };
  },
};

export default config;
