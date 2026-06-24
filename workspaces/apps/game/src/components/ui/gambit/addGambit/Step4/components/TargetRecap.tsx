import type { ConfiguredTarget, FilterOrGroup } from '../useTargetStep';
import { formatOrGroup } from '../useTargetStep';
import { IconEdit } from '../../../../../../assets/icons/IconEdit';
import { IconTrash } from '../../../../../../assets/icons/IconTrash';
import { Styles_recap } from '../Target.styles';

const TARGET_KINDS = [
  { id: 'ENEMY', label: 'Ennemi' },
  { id: 'ALLY',  label: 'Allié' },
  { id: 'SELF',  label: 'Moi-même' },
];

interface TargetRecapProps {
  configuredTarget: ConfiguredTarget;
  targetIcon: React.ReactNode;
  onEdit: () => void;
  onReset: () => void;
  onRemoveFilter: (index: number) => void;
}

export function TargetRecap({
  configuredTarget,
  targetIcon,
  onEdit,
  onReset,
  onRemoveFilter
}: TargetRecapProps) {
  const kindLabel =
    TARGET_KINDS.find((t) => t.id === configuredTarget.kind)?.label ?? configuredTarget.kind;
  const isSelf = configuredTarget.kind === 'SELF';
  const hasFilters = configuredTarget.filters.length > 0;

  return (
    <div className="flex-1 flex flex-col mt-4 gap-4">
      <div className={Styles_recap.recapHeader}>
        <div className={Styles_recap.avatarBox}>
          {targetIcon}
          <span className="text-[10px] font-black mt-2 tracking-[0.2em]">{kindLabel}</span>
        </div>
        <div className={Styles_recap.recapHeaderInfo}>
          <span className={Styles_recap.recapHeaderTitle}>Cible : {kindLabel}</span>
          <span className={Styles_recap.recapHeaderSub}>
            {isSelf
              ? 'Soi-même — ni filtre ni tri'
              : hasFilters
                ? `${configuredTarget.filters.length} filtre(s) actif(s)`
                : 'Aucun filtre — cible par défaut'}
          </span>
        </div>
        <div className={Styles_recap.recapHeaderActions}>
          {!isSelf && (
            <button onClick={onEdit} className={Styles_recap.btnActionEdit}>
              <IconEdit /> Éditer
            </button>
          )}
          <button onClick={onReset} className={Styles_recap.btnActionReset}>
            <IconTrash /> Reset
          </button>
        </div>
      </div>

      {!isSelf && (
        <>
          <div className={Styles_recap.recapContainer}>
            <span className={Styles_recap.label}>Critères</span>
            {hasFilters ? (
              <div className={Styles_recap.recapFiltersRow}>
                {configuredTarget.filters.map((group, i) => (
                  <FilterBadge key={i} group={group} index={i} onRemove={onRemoveFilter} />
                ))}
              </div>
            ) : (
              <p className={Styles_recap.recapEmptyFilters}>
                Cible par défaut — tous les ennemis/alliés sans distinction.
              </p>
            )}
          </div>

          <div className={Styles_recap.recapContainer}>
            <span className={Styles_recap.label}>Priorité de ciblage</span>
            <div className="mt-2">
              <span className={`${Styles_recap.blockSolid} ${Styles_recap.baseBadge}`}>
                {configuredTarget.sortVal?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterBadge({
  group,
  index,
  onRemove
}: {
  group: FilterOrGroup;
  index: number;
  onRemove: (i: number) => void;
}) {
  return (
    <div className={Styles_recap.filterBadge}>
      <span className={Styles_recap.filterBadgeText}>{formatOrGroup(group)}</span>
      <button
        onClick={() => onRemove(index)}
        className={Styles_recap.filterBadgeDelete}
        title="Supprimer ce filtre"
      >
        <IconTrash />
      </button>
    </div>
  );
}
