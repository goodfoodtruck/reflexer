import { type GuideStep, type GuideName } from "./useGuide"

export const GUIDES: Record<GuideName, GuideStep[]> = {
    "home": [
        {
            target:      "[data-guide='nouvelle-partie']",
            title:       "Nouvelle partie",
            description: "Lance une nouvelle run. Chaque run repart de zéro — nouvel étage, nouveaux ennemis. Si tu meurs, c'est terminé.",
            position:    "right",
        },
        {
            target:      "[data-guide='historique']",
            title:       "Historique",
            description: "Retrouve toutes tes runs passées — les combats, les ennemis affrontés, et jusqu'où tu es allé.",
            position:    "right",
        },
    ],

    "team-selection": [
        {
            target:      "[data-guide='agent-card']",
            title:       "Choisis ton équipe",
            description: "Tu pars avec deux agents. Clique sur un pour configurer ses gambits, puis lance le déploiement.",
            position:    "right",
        },
        {
            target:      "[data-guide='lancer-deploiement']",
            title:       "Lancer le déploiement",
            description: "Une fois tes agents configurés, lance la run. Tu ne peux plus intervenir en combat.",
            position:    "top",
        },
    ],

    "gambit-editor": [
        {
            target:      "[data-guide='gambit-list']",
            title:       "Liste des gambits",
            description: "Un gambit = une règle de comportement. Ils s'exécutent du haut vers le bas. Le premier dont la condition est vraie déclenche son action.",
            position:    "right",
        }
    ],
}
