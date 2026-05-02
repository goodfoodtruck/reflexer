import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../../components/ui/AnimatedBackground";
import { Header } from "../../components/ui/header/Header";
import { IconPause } from "../../components/ui/icons/IconPause";
import bgHomeImage from "../../assets/images/bg-home.png"; 
import heroM from "../../assets/images/hero-m.png"; 
import heroW from "../../assets/images/hero-w.png";
import { AgentCard } from "../../components/ui/agent/AgentCard";

const STYLES = {
  container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30",
   bgContainer: "absolute inset-0 z-0 overflow-hidden",
  bgImage: "w-full h-full object-cover opacity-100 blur-[1px] animate-[ambient-zoom_10s_ease-in-out_infinite_alternate]",
  overlay: "absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/70 to-slate-950/95 z-0 pointer-events-none",
  scanlines: "absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]",
  foreground: "relative z-10 flex flex-col h-full",
  titleContainer: "flex-none pt-8 pb-4 text-center",
  mainTitle: "text-4xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]",
  subTitle: "text-amber-500/80 text-xs font-bold tracking-[0.5em] uppercase mt-3 animate-pulse",
  grid: "flex-1 flex items-center justify-center gap-16 min-h-0 py-8",  
  cardWrapper1: "h-full animate-[float_4s_ease-in-out_infinite]",
  cardWrapper2: "h-full animate-[float_4s_ease-in-out_infinite_0.1s]",
  footer: "flex-none flex justify-center pb-12 pt-4 relative z-20",
  launchButton: "px-16 py-4 bg-slate-900 border-2 border-slate-800 rounded-xl text-slate-600 font-black tracking-widest text-sm cursor-not-allowed uppercase shadow-2xl relative overflow-hidden group",
};

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