import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../../components/ui/AnimatedBackground";
import heroM from "../../assets/images/hero-m.png"; 
import heroW from "../../assets/images/hero-w.png";
import { Header } from "../../components/ui/header/Header";

const Styles = {
  container: "w-screen h-screen relative overflow-hidden flex flex-col text-slate-200 bg-black selection:bg-amber-500/30",
  overlay: "absolute inset-0 bg-slate-950/70 z-0",
  foreground: "relative z-10 flex flex-col h-full",
  titleContainer: "flex-none pt-6 pb-2 text-center",
  mainTitle: "text-2xl font-bold tracking-tight text-white drop-shadow-md",
  grid: "flex-1 flex items-center justify-center gap-16 min-h-0 py-4",
  agentCard: "relative h-full flex flex-col items-center justify-center group cursor-pointer focus-visible:outline-none",
  agentImageWrapper: "relative flex-1 flex items-end justify-center min-h-0 w-[400px]",
  agentGlow: "absolute inset-x-0 bottom-10 h-1/2 bg-amber-500/0 group-hover:bg-amber-500/20 rounded-full blur-3xl transition-all duration-700 pointer-events-none",
  agentImage: "max-h-full w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500 ease-out",
  hoverBadgeWrapper: "absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  hoverBadge: "px-6 py-3 bg-slate-950/80 border border-amber-500 rounded-full text-amber-400 font-bold tracking-widest text-sm shadow-2xl backdrop-blur-sm",
  agentName: "flex-none mt-6 text-3xl font-bold tracking-widest text-white drop-shadow-md group-hover:text-amber-400 transition-colors",
  footer: "flex-none flex justify-center pb-8 pt-4",
  launchButton: "px-10 py-3 bg-slate-900/50 border border-slate-800/80 rounded text-slate-600 font-bold tracking-widest text-sm cursor-not-allowed uppercase"
};

export function TeamSelectionPage() {
  const navigate = useNavigate();

  const handleBack = () => navigate("/");
  const handleBuildHero = (heroId: number) => navigate(`/gestion-gambits/${heroId}`);

  return (
    <div className={Styles.container}>
      
      <AnimatedBackground />
      <div className={Styles.overlay} />             
      <div className={Styles.foreground}>
        
        {/* HEADER */}
        <Header 
          title="Préparation de l'équipe" 
          subtitle="Nouvelle partie" 
          onBack={handleBack} 
        />

        {/* TITRE */}
        <div className={Styles.titleContainer}>
          <h2 className={Styles.mainTitle}>
            Sélectionner le personnage à personnaliser
          </h2>
        </div>

        {/* BODY */}
        <div className={Styles.grid}>          
          {/* AGENT 1 */}
          <button className={Styles.agentCard} onClick={() => handleBuildHero(1)}>
            <div className={Styles.agentImageWrapper}>
              <div className={Styles.agentGlow}></div>
              <img src={heroM} alt="Agent 1" className={Styles.agentImage} />
              <div className={Styles.hoverBadgeWrapper}>
                <span className={Styles.hoverBadge}>CLIQUER POUR CHOISIR</span>
              </div>
            </div>
            <span className={Styles.agentName}>Agent 1</span>
          </button>

          {/* AGENT 2 */}
          <button className={Styles.agentCard} onClick={() => handleBuildHero(2)}>
            <div className={Styles.agentImageWrapper}>
              <div className={Styles.agentGlow}></div>
              <img src={heroW} alt="Agent 2" className={Styles.agentImage} />
              <div className={Styles.hoverBadgeWrapper}>
                <span className={Styles.hoverBadge}>CLIQUER POUR CHOISIR</span>
              </div>
            </div>
            <span className={Styles.agentName}>Agent 2</span>
          </button>
        </div>

        {/* FOOTER */}
        <footer className={Styles.footer}>
          <button className={Styles.launchButton}>
            Lancer le combat
          </button>
        </footer>

      </div>
    </div>
  );
}