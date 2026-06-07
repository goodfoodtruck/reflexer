import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import { useAuth } from '../../hooks/useAuth';
import bgHomeImage from '../../assets/images/bg-home.png';
import herosImage from '../../assets/images/heros.png';

type Mode = 'login' | 'register' | 'reset';

const SECRET_QUESTION = 'Quel est le prénom de votre mère ?';

const STYLES = {
  container: 'w-screen h-screen font-sans relative overflow-hidden flex flex-col items-center justify-center selection:bg-amber-500/30 bg-black',
  bgContainer: 'absolute inset-0 z-0',
  bgImage: 'w-full h-full object-cover opacity-40',
  overlay: 'absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950/90 z-0 pointer-events-none',
  heroContainer: 'absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] pointer-events-none opacity-20',
  heroImage: 'w-full h-full object-contain',
  card: 'relative z-10 w-full max-w-sm flex flex-col gap-6',
  title: 'text-5xl font-black tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700',
  subtitle: 'text-amber-500/70 tracking-[0.5em] text-xs uppercase font-bold text-center',
  tabs: 'flex border border-slate-700/50 rounded-xl overflow-hidden',
  tabActive: 'flex-1 py-3 text-xs font-black tracking-widest uppercase bg-amber-500 text-black transition-all',
  tabInactive: 'flex-1 py-3 text-xs font-black tracking-widest uppercase bg-transparent text-slate-500 hover:text-slate-300 transition-all',
  form: 'flex flex-col gap-4',
  label: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1',
  question: 'text-xs text-amber-500/80 font-bold italic mb-1',
  input: 'w-full bg-slate-900/80 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-all font-bold placeholder-slate-600',
  error: 'text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3',
  success: 'text-emerald-400 text-xs font-bold text-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3',
  submitBtn: 'w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  bottomRow: 'flex flex-col items-center gap-2',
  linkBtn: 'text-slate-600 text-xs hover:text-slate-400 transition-colors tracking-widest uppercase font-bold'
};

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, resetPassword, loading, error, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const onSwitchMode = (next: Mode) => {
    setMode(next);
    setSuccessMsg(null);
    setPassword('');
    setSecretAnswer('');
    setNewPassword('');
  };

  const onSubmit = async () => {
    try {
      if (mode === 'login') {
        await login(name, password);
        navigate('/');
      } else if (mode === 'register') {
        await register(name, password, secretAnswer);
        navigate('/');
      } else {
        await resetPassword(name, secretAnswer, newPassword);
        setSuccessMsg('Mot de passe mis à jour ! Tu peux maintenant te connecter.');
        onSwitchMode('login');
      }
    } catch {
        // ici rien
       // erreur déjà gérée dans useAuth
    }
  };

  const isDisabled = (() => {
    if (loading || name.trim() === '') return true;
    if (mode === 'login') return password === '';
    if (mode === 'register') return password === '' || secretAnswer.trim() === '';
    if (mode === 'reset') return secretAnswer.trim() === '' || newPassword === '';
    return true;
  })();

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
              onClick={() => onSwitchMode('login')}
              className={mode === 'login' ? STYLES.tabActive : STYLES.tabInactive}
            >
              Connexion
            </button>
            <button
              onClick={() => onSwitchMode('register')}
              className={mode === 'register' ? STYLES.tabActive : STYLES.tabInactive}
            >
              Inscription
            </button>
          </div>
        )}

        <div className={STYLES.form}>
          <div>
            <p className={STYLES.label}>Pseudo</p>
            <input
              type="text"
              className={STYLES.input}
              placeholder="Ton nom de guerrier"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <p className={STYLES.label}>Mot de passe</p>
              <input
                type="password"
                className={STYLES.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {(mode === 'register' || mode === 'reset') && (
            <div>
              <p className={STYLES.label}>Question secrète</p>
              <p className={STYLES.question}>{SECRET_QUESTION}</p>
              <input
                type="text"
                className={STYLES.input}
                placeholder="Votre réponse"
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
              />
            </div>
          )}

          {mode === 'reset' && (
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
          )}

          {error && <div className={STYLES.error}>{error}</div>}
          {successMsg && <div className={STYLES.success}>{successMsg}</div>}

          <button onClick={onSubmit} disabled={isDisabled} className={STYLES.submitBtn}>
            {loading
              ? '...'
              : mode === 'login'
                ? 'Entrer'
                : mode === 'register'
                  ? 'Créer mon compte'
                  : 'Réinitialiser'}
          </button>
        </div>

        <div className={STYLES.bottomRow}>
          {mode === 'login' && (
            <button onClick={() => onSwitchMode('reset')} className={STYLES.linkBtn}>
              Mot de passe oublié ?
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => onSwitchMode('login')} className={STYLES.linkBtn}>
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
