
import { EmptyDetailsIcon } from '../../../../../../assets/icons/IconEmptyDetails';
import { PlaceholderIcon } from '../../../../../../assets/icons/IconPlaceholder';
import { Styles } from '../Intent.styles';

interface ActionDetails {
  name: string;
  categoryName: string;
  image?: string;
  cost?: number;
  effect?: string;
  description?: string;
}

interface ActionDetailPanelProps {
  details: ActionDetails | null;
}

export function ActionDetailPanel({ details }: ActionDetailPanelProps) {
  return (
    <div className={Styles.colDetails}>
      {!details ? (
        <div className={Styles.emptyDetails}>
          <EmptyDetailsIcon className="w-12 h-12 text-slate-700" />
          <p>Sélectionnez une action<br />pour voir ses détails.</p>
        </div>
      ) : (
        <>
          <div className={Styles.detailHeader}>
            <div className={Styles.detailIconBig}>
              {details.image
                ? <img src={details.image} alt={details.name} className={Styles.detailIconImg} />
                : <PlaceholderIcon className="w-8 h-8" />
              }
            </div>
            <div className="flex flex-col justify-center">
              <h4 className={Styles.detailTitle}>{details.name}</h4>
              <span className={Styles.detailSubtitle}>{details.categoryName}</span>
            </div>
          </div>

          <div className="flex flex-col">
            {details.cost !== undefined && (
              <div className={Styles.detailTextRow}>
                Coût : <span className={Styles.detailTextBold}>{details.cost}</span> énergie
              </div>
            )}
          </div>

          {details.effect && (
            <div>
              <h5 className={Styles.detailSectionTitle}>Effets</h5>
              <p className={Styles.detailEffectText}>{details.effect}</p>
            </div>
          )}

          <p className={Styles.detailDesc}>{details.description}</p>
        </>
      )}
    </div>
  );
}