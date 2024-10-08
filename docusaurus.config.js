// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'NBomber',
  tagline: 'NBomber',
  url: 'https://nbomber.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  favicon: 'img/nbomber-logo.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'NBomber', // Usually your GitHub org/user name.
  projectName: 'NBomber', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/PragmaticFlow/NBomber.Docs/blob/dev',          
        },
        blog: {
          showReadingTime: true,          
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        // gtag: {
        //   trackingID: 'UA-139868155-1',
        //   anonymizeIP: true,
        // },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: '',
        logo: {
          alt: 'NBomber',
          src: 'img/nbomber-logo.svg',
          href: 'https://nbomber.com',
          target: '_self'
        },
        items: [
          {
            to: 'docs/getting-started/overview',
            // activeBasePath: 'docs',
            label: 'Docs',
            position: 'left',
          },
          {
            to: 'https://www.youtube.com/@nbomber5716',            
            label: 'Videos',
            position: 'left',
          },
          {
            to: 'docs/getting-started/roadmap',            
            label: 'Roadmap',
            position: 'left',
          },
          {
            to: 'https://github.com/PragmaticFlow/NBomber/issues',
            label: 'Issue Tracker',
            position: 'left',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            to: 'https://github.com/PragmaticFlow',
            label: 'GitHub',
            position: 'left',
          },
          {
            to: 'https://nbomberworkspace.slack.com/',
            label: 'Chat',
            position: 'left'
          },
          {
            to: 'https://github.com/PragmaticFlow/NBomber/tree/dev/examples/Demo',
            label: 'Examples',
            position: 'left'
          },     
        ],
      },
      footer: {
        style: 'dark',
        // links: [
        //   {
        //     title: 'Docs',
        //     items: [
        //       {
        //         label: 'Tutorial',
        //         to: '/docs/intro',
        //       },
        //     ],
        //   },
        //   {
        //     title: 'Community',
        //     items: [
        //       {
        //         label: 'Stack Overflow',
        //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //       },
        //       {
        //         label: 'Discord',
        //         href: 'https://discordapp.com/invite/docusaurus',
        //       },
        //       {
        //         label: 'Twitter',
        //         href: 'https://twitter.com/docusaurus',
        //       },
        //     ],
        //   },
        //   {
        //     title: 'More',
        //     items: [
        //       {
        //         label: 'Blog',
        //         to: '/blog',
        //       },
        //       {
        //         label: 'GitHub',
        //         href: 'https://github.com/facebook/docusaurus',
        //       },
        //     ],
        //   },
        // ],
        copyright: `Copyright © ${new Date().getFullYear()} NBomber LLC`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['csharp', 'fsharp', 'json'],
      }
    }),

    plugins: [
      require.resolve('docusaurus-lunr-search')
    ],
};

module.exports = config;
