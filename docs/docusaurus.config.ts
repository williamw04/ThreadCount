import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Seamless',
  tagline: 'Fashion AI Web Application',
  favicon: 'img/favicon.svg',

  url: 'https://seamless-fashion.com',
  baseUrl: '/',

  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'ignore',

  // Note: docs folder is the root of this directory
  presets: [
    [
      'classic',
      {
        docs: {
          path: '.',
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          exclude: ['**/node_modules/**', '**/build/**'],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Seamless',
      items: [
        {
          to: '/docs/intro',
          label: 'Home',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/anomalyco/seamless',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright ${new Date().getFullYear()} Seamless. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
