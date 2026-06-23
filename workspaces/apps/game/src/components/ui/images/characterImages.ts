// Centralise la résolution des images de personnage par slug

const portraitModules = import.meta.glob(
  '../../../assets/images/character/*/portrait.png', 
  { eager: true }
) as Record<string, { default: string }>;

const illustrationModules = import.meta.glob(
  '../../../assets/images/character/*/illustration.png',
  { eager: true }
) as Record<string, { default: string }>;

const findImage = (modules: Record<string, { default: string }>, slug: string) => {
  const key = Object.keys(modules).find((k) => k.split('/').slice(-2)[0] === slug);
  return key ? modules[key].default : '';
};

export function resolveCharacterImages(slug: string) {
  return {
    portrait: findImage(portraitModules, slug),
    illustration: findImage(illustrationModules, slug)
  };
}
