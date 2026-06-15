import { STYLES } from '../optionsPanelStyle';

type Props = { name: string; label: string };

export function UserRow({ name, label }: Props) {
  return (
    <div className={STYLES.userRow}>
      <div className={STYLES.avatar}>{name[0]?.toUpperCase()}</div>
      <div>
        <p className={STYLES.userName}>{name}</p>
        <p className={STYLES.userLabel}>{label}</p>
      </div>
    </div>
  );
}
