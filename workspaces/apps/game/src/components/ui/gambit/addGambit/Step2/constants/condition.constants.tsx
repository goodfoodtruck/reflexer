import { IconCharacter } from "@assets/icons/IconCharacter";
import { IconEnemy } from "@assets/icons/IconEnemy";
import { IconOther } from "@assets/icons/IconOther";
import { IconSelf } from "@assets/icons/IconSelf";


export const TARGET_OPTIONS = [
  { id: 'SELF',  label: 'Moi-même', icon: <IconSelf /> },
  { id: 'ENEMY', label: 'Ennemi',   icon: <IconEnemy /> },
  { id: 'ALLY',  label: 'Allié',    icon: <IconCharacter /> },
  { id: 'OTHER', label: 'Autre',    icon: <IconOther /> },
] as const;

export type TargetId = (typeof TARGET_OPTIONS)[number]['id'];

export const ANIMATIONS = {
  selectTarget: {
    initial:    { opacity: 0, x: 20 },
    animate:    { opacity: 1, x: 0 },
    exit:       { opacity: 0, x: -20 },
    transition: { duration: 0.2 },
  },
  buildCondition: {
    initial:  { opacity: 0, y: 10 },
    animate:  { opacity: 1, y: 0 },
  },
} as const;