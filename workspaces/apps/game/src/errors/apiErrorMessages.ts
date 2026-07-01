import { ApiError } from "./ApiError"

const ERROR_MESSAGES: Record<string, string> = {
    // Auth
    PSEUDO_TAKEN:         "Ce pseudo est déjà pris, choisis-en un autre.",
    WRONG_CREDENTIALS:    "Pseudo ou mot de passe incorrect.",
    WRONG_SECRET_ANSWER:  "La réponse à la question secrète est incorrecte.",
    USER_NOT_AUTHENTICATED: "Ta session a expiré, reconnecte-toi.",

    // Utilisateurs
    USER_NOT_FOUND:       "Joueur introuvable.",

    // Équipe & gambits
    INVALID_CHARACTERS:   "Un ou plusieurs personnages sélectionnés sont invalides.",
    TEAM_EMPTY:           "Ton équipe n'est pas prête — assigne au moins un gambit à chaque personnage.",
    GAMBIT_NOT_FOUND:     "Ce gambit est introuvable.",
    CHARACTER_NOT_FOUND:  "Personnage introuvable.",

    // Combats
    NO_OPPONENT_FOUND:      "Aucun adversaire disponible pour le moment, réessaie plus tard.",
    FIGHT_NOT_FOUND:        "Ce combat est introuvable.",
    FIGHT_ENGINE_ERROR:     "Le combat n'a pas pu se dérouler correctement.",
    USER_RANKING_NOT_FOUND: "Données de classement introuvables.",

    // Parties
    RUN_NOT_FOUND:   "Cette partie est introuvable.",
    RUN_START_ERROR: "Impossible de démarrer une nouvelle partie.",

    // Générique
    INTERNAL_ERROR: "Une erreur interne est survenue, réessaie dans quelques instants.",
}

export function getApiErrorMessage(err: unknown, fallback = "Une erreur est survenue."): string {
    if (err instanceof ApiError) {
        return ERROR_MESSAGES[err.code] ?? err.userMessage ?? fallback
    }
    return fallback
}
