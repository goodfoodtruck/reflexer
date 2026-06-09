import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../../components/ui/AnimatedBackground";
import { MenuButton } from "../../components/ui/MenuButton";
import herosImage from "../../assets/images/heros.png";
import bgHomeImage from "../../assets/images/bg-home.png"; 
import STYLES from "./styles";
import { OptionsPanel } from "../../components/ui/OptionsPanel";
import { useState } from "react";
import { NotificationBell } from "../../components/ui/NotificationBell";


export function HomePage() {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  const onStartGame = () => navigate('/team');
  const onArena    = () => navigate('/arena')
  const onOpenOptions = () => setShowOptions(true);
  const onCloseOptions = () => setShowOptions(false);

  return (
    <div className={STYLES.container}>
      <AnimatedBackground />
      <div className={STYLES.bgContainer}>
        <img 
          src={bgHomeImage} 
          alt="Reflexer Background" 
          className={STYLES.bgImage}
        />
      </div>

      <div className={STYLES.overlay}></div>
      <div className={STYLES.foreground}>
        <NotificationBell /> 
        
        <div className={STYLES.titleWrapper}>
          <h1 className={STYLES.mainTitle}>
            REFLEXER
          </h1>
          <p className={STYLES.subtitle}>
            Tactical Roguelike
          </p>
        </div>

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

        <div className={STYLES.navContainer}>
          <MenuButton onClick={onStartGame}>Nouvelle partie</MenuButton>
          <MenuButton onClick={onArena}>Arène</MenuButton>
          <MenuButton>Historique</MenuButton>
          <MenuButton onClick={onOpenOptions}>Options</MenuButton>
        </div>
      </div>

      {showOptions && <OptionsPanel onClose={onCloseOptions} />}
    </div>
  );
}