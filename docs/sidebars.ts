import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/setup',
        'getting-started/architecture',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/FRONTEND',
        'guides/BACKEND',
        'guides/supabase-setup',
      ],
    },
    {
      type: 'category',
      label: 'Coding Standards',
      items: [
        'guides/best-practices',
        'guides/naming-conventions',
        'guides/formatting-style',
        'guides/typescript',
      ],
    },
    {
      type: 'category',
      label: 'Decisions',
      items: [
        'decisions/technology-selection',
        'decisions/core-beliefs',
        'decisions/visual-style',
        'decisions/image-processing',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/index',
      ],
    },
    {
      type: 'category',
      label: 'References',
      items: [
        'references/api-contracts',
      ],
    },
    {
      type: 'category',
      label: 'Project',
      items: [
        'project/QUALITY_SCORE',
        'exec-plans/tech-debt-tracker',
      ],
    },
  ],
};

export default sidebars;
