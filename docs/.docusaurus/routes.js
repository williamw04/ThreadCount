import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '920'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'dfe'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', '203'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'bb1'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '280'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '9f0'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', 'e50'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '065'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'e49'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '6f1'),
            routes: [
              {
                path: '/decisions/',
                component: ComponentCreator('/decisions/', '611'),
                exact: true
              },
              {
                path: '/decisions/core-beliefs',
                component: ComponentCreator('/decisions/core-beliefs', '567'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/decisions/image-processing',
                component: ComponentCreator('/decisions/image-processing', '4aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/decisions/technology-selection',
                component: ComponentCreator('/decisions/technology-selection', '83b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/decisions/visual-style',
                component: ComponentCreator('/decisions/visual-style', '537'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/exec-plans/tech-debt-tracker',
                component: ComponentCreator('/exec-plans/tech-debt-tracker', '36f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/features/',
                component: ComponentCreator('/features/', '377'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/features/auth/design',
                component: ComponentCreator('/features/auth/design', '957'),
                exact: true
              },
              {
                path: '/features/auth/product-spec',
                component: ComponentCreator('/features/auth/product-spec', '357'),
                exact: true
              },
              {
                path: '/features/outfit-builder/design',
                component: ComponentCreator('/features/outfit-builder/design', '733'),
                exact: true
              },
              {
                path: '/features/outfit-builder/exec-plan',
                component: ComponentCreator('/features/outfit-builder/exec-plan', '0c5'),
                exact: true
              },
              {
                path: '/features/outfit-builder/product-spec',
                component: ComponentCreator('/features/outfit-builder/product-spec', '69a'),
                exact: true
              },
              {
                path: '/features/previous-looks/design',
                component: ComponentCreator('/features/previous-looks/design', '151'),
                exact: true
              },
              {
                path: '/features/previous-looks/product-spec',
                component: ComponentCreator('/features/previous-looks/product-spec', '89b'),
                exact: true
              },
              {
                path: '/features/style-analysis/product-spec',
                component: ComponentCreator('/features/style-analysis/product-spec', 'd48'),
                exact: true
              },
              {
                path: '/features/user-profile/product-spec',
                component: ComponentCreator('/features/user-profile/product-spec', '5cc'),
                exact: true
              },
              {
                path: '/features/virtual-wardrobe/exec-plan',
                component: ComponentCreator('/features/virtual-wardrobe/exec-plan', 'f3b'),
                exact: true
              },
              {
                path: '/features/virtual-wardrobe/product-spec',
                component: ComponentCreator('/features/virtual-wardrobe/product-spec', '757'),
                exact: true
              },
              {
                path: '/getting-started/architecture',
                component: ComponentCreator('/getting-started/architecture', '15b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/setup',
                component: ComponentCreator('/getting-started/setup', '1ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/BACKEND',
                component: ComponentCreator('/guides/BACKEND', 'a24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/FRONTEND',
                component: ComponentCreator('/guides/FRONTEND', '7e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/supabase-setup',
                component: ComponentCreator('/guides/supabase-setup', '4af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/intro',
                component: ComponentCreator('/intro', '630'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/project/QUALITY_SCORE',
                component: ComponentCreator('/project/QUALITY_SCORE', '146'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/references/api-contracts',
                component: ComponentCreator('/references/api-contracts', '974'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
