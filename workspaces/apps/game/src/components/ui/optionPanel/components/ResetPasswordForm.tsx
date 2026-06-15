import { STYLES } from "../optionsPanelStyle";
import { useResetPassword } from "../useResetPassword";

type Props = {
  userName: string;
  onSuccess: () => void;
  onBack: () => void;
};

const SECRET_QUESTION = 'Quel est le prénom de votre mère ?';

export function ResetPasswordForm({ userName, onSuccess, onBack }: Props) {
  const {
    secretAnswer,
    setSecretAnswer,
    newPassword,
    setNewPassword,
    error,
    loading,
    isDisabled,
    submit
  } = useResetPassword(userName);

  const handleSubmit = async () => {
    const ok = await submit();
    if (ok) onSuccess();
  };

  return (
    <div className={STYLES.form}>
      <div>
        <p className={STYLES.label}>Question secrète</p>
        <p className={STYLES.question}>{SECRET_QUESTION}</p>
        <input
          type="text"
          className={STYLES.input}
          placeholder="Votre réponse"
          value={secretAnswer}
          onChange={(e) => setSecretAnswer(e.target.value)}
          autoFocus
        />
      </div>

      <div>
        <p className={STYLES.label}>Nouveau mot de passe</p>
        <input
          type="password"
          className={STYLES.input}
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      {error && <div className={STYLES.error}>{error}</div>}

      <button onClick={handleSubmit} disabled={isDisabled} className={STYLES.submitBtn}>
        {loading ? '...' : 'Confirmer'}
      </button>

      <button onClick={onBack} className={STYLES.backBtn}>
        Retour
      </button>
    </div>
  );
}
