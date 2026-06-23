import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import bgHomeImage from '../../assets/images/bg-home.png';
import herosImage from '../../assets/images/heros.png';
import { STYLES } from './authStyle';
import { FormField } from '@components/ui/auth/FormField';
import { SecretQuestionField } from '@components/ui/auth/SecretQuestionField';
import { AlertMessage } from '@components/ui/auth/AlertMessage';
import { SubmitButton } from '@components/ui/auth/SubmitButton';

type Mode = 'login' | 'register' | 'reset';

const SUBMIT_LABELS: Record<Mode, string> = {
  login: 'Entrer',
  register: 'Créer mon compte',
  reset: 'Réinitialiser'
};

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, resetPassword, loading, error, isAuthenticated, checkingSession } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!checkingSession && isAuthenticated) navigate('/');
  }, [isAuthenticated, checkingSession, navigate]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setSuccessMsg(null);
    setPassword('');
    setSecretAnswer('');
    setNewPassword('');
  };

  const isDisabled =
    loading ||
    name.trim() === '' ||
    (mode === 'login' && password === '') ||
    (mode === 'register' && (password === '' || secretAnswer.trim() === '')) ||
    (mode === 'reset' && (secretAnswer.trim() === '' || newPassword === ''));

  const onSubmit = async () => {
    try {
      if (mode === 'login') {
        await login(name, password);
        navigate('/');
      }
      if (mode === 'register') {
        await register(name, password, secretAnswer);
        navigate('/');
      }
      if (mode === 'reset') {
        await resetPassword(name, secretAnswer, newPassword);
        setSuccessMsg('Mot de passe mis à jour ! Tu peux maintenant te connecter.');
        switchMode('login');
      }
    } catch {
      console.log('erreur auth page');
    }
  };

  return (
    <div className={STYLES.container}>
      <AnimatedBackground />

      <div className={STYLES.bgContainer}>
        <img src={bgHomeImage} alt="Reflexer Background" className={STYLES.bgImage} />
      </div>

      <div className={STYLES.overlay} />

      <div className={STYLES.heroContainer}>
        <img src={herosImage} alt="" className={STYLES.heroImage} />
      </div>

      <div className={STYLES.card}>
        <div>
          <h1 className={STYLES.title}>REFLEXER</h1>
          <p className={STYLES.subtitle}>Tactical Roguelike</p>
        </div>

        {mode !== 'reset' && (
          <div className={STYLES.tabs}>
            <button
              onClick={() => switchMode('login')}
              className={mode === 'login' ? STYLES.tabActive : STYLES.tabInactive}
            >
              Connexion
            </button>
            <button
              onClick={() => switchMode('register')}
              className={mode === 'register' ? STYLES.tabActive : STYLES.tabInactive}
            >
              Inscription
            </button>
          </div>
        )}

        <div className={STYLES.form}>
          <FormField
            label="Pseudo"
            placeholder="Ton nom de guerrier"
            value={name}
            onChange={setName}
            autoFocus
          />

          {mode !== 'reset' && (
            <FormField
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
            />
          )}

          {(mode === 'register' || mode === 'reset') && (
            <SecretQuestionField value={secretAnswer} onChange={setSecretAnswer} />
          )}

          {mode === 'reset' && (
            <FormField
              label="Nouveau mot de passe"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={setNewPassword}
            />
          )}

          {error && <AlertMessage type="error" message={error} />}
          {successMsg && <AlertMessage type="success" message={successMsg} />}

          <SubmitButton
            label={SUBMIT_LABELS[mode]}
            loading={loading}
            disabled={isDisabled}
            onClick={onSubmit}
          />
        </div>

        <div className={STYLES.bottomRow}>
          {mode === 'login' && (
            <button onClick={() => switchMode('reset')} className={STYLES.linkBtn}>
              Mot de passe oublié ?
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => switchMode('login')} className={STYLES.linkBtn}>
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
