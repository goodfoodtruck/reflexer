import { type GuideStep, type GuideName } from './useGuide';

export const GUIDES: Record<GuideName, GuideStep[]> = {
  'home': [
    {
      target: "[data-guide='nav-arene']",
      title: 'Arène',
      description: 'Ton tableau de bord. Mets à l’épreuve ta stratégie contre d’autres joueurs, consulte ton classement et affronte tes amis.',
      position: 'bottom'
    },
    {
      target: "[data-guide='nav-gambits']",
      title: 'Gambits',
      description:
        'Tes gambits sont le cerveau de tes agents. Définis quand agir, qui cibler, et comment frapper. Chaque gambit est une règle de combat.',
      position: 'bottom'
    },
    {
      target: "[data-guide='nav-equipe']",
      title: 'Équipe',
      description:
        'Compose ton duo d’agents depuis la mosaïque des personnages.',
      position: 'bottom'
    },
    {
      target: "[data-guide='notification-bell']",
      title: 'Notification',
      description: 'Tu peux recevoir des notifications importantes ici.',
      position: 'bottom'
    },
    {
      target: "[data-guide='nav-profil']",
      title: 'Profil',
      description: 'Gère ton compte : mot de passe et déconnexion.',
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
