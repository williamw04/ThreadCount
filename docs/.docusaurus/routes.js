import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/ThreadCount/docs',
    component: ComponentCreator('/ThreadCount/docs', 'f0a'),
    routes: [
      {
        path: '/ThreadCount/docs',
        component: ComponentCreator('/ThreadCount/docs', 'e28'),
        routes: [
          {
            path: '/ThreadCount/docs',
            component: ComponentCreator('/ThreadCount/docs', '153'),
            routes: [
              {
                path: '/ThreadCount/docs/',
                component: ComponentCreator('/ThreadCount/docs/', 'dad'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/decisions/',
                component: ComponentCreator('/ThreadCount/docs/decisions/', '041'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/decisions/core-beliefs',
                component: ComponentCreator('/ThreadCount/docs/decisions/core-beliefs', 'db0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/decisions/image-processing',
                component: ComponentCreator('/ThreadCount/docs/decisions/image-processing', 'ea6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/decisions/technology-selection',
                component: ComponentCreator('/ThreadCount/docs/decisions/technology-selection', '0cc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/decisions/visual-style',
                component: ComponentCreator('/ThreadCount/docs/decisions/visual-style', '314'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/exec-plans/tech-debt-tracker',
                component: ComponentCreator('/ThreadCount/docs/exec-plans/tech-debt-tracker', 'ca7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/features/',
                component: ComponentCreator('/ThreadCount/docs/features/', 'a28'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/features/auth/design',
                component: ComponentCreator('/ThreadCount/docs/features/auth/design', '12a'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/auth/product-spec',
                component: ComponentCreator('/ThreadCount/docs/features/auth/product-spec', 'b3b'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/outfit-builder/design',
                component: ComponentCreator('/ThreadCount/docs/features/outfit-builder/design', 'fd8'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/outfit-builder/exec-plan',
                component: ComponentCreator('/ThreadCount/docs/features/outfit-builder/exec-plan', '961'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/outfit-builder/product-spec',
                component: ComponentCreator('/ThreadCount/docs/features/outfit-builder/product-spec', '9df'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/previous-looks/design',
                component: ComponentCreator('/ThreadCount/docs/features/previous-looks/design', 'a20'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/previous-looks/product-spec',
                component: ComponentCreator('/ThreadCount/docs/features/previous-looks/product-spec', '321'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/style-analysis/product-spec',
                component: ComponentCreator('/ThreadCount/docs/features/style-analysis/product-spec', '0a7'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/user-profile/product-spec',
                component: ComponentCreator('/ThreadCount/docs/features/user-profile/product-spec', 'd34'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/virtual-wardrobe/exec-plan',
                component: ComponentCreator('/ThreadCount/docs/features/virtual-wardrobe/exec-plan', 'f8d'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/features/virtual-wardrobe/product-spec',
                component: ComponentCreator('/ThreadCount/docs/features/virtual-wardrobe/product-spec', 'c24'),
                exact: true
              },
              {
                path: '/ThreadCount/docs/getting-started/architecture',
                component: ComponentCreator('/ThreadCount/docs/getting-started/architecture', '2c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/getting-started/setup',
                component: ComponentCreator('/ThreadCount/docs/getting-started/setup', '4ac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/guides/BACKEND',
                component: ComponentCreator('/ThreadCount/docs/guides/BACKEND', '226'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/guides/best-practices',
                component: ComponentCreator('/ThreadCount/docs/guides/best-practices', '02a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/guides/formatting-style',
                component: ComponentCreator('/ThreadCount/docs/guides/formatting-style', '925'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/guides/FRONTEND',
                component: ComponentCreator('/ThreadCount/docs/guides/FRONTEND', 'bb3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/guides/naming-conventions',
                component: ComponentCreator('/ThreadCount/docs/guides/naming-conventions', '52e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/guides/supabase-setup',
                component: ComponentCreator('/ThreadCount/docs/guides/supabase-setup', '626'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/guides/typescript',
                component: ComponentCreator('/ThreadCount/docs/guides/typescript', 'a39'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/intro',
                component: ComponentCreator('/ThreadCount/docs/intro', '55a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/project/QUALITY_SCORE',
                component: ComponentCreator('/ThreadCount/docs/project/QUALITY_SCORE', 'f6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ThreadCount/docs/references/api-contracts',
                component: ComponentCreator('/ThreadCount/docs/references/api-contracts', '58c'),
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
