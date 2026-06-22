import { useState } from 'react';
import { AnimatedBackground } from '@components/ui/AnimatedBackground';
import { Header } from '@components/ui/header/Header';
import bgHomeImage from '@assets/images/bg-home.png';
import { AgentCard } from '@components/ui/agent/AgentCard';
import { useGuide, GuideOverlay, GuideButton, GUIDES } from '@components/guide';
import { TEAM_CONFIGURATION_SCREEN } from './Team.styles';
import type { SelectedCharacter } from './type';

interface Props {
  team: [SelectedCharacter, SelectedCharacter];
  onChangeTeam: () => void;
  onBuildHero: (characterId: string) => void;
  onBack: () => void;
}

export function TeamConfigureScreen({ team, onChangeTeam, onBuildHero, onBack }: Props) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const guide = useGuide('team-selection', GUIDES['team-selection']);

  return (
    <div className={TEAM_CONFIGURATION_SCREEN.container}>
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

      <div className={TEAM_CONFIGURATION_SCREEN.bgContainer}>
        <img src={bgHomeImage} alt="Champ de bataille" className={TEAM_CONFIGURATION_SCREEN.bgImage} />
      </div>
      <AnimatedBackground />

      <div className={TEAM_CONFIGURATION_SCREEN.overlay} />
      <div className={TEAM_CONFIGURATION_SCREEN.scanlines} />

      <div className={TEAM_CONFIGURATION_SCREEN.foreground}>
        <Header title="Configure ton duo" subtitle="Nouvelle partie" onBack={onBack} />

        <div className={TEAM_CONFIGURATION_SCREEN.titleContainer}>
          <h2 className={TEAM_CONFIGURATION_SCREEN.mainTitle}>Configurez votre équipe</h2>
          <p className={TEAM_CONFIGURATION_SCREEN.subTitle}>Configuration des modules tactiques</p>
          <button
            onClick={onChangeTeam}
            className="mt-4 text-[11px] font-bold tracking-widest uppercase text-slate-400 hover:text-amber-300 transition-colors duration-200 underline underline-offset-4"
          >
            Changer mes personnages
          </button>
        </div>

        <div className={TEAM_CONFIGURATION_SCREEN.grid}>
          {team.map((visual, index) => (
            <div
              key={visual.id}
              className={index === 0 ? TEAM_CONFIGURATION_SCREEN.cardWrapper1 : TEAM_CONFIGURATION_SCREEN.cardWrapper2}
            >
              <AgentCard
                id={index + 1}
                name={visual.name}
                heroClass={index === 0 ? 'Personnage 1' : 'Personnage 2'}
                imageSrc={visual.illustration || visual.portrait}
                isDimmed={hoveredAgent !== null && hoveredAgent !== visual.id}
                onSelect={() => onBuildHero(visual.id)}
                onMouseEnter={() => setHoveredAgent(visual.id)}
                onMouseLeave={() => setHoveredAgent(null)}
              />
            </div>
          ))}
        </div>
      </div>

      {guide.isVisible && (
        <GuideOverlay
          step={guide.step}
          currentStep={guide.currentStep}
          total={guide.total}
          onNext={guide.next}
          onPrev={guide.prev}
          onClose={guide.close}
        />
      )}
      <GuideButton onClick={guide.reset} />
    </div>
  );
}
