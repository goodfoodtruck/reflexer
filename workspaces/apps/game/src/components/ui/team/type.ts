export type SelectedCharacter = {
  id: string;
  slug: string;
  name: string;
  description: string;
  baseStats: { health: number; energy: number; armor: number };
  portrait: string;
  illustration: string;
};