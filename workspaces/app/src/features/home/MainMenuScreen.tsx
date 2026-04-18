import { AnimatedBackground } from "../../components/ui/AnimatedBackground";
import { MenuButton } from "../../components/ui/MenuButton";
import herosImage from "../../assets/images/heros.png";

export function MainMenuScreen() {
  return (
    <div className="w-screen h-screen font-sans relative overflow-hidden flex flex-col selection:bg-amber-500/30">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col h-full">
  
        <div className="pt-24 text-center">
          <h1 className="text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            REFLEXER
          </h1>
          <p className="text-amber-500/70 tracking-[0.7em] text-sm mt-6 uppercase font-bold drop-shadow-md">
            Tactical Roguelike
          </p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-[1500px] h-[1500px] relative group flex items-center justify-center">
            <div className="absolute inset-20 bg-amber-800/10 rounded-full blur-3xl opacity-70"></div>
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              <img 
                src={herosImage} 
                alt="Personnages de Reflexer" 
                className="max-w-full max-h-full object-contain opacity-95 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-20 flex flex-col gap-6">
          <MenuButton>Nouvelle partie</MenuButton>
          <MenuButton>Historique</MenuButton>
          <MenuButton>Options</MenuButton>
        </div>
        </div>
      </div>
  );
}