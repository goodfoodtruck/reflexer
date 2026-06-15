import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { PanelBackdrop } from './components/PanelBackdrop';
import { PanelHeader } from './components/PanelHeader';
import { UserRow } from './components/UserRow';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { STYLES } from './optionsPanelStyle';

export type View = 'main' | 'reset';

export function OptionsPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [view, setView] = useState<View>('main');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  const handleLogin = () => {
    onClose();
    navigate('/auth');
  };
  const handleOpenReset = () => setView('reset');
  const handleResetSuccess = () => {
    setSuccessMsg('Mot de passe mis à jour !');
    setView('main');
  };

  return (
    <PanelBackdrop onClose={onClose}>
      <PanelHeader view={view} onClose={onClose} />

      {view === 'main' && (
        <>
          {isAuthenticated && user ? (
            <>
              <UserRow name={user.name} label="Connecté" />
              {successMsg && <div className={STYLES.success}>{successMsg}</div>}
              <div className={STYLES.divider} />
              <button onClick={handleOpenReset} className={STYLES.resetBtn}>
                Changer le mot de passe
              </button>
              <button onClick={handleLogout} className={STYLES.logoutBtn}>
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <UserRow name="?" label="Non connecté" />
              <div className={STYLES.divider} />
              <button onClick={handleLogin} className={STYLES.loginBtn}>
                Se connecter
              </button>
            </>
          )}
        </>
      )}

      {view === 'reset' && user && (
        <ResetPasswordForm
          userName={user.name}
          onSuccess={handleResetSuccess}
          onBack={() => setView('main')}
        />
      )}
    </PanelBackdrop>
  );
}
