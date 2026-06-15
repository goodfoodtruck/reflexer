import { type GuideStep, type GuideName } from './useGuide';

export const GUIDES: Record<GuideName, GuideStep[]> = {
  'home': [
    {
      target: "[data-guide='nouvelle-partie']",
      title: 'Nouvelle partie',
      description:
        "Lance une nouvelle run. Chaque run repart de zéro — nouvel étage, nouveaux ennemis. Si tu meurs, c'est terminé.",
      position: 'right'
    },
    {
      target: "[data-guide='gambit']",
      title: 'Gambits',
      description:
        'Tes gambits sont le cerveau de tes agents. Définis quand agir, qui cibler, et comment frapper. Chaque gambit est une règle de combat.',
      position: 'right'
    },
    {
      target: "[data-guide='arene']",
      title: 'Arène',
      description: 'Mets à l’épreuve ta stratégie contre d’autres joueurs, consulte ton classement et affronte tes amis.',
      position: 'right'
    },
    {
      target: "[data-guide='notification-bell']",
      title: 'Notification',
      description: 'Tu peux recevoir des notifications importantes ici.',
      position: 'bottom'
    }
  ],

  'team-selection': [
    {
      target: "[data-guide='agent-card']",
      title: 'Choisis ton équipe',
      description:
        'Tu pars avec deux agents. Clique sur un pour configurer ses gambits, puis lance le déploiement.',
      position: 'center'
    }
  ],

  'gambit-editor': [
    {
      target: "[data-guide='gambit-list']",
      title: 'Liste des gambits',
      description:
        "Un gambit : une règle de comportement. Ils s'exécutent du haut vers le bas. Le premier dont la condition est vraie déclenche son action.",
      position: 'right'
    }
  ]
};
