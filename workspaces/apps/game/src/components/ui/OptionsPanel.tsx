import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth.ts';

type View = 'main' | 'reset';

type Props = {
  onClose: () => void;
};

const SECRET_QUESTION = 'Quel est le prénom de votre mère ?';

const STYLES = {
  backdrop: 'fixed inset-0 z-50 flex items-center justify-center',
  overlay: 'absolute inset-0 bg-black/60 backdrop-blur-sm',
  panel: 'relative z-10 w-full max-w-sm bg-slate-900/95 border border-slate-700/50 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl',
  header: 'flex items-center justify-between',
  title: 'text-xs section-title text-amber-500',
  closeBtn: 'text-slate-500 hover:text-white transition-colors text-xl font-bold leading-none',
  userRow: 'flex items-center gap-4 p-4 bg-slate-800/50 border border-slate-700/30 rounded-xl',
  avatar: 'w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-black text-sm',
  userName: 'text-white font-black tracking-widest uppercase',
  userLabel: 'text-slate-500 text-[10px] uppercase tracking-widest font-bold',
  divider: 'border-t border-slate-700/30',
  form: 'flex flex-col gap-4',
  label: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1',
  question: 'text-xs text-amber-500/80 font-bold italic mb-1',
  input: 'w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-all font-bold placeholder-slate-600 text-sm',
  error: 'text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2',
  success: 'text-emerald-400 text-xs font-bold text-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2',
  resetBtn: 'w-full py-3 bg-transparent border border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-black tracking-widest uppercase text-xs rounded-xl transition-all',
  submitBtn: 'w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  logoutBtn: 'w-full py-3 bg-transparent border border-rose-500/30 hover:border-rose-500 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 font-black tracking-widest uppercase text-xs rounded-xl transition-all',
  loginBtn: 'w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all',
  backBtn: 'text-slate-600 text-xs hover:text-slate-400 transition-colors tracking-widest uppercase font-bold text-center'
};

export function OptionsPanel({ onClose }: Props) {
  const navigate = useNavigate();
  const { user, logout, resetPassword, loading, isAuthenticated } = useAuth();

  const [view, setView] = useState<View>('main');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const onLogout = () => {
    logout();
    navigate('/auth');
  };

  const onLogin = () => {
    onClose();
    navigate('/auth');
  };

  const onOpenReset = () => {
    setView('reset');
    setError(null);
    setSecretAnswer('');
    setNewPassword('');
  };

  const onSubmitReset = async () => {
    if (!user) return;
    setError(null);
    try {
      await resetPassword(user.name, secretAnswer, newPassword);
      setSuccessMsg('Mot de passe mis à jour !');
      setView('main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const isResetDisabled = loading || secretAnswer.trim() === '' || newPassword === '';

  return (
    <div className={STYLES.backdrop}>
      <div className={STYLES.overlay} onClick={onClose} />

      <div className={STYLES.panel}>
        <div className={STYLES.header}>
          <span className={STYLES.title}>
            {view === 'main' ? 'Options' : 'Changer le mot de passe'}
          </span>
          <button onClick={onClose} className={STYLES.closeBtn}>
            ×
          </button>
        </div>

        {view === 'main' && (
          <>
            {isAuthenticated && user ? (
              <>
                <div className={STYLES.userRow}>
                  <div className={STYLES.avatar}>{user.name[0]?.toUpperCase()}</div>
                  <div>
                    <p className={STYLES.userName}>{user.name}</p>
                    <p className={STYLES.userLabel}>Connecté</p>
                  </div>
                </div>

                {successMsg && <div className={STYLES.success}>{successMsg}</div>}

                <div className={STYLES.divider} />

                <button onClick={onOpenReset} className={STYLES.resetBtn}>
                  Changer le mot de passe
                </button>

                <button onClick={onLogout} className={STYLES.logoutBtn}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <div className={STYLES.userRow}>
                  <div className={STYLES.avatar}>?</div>
                  <div>
                    <p className={STYLES.userName}>Invité</p>
                    <p className={STYLES.userLabel}>Non connecté</p>
                  </div>
                </div>

                <div className={STYLES.divider} />

                <button onClick={onLogin} className={STYLES.loginBtn}>
                  Se connecter
                </button>
              </>
            )}
          </>
        )}

        {view === 'reset' && (
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

            <button onClick={onSubmitReset} disabled={isResetDisabled} className={STYLES.submitBtn}>
              {loading ? '...' : 'Confirmer'}
            </button>

            <button onClick={() => setView('main')} className={STYLES.backBtn}>
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
