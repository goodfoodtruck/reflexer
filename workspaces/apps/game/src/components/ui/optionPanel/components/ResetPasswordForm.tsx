import { STYLES } from "../optionsPanelStyle";
import { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { SecretQuestionField } from "@components/ui/auth/SecretQuestionField";
import { FormField } from "@components/ui/auth/FormField";
import { AlertMessage } from "@components/ui/auth/AlertMessage";
import { getApiErrorMessage } from "@errors/apiErrorMessages";
import { SubmitButton } from "@components/ui/auth/SubmitButton";

type Props = {
  userName: string;
  onSuccess: () => void;
  onBack: () => void;
};

export function ResetPasswordForm({ userName, onSuccess, onBack }: Props) {
  const { resetPassword, loading } = useAuth();

  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isDisabled = loading || secretAnswer.trim() === '' || newPassword === '';

  const onSubmit = async () => {
    setError(null);
    try {
      await resetPassword(userName, secretAnswer, newPassword);
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <div className={STYLES.form}>
      <SecretQuestionField value={secretAnswer} onChange={setSecretAnswer} />

      <FormField
        label="Nouveau mot de passe"
        type="password"
        placeholder="••••••••"
        value={newPassword}
        onChange={setNewPassword}
      />

      {error && <AlertMessage type="error" message={error} />}

      <SubmitButton label="Confirmer" loading={loading} disabled={isDisabled} onClick={onSubmit} />

      <button onClick={onBack} className={STYLES.backBtn}>
        Retour
      </button>
    </div>
  );
}
