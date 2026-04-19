import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../../components/ui/AnimatedBackground";
import { MenuButton } from "../../components/ui/MenuButton";
import herosImage from "../../assets/images/heros.png";

const STYLES = {
  container: "w-screen h-screen font-sans relative overflow-hidden flex flex-col selection:bg-amber-500/30 bg-black",
  foreground: "relative z-10 flex flex-col h-full",
  titleWrapper: "pt-24 text-center",
  mainTitle: "text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  subtitle: "text-amber-500/70 tracking-[0.7em] text-sm mt-6 uppercase font-bold drop-shadow-md",
  heroCenterPosition: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  heroGroup: "w-[1500px] h-[1500px] relative group flex items-center justify-center",
  heroGlow: "absolute inset-20 bg-amber-800/10 rounded-full blur-3xl opacity-70",
  heroImageWrapper: "relative w-full h-full overflow-hidden flex items-center justify-center",
  heroImage: "max-w-full max-h-full object-contain opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out",
  navContainer: "absolute bottom-32 left-20 flex flex-col gap-6"
};

export function HomePage() {
  const navigate = useNavigate();

  const onStartGame = () => {
    navigate("/team");
  };

  return (
    <div className={STYLES.container}>
      <AnimatedBackground />
      <div className={STYLES.foreground}>
        {/* TITRE */}
        <div className={STYLES.titleWrapper}>
          <h1 className={STYLES.mainTitle}>
            REFLEXER
          </h1>
          <p className={STYLES.subtitle}>
            Tactical Roguelike
          </p>
        </div>

        {/* AGENTS */}
        <div className={STYLES.heroCenterPosition}>
          <div className={STYLES.heroGroup}>
            <div className={STYLES.heroGlow}></div>
            <div className={STYLES.heroImageWrapper}>
              <img 
                src={herosImage} 
                alt="Personnages du Jeu" 
                className={STYLES.heroImage}
              />
            </div>
          </div>
        </div>

        {/* MENU */}
        <div className={STYLES.navContainer}>
          <MenuButton onClick={onStartGame}>Nouvelle partie</MenuButton>
          <MenuButton>Historique</MenuButton>
          <MenuButton>Options</MenuButton>
        </div> 
      </div>
    </div>
  );
}