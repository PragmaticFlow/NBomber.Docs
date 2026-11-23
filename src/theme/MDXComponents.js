// Registers custom components for all docs pages, so .md files can use them without imports.
// https://docusaurus.io/docs/markdown-features/react#mdx-component-scope
import MDXComponents from '@theme-original/MDXComponents';
import Since from '@site/src/components/Since';

export default {
  ...MDXComponents,
  Since,
};
