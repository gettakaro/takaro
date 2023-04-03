import nextra from 'nextra';
import { remarkMermaid } from 'remark-mermaid-nextra';

const withNextra = nextra({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  mdxOptions: {
    remarkPlugins: [remarkMermaid],
  },
});

export default withNextra({
  images: {
    unoptimized: true,
  },
});
