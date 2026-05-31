import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../../components/ui/AnimatedBackground";
import { Header } from "../../components/ui/header/Header";
import { IconPause } from "../../assets/icons/IconPause";
import bgHomeImage from "../../assets/images/bg-home.png"; 
import heroM from "../../assets/images/hero-m.png"; 
import heroW from "../../assets/images/hero-w.png";
import { AgentCard } from "../../components/ui/agent/AgentCard";
import STYLES from "./styles.ts";


const AGENTS = [
  { id: 1, name: "Agent 1", heroClass: "Guerrier Lourd", image: heroM },
  { id: 2, name: "Agent 2", heroClass: "Archère Tactique", image: heroW },
];

export function TeamSelectionPage() {
  const navigate = useNavigate();
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  const handleBack = () => navigate("/");
  const handleBuildHero = (heroId: number) => navigate(`/gestion-gambits/${heroId}`);

  return (
    <div className={STYLES.container}>
      <style>{`
        @keyframes ambient-zoom {
          0% { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.15) translate(-1%, -1%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      <div className={STYLES.bgContainer}>
        <img src={bgHomeImage} alt="Champ de bataille" className={STYLES.bgImage} />
      </div>
       <AnimatedBackground />

      <div className={STYLES.overlay} />             
      <div className={STYLES.scanlines} />             

      <div className={STYLES.foreground}>
        <Header 
          title="Configure ton duo" 
          subtitle="Nouvelle partie" 
          onBack={handleBack} 
        />

        <div className={STYLES.titleContainer}>
          <h2 className={STYLES.mainTitle}>Choisissez un agent</h2>
          <p className={STYLES.subTitle}>Configuration des modules tactiques</p>
        </div>
        

        <div className={STYLES.grid}>         
          <div className={STYLES.cardWrapper1}>
            <AgentCard 
              id={AGENTS[0].id}
              name={AGENTS[0].name}
              heroClass={AGENTS[0].heroClass}
              imageSrc={AGENTS[0].image}
              isDimmed={hoveredAgent !== null && hoveredAgent !== AGENTS[0].id}
              onSelect={() => handleBuildHero(AGENTS[0].id)}
              onMouseEnter={() => setHoveredAgent(AGENTS[0].id)}
              onMouseLeave={() => setHoveredAgent(null)}
            />
          </div>

          <div className={STYLES.cardWrapper2}>
            <AgentCard 
              id={AGENTS[1].id}
              name={AGENTS[1].name}
              heroClass={AGENTS[1].heroClass}
              imageSrc={AGENTS[1].image}
              isDimmed={hoveredAgent !== null && hoveredAgent !== AGENTS[1].id}
              onSelect={() => handleBuildHero(AGENTS[1].id)}
              onMouseEnter={() => setHoveredAgent(AGENTS[1].id)}
              onMouseLeave={() => setHoveredAgent(null)}
            />
          </div>
        </div>

        <footer className={STYLES.footer}>
          <button className={STYLES.launchButton} disabled>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.2)_10px,rgba(0,0,0,0.2)_20px)] opacity-50"></div>
            <span className="relative z-10 flex items-center gap-3">
              <IconPause className="w-5 h-5 text-slate-700" />
              Lancer le déploiement
            </span>
          </button>
        </footer>
      </div>
    </div>
  );
}