import { AnimatePresence, motion } from 'framer-motion';
import { StatRow } from './StatRow';
import type { SelectedCharacter } from './type';
import { PANEL_STYLES as STYLES, COLOR_VARIANTS, SIDE_GRADIENTS } from './Team.styles';

interface CharacterPanelProps {
  character: SelectedCharacter | null;
  color: 'amber' | 'sky';
  label: string;
  slot: number;
  align: 'left' | 'right';
  preview?: SelectedCharacter | null;
}

export function CharacterPanel({
  character,
  color,
  label,
  slot,
  align,
  preview
}: CharacterPanelProps) {
  const display = character ?? preview ?? null;
  const isPreview = !character && !!preview;
  const variant = COLOR_VARIANTS[color];

  return (
    <div
      className={`${STYLES.container} ${
        display ? `${variant.border} ${variant.glow}` : variant.emptyBorder
      }`}
    >
      {/* En-tête */}
      <div className={`${STYLES.header} ${display ? variant.border : variant.emptyBorder}`}>
        <div className={`${STYLES.slotBadge} ${display ? variant.badge : STYLES.slotBadgeEmpty}`}>
          {slot}
        </div>
        <span className={STYLES.labelText}>{label}</span>
      </div>

      {display ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={display.id}
            className={STYLES.body}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Illustration corps complet */}
            <div className={STYLES.illustrationWrapper}>
              <img
                src={display.illustration || display.portrait}
                alt={display.name}
                className={`${STYLES.illustrationImageBase} ${
                  isPreview ? STYLES.illustrationOpacityPreview : STYLES.illustrationOpacityActive
                }`}
              />
              <div className={`absolute inset-0 ${SIDE_GRADIENTS[align]}`} />
              <div className={STYLES.illustrationBottomFade} />
              {isPreview && (
                <div className={STYLES.previewLabelWrapper}>
                  <span className={STYLES.previewLabelText}>aperçu</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className={STYLES.statsWrapper}>
              <p className={`${STYLES.nameBase} ${isPreview ? STYLES.nameMuted : variant.text}`}>
                {display.name}
              </p>
              {!isPreview && (
                <>
                  <p className={STYLES.description}>{display.description}</p>
                  <div className={STYLES.statsRows}>
                    <StatRow
                      label="VIE"
                      value={display.baseStats.health}
                      max={160}
                      barColor={variant.bar}
                      color="text-rose-300"
                    />
                    <StatRow
                      label="ÉNERGIE"
                      value={display.baseStats.energy}
                      max={20}
                      barColor={variant.bar}
                      color="text-amber-300"
                    />
                    <StatRow
                      label="ARMURE"
                      value={display.baseStats.armor}
                      max={9}
                      barColor={variant.bar}
                      color="text-sky-300"
                    />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className={STYLES.emptyState}>
          <div className={STYLES.emptyIconWrapper}>
            <span className={STYLES.emptyIconText}>?</span>
          </div>
          <p className={STYLES.emptyLabel}>
            Aucun
            <br />
            sélectionné
          </p>
        </div>
      )}
    </div>
  );
}
