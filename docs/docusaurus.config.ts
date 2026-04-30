import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Seamless',
  tagline: 'Fashion AI Web Application',
  favicon: 'img/favicon.svg',

  url: 'https://seamless-fashion.com',
  baseUrl: '/',

  // Note: docs folder is the root of this directory
  presets: [
    [
      'classic',
      {
        docs: {
          path: '.',
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
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
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
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
