import { useAuth } from '@hooks/useAuth';
import { useState } from 'react';

export function useResetPassword(userName: string | undefined) {
  const { resetPassword, loading } = useAuth();

  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const reset = () => {
    setSecretAnswer('');
    setNewPassword('');
    setError(null);
  };

  const submit = async () => {
    if (!userName) return;
    setError(null);
    try {
      await resetPassword(userName, secretAnswer, newPassword);
      setSuccessMsg('Mot de passe mis à jour !');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
      return false;
    }
  };

  const isDisabled = loading || secretAnswer.trim() === '' || newPassword === '';

  return {
    secretAnswer,
    setSecretAnswer,
    newPassword,
    setNewPassword,
    error,
    successMsg,
    loading,
    isDisabled,
    reset,
    submit
  };
}
