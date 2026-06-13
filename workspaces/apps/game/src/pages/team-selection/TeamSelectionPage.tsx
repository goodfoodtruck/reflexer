import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedBackground } from '../../components/ui/AnimatedBackground';
import { Header } from '../../components/ui/header/Header';
import { IconPause } from '../../assets/icons/IconPause';
import bgHomeImage from '../../assets/images/bg-home.png';
import heroM from '../../assets/images/hero-m.png';
import heroW from '../../assets/images/hero-w.png';
import { AgentCard } from '../../components/ui/agent/AgentCard';
import { STYLES } from './Team.styles';
import { CharacterService, type Character } from '@services/character.service';

export function TeamSelectionPage() {
  const navigate = useNavigate();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const HERO_IMAGES = [heroM, heroW];

  useEffect(() => {
    CharacterService.getAll()
      .then((data) => setCharacters(data))
      .catch((err) => console.error('Erreur chargement characters:', err));
  }, []);

  const handleBack = () => navigate('/');
  const handleBuildHero = (characterId: string) => navigate(`/gestion-gambits/${characterId}`);

  return (
    <div className={STYLES.container}>
      <style>{`
                @keyframes ambient-zoom {
                    0%   { transform: scale(1.05) translate(0, 0); }
                    100% { transform: scale(1.15) translate(-1%, -1%); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50%       { transform: translateY(-15px); }
                }
            `}</style>

      <div className={STYLES.bgContainer}>
        <img src={bgHomeImage} alt="Champ de bataille" className={STYLES.bgImage} />
      </div>
      <AnimatedBackground />

      <div className={STYLES.overlay} />
      <div className={STYLES.scanlines} />

      <div className={STYLES.foreground}>
        <Header title="Configure ton duo" subtitle="Nouvelle partie" onBack={handleBack} />

        <div className={STYLES.titleContainer}>
          <h2 className={STYLES.mainTitle}>Choisissez un agent</h2>
          <p className={STYLES.subTitle}>Configuration des modules tactiques</p>
        </div>

        <div className={STYLES.grid}>
          {characters.map((character, index) => (
            <div
              key={character._id}
              className={index === 0 ? STYLES.cardWrapper1 : STYLES.cardWrapper2}
            >
              <AgentCard
                id={index + 1}
                name={character.characterName}
                heroClass={index === 0 ? 'Guerrier Lourd' : 'Archère Tactique'}
                imageSrc={HERO_IMAGES[index] ?? heroM}
                isDimmed={hoveredAgent !== null && hoveredAgent !== character._id}
                onSelect={() => handleBuildHero(character._id)}
                onMouseEnter={() => setHoveredAgent(character._id)}
                onMouseLeave={() => setHoveredAgent(null)}
              />
            </div>
          ))}
        </div>

        <footer className={STYLES.footer}>
          <button className={STYLES.launchButton} disabled>
            <div className={STYLES.styleDiv} />
            <span className={STYLES.styleSpan}>
              <IconPause className="w-5 h-5 text-slate-700" />
              Lancer le déploiement
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}
