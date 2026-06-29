export type CategoryChipStyle = { chip: string; header: string };

export const CATEGORY_CHIP_STYLES: Record<string, CategoryChipStyle> = {
  health:            { chip: 'border-rose-500/30    text-rose-200',    header: 'bg-rose-500/20    text-rose-300' },
  armor:             { chip: 'border-slate-500/30   text-slate-200',   header: 'bg-slate-500/20   text-slate-300' },
  energy:            { chip: 'border-yellow-500/30  text-yellow-200',  header: 'bg-yellow-500/20  text-yellow-300' },
  status:            { chip: 'border-purple-500/30  text-purple-200',  header: 'bg-purple-500/20  text-purple-300' },
  distance_me:       { chip: 'border-sky-500/30     text-sky-200',     header: 'bg-sky-500/20     text-sky-300' },
  in_range_of_ally:  { chip: 'border-emerald-500/30 text-emerald-200', header: 'bg-emerald-500/20 text-emerald-300' },
  in_range_of_enemy: { chip: 'border-orange-500/30  text-orange-200',  header: 'bg-orange-500/20  text-orange-300' },
};

export const DEFAULT_CHIP_STYLE: CategoryChipStyle = {
  chip:   'border-slate-600/40 text-slate-200',
  header: 'bg-slate-700/50 text-slate-400',
};

export const CATEGORY_LABELS: Record<string, string> = {
  health:            'Santé',
  armor:             'Armure',
  energy:            'Énergie',
  status:            'Passif',
  distance_me:       'Distance',
  in_range_of_ally:  'Portée allié',
  in_range_of_enemy: 'Portée ennemi',
};
