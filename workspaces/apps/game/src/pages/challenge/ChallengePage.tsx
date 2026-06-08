import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/ui/header/Header';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import bgHomeImage from '../../assets/images/bg-home.png';
import { UserService, type PlayerSearchResult } from '../../services';
import { NotificationService } from '../../services/notification.service';
import { useAuth } from '../../hooks/useAuth';

const STYLES = {
  container: 'w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30',
  bgContainer: 'absolute inset-0 z-0',
  bgImage: 'w-full h-full object-cover opacity-40',
  overlay: 'absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950/95 z-0 pointer-events-none',
  foreground: 'relative z-10 flex flex-col h-full',
  content: 'flex-1 flex flex-col items-center justify-start pt-16 px-8 gap-8',
  searchWrapper: 'w-full max-w-lg flex flex-col gap-4',
  label: 'text-[10px] font-black tracking-[0.3em] uppercase text-amber-500',
  inputRow: 'flex gap-3',
  input: 'flex-1 bg-slate-900/80 border border-slate-700/50 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-all font-bold placeholder-slate-600 text-sm',
  searchBtn: 'px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs',
  resultsWrapper: 'w-full max-w-lg flex flex-col gap-3',
  resultsTitle: 'text-[10px] font-black tracking-[0.3em] uppercase text-slate-500',
  resultItem: 'flex items-center justify-between px-5 py-4 bg-slate-900/60 border border-slate-700/50 rounded-xl',
  resultName: 'text-sm font-black tracking-widest uppercase text-white',
  challengeBtn: 'px-5 py-2 bg-transparent border border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/10 text-amber-400 hover:text-amber-300 font-black tracking-widest uppercase text-xs rounded-lg transition-all',
  empty: 'text-center text-slate-500 text-xs font-bold uppercase tracking-widest py-8',
  error: 'text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3',
  success: 'text-emerald-400 text-xs font-bold text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3'
};

export function ChallengePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const onSearch = async () => {
    if (query.trim() === '') return;
    setError(null);
    setLoading(true);
    try {
      const data = await UserService.search(query.trim());
      setResults(data.filter(player => player._id !== user?.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de recherche');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  // TODO : actuellement mock d'une notif 
  const onChallenge = async (player: PlayerSearchResult) => {
    try {
        await NotificationService.sendTestNotification(player._id)
        setSuccessMsg(`Défi envoyé à ${player.name} !`)
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
    }
    // navigate(`/challenge/${player._id}`, { state: { name: player.name } });
  };

  return (
    <div className={STYLES.container}>
      <AnimatedBackground />

      <div className={STYLES.bgContainer}>
        <img src={bgHomeImage} alt="background" className={STYLES.bgImage} />
      </div>

      <div className={STYLES.overlay} />

      <div className={STYLES.foreground}>
        <Header title="Défier un joueur" subtitle="PvP" onBack={() => navigate('/')} />

        <div className={STYLES.content}>
          <div className={STYLES.searchWrapper}>
            <p className={STYLES.label}>Rechercher par pseudo</p>
            <div className={STYLES.inputRow}>
              <input
                type="text"
                className={STYLES.input}
                placeholder="Nom du joueur..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                autoFocus
              />
              <button
                onClick={onSearch}
                disabled={loading || query.trim() === ''}
                className={STYLES.searchBtn}
              >
                {loading ? '...' : 'Chercher'}
              </button>
            </div>

            {error && <div className={STYLES.error}>{error}</div>}
            {successMsg && <div className={STYLES.success}>{successMsg}</div>}
          </div>

          {results.length > 0 && (
            <div className={STYLES.resultsWrapper}>
              <p className={STYLES.resultsTitle}>
                {results.length} joueur{results.length > 1 ? 's' : ''} trouvé
                {results.length > 1 ? 's' : ''}
              </p>
              {results.map((player) => (
                <div key={player._id} className={STYLES.resultItem}>
                  <span className={STYLES.resultName}>{player.name}</span>
                  <button onClick={() => onChallenge(player)} className={STYLES.challengeBtn}>
                    Défier
                  </button>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && query !== '' && !loading && (
            <p className={STYLES.empty}>Aucun joueur trouvé</p>
          )}
        </div>
      </div>
    </div>
  );
}
