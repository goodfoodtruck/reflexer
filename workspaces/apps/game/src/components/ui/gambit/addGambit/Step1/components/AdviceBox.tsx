import { InfoIcon } from "../../../../../../assets/icons/IconInfo";
import { Styles } from "../Situation.styles";
import { ADVICE_ITEMS } from "../constants/situation.constants";

export function AdviceBox() {
  return (
    <div className={Styles.adviceBox}>
      <div className={Styles.adviceHeader}>
        <InfoIcon className="w-4 h-4" />
        Conseils
      </div>

      <ul className={Styles.adviceList}>
        {ADVICE_ITEMS.map((advice) => (
          <li key={advice} className={Styles.adviceItem}>
            <div className={Styles.adviceDot} />
            <span>{advice}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}