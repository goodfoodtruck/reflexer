/** Suggestions d'inspiration pour nommer un gambit. */
export const INSPIRATIONS = [
  "Soin d'urgence", 'Sortie tactique', 'Coup de grâce', 'Riposte', 'Premier sang', 'Embuscade',
] as const;

export const SITUATION_CONSTANTS = {
  MAX_CHARS: 40,
  STEP_KEY: "step1",
  STEP_LABEL: "Étape 1 · Situation",
  STEP_TITLE: "Comment s'appelle ce gambit ?",
} as const;

// TODO: update si il faut
export const ADVICE_ITEMS = [
  "Court : 2 à 4 mots suffisent.",
  "Orienté intention : « Soin d'urgence » > « Règle 1 ».",
  "Lisible d'un coup d'œil dans la liste.",
] as const;