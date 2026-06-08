import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import { Header } from '../../components/ui/header/Header';
import { useAuth } from '../../hooks/useAuth';
import { ChallengeService } from '../../services/challenge.service';
import bgHomeImage from '../../assets/images/bg-home.png';

const STYLES = {
  container: 'w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30',
  bgContainer: 'absolute inset-0 z-0',
  bgImage: 'w-full h-full object-cover opacity-40',
  overlay: 'absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950/95 z-0 pointer-events-none',
  foreground: 'relative z-10 flex flex-col h-full',
  content: 'flex-1 flex flex-col items-center justify-center gap-8 px-8',
  card: 'w-full max-w-md bg-slate-900/80 border border-slate-700/50 rounded-2xl p-8 flex flex-col gap-6',
  title: 'text-xs font-black tracking-[0.3em] uppercase text-amber-500',
  opponentName: 'text-3xl font-black tracking-widest uppercase text-white',
  subtitle: 'text-slate-400 text-sm font-bold',
  divider: 'border-t border-slate-700/30',
  challengeBtn: 'w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black tracking-widest uppercase rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed',
  error: 'text-rose-400 text-xs font-bold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3',
  resultCard: 'w-full max-w-md rounded-2xl p-8 flex flex-col items-center gap-4 border',
  resultWon: 'bg-emerald-500/10 border-emerald-500/30',
  resultLost: 'bg-rose-500/10 border-rose-500/30',
  resultTitle: 'text-4xl font-black tracking-widest uppercase',
  resultTitleWon: 'text-emerald-400',
  resultTitleLost: 'text-rose-400',
  resultDesc: 'text-slate-400 text-sm font-bold text-center',
  backBtn: 'px-8 py-3 bg-transparent border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-black tracking-widest uppercase text-xs rounded-xl transition-all'
};

export function ChallengeConfirmPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();

  const opponentName = (location.state as { name: string } | null)?.name ?? 'Inconnu';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<'PLAYER' | 'ENEMY' | null>(null);

  const onChallenge = async () => {
    if (!user || !id) return;
    setError(null);
    setLoading(true);

    try {
      const myCharacters = await ChallengeService.getMyCharacters(user.id);
      if (myCharacters.length === 0) {
        setError("Tu n'as aucun personnage configuré.");
        return;
      }

      const opponentCharacters = await ChallengeService.getOpponentCharacters(id);
      if (opponentCharacters.length === 0) {
        setError("Cet adversaire n'a aucun personnage configuré.");
        return;
      }

      const myTeam = await Promise.all(
        myCharacters.map(async (character) => {
          const gambits = await ChallengeService.getCharacterGambits(character._id);
          return { name: character.characterName, baseStats: {}, gambits };
        })
      );

      const opponentTeam = await Promise.all(
        opponentCharacters.map(async (character) => {
          const gambits = await ChallengeService.getCharacterGambits(character._id);
          return { name: character.characterName, baseStats: {}, gambits };
        })
      );
      
      const result = await ChallengeService.launchFight({
        playerId: user.id,
        opponentId: id,
        fightMapId: 'MAP_1',
        playerTeam: myTeam,
        opponentTeam
      });

      setWinner(result.winner);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du défi');
    } finally {
      setLoading(false);
    }
  };

  if (winner) {
    const playerWon = winner === 'PLAYER';
    return (
      <div className={STYLES.container}>
        <AnimatedBackground />
        <div className={STYLES.bgContainer}>
          <img src={bgHomeImage} alt="background" className={STYLES.bgImage} />
        </div>
        <div className={STYLES.overlay} />

        <div className={STYLES.foreground}>
          <Header title="Résultat" subtitle="PvP" onBack={() => navigate('/challenge')} />
          <div className={STYLES.content}>
            <div
              className={`${STYLES.resultCard} ${playerWon ? STYLES.resultWon : STYLES.resultLost}`}
            >
              <p
                className={`${STYLES.resultTitle} ${playerWon ? STYLES.resultTitleWon : STYLES.resultTitleLost}`}
              >
                {playerWon ? 'VICTOIRE' : 'DÉFAITE'}
              </p>
              <p className={STYLES.resultDesc}>
                {playerWon ? `Tu as battu ${opponentName} !` : `${opponentName} t'a battu.`}
              </p>
            </div>
            <button onClick={() => navigate('/')} className={STYLES.backBtn}>
              Retour au menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={STYLES.container}>
      <AnimatedBackground />
      <div className={STYLES.bgContainer}>
        <img src={bgHomeImage} alt="background" className={STYLES.bgImage} />
      </div>
      <div className={STYLES.overlay} />

      <div className={STYLES.foreground}>
        <Header title="Confirmer le défi" subtitle="PvP" onBack={() => navigate('/challenge')} />

        <div className={STYLES.content}>
          <div className={STYLES.card}>
            <p className={STYLES.title}>Tu vas défier</p>
            <p className={STYLES.opponentName}>{opponentName}</p>
            <p className={STYLES.subtitle}>
              Le combat sera simulé avec vos gambits actuels. L'adversaire sera notifié du résultat.
            </p>

            <div className={STYLES.divider} />

            {error && <div className={STYLES.error}>{error}</div>}

            <button onClick={onChallenge} disabled={loading} className={STYLES.challengeBtn}>
              {loading ? 'Simulation en cours...' : 'Lancer le défi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
