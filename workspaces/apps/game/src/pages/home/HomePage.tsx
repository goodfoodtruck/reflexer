import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "../../components/ui/AnimatedBackground";
import { MenuButton } from "../../components/menu/MenuButton";
import { useGuide, GuideOverlay, GuideButton, GUIDES } from "../../components/guide";
import herosImage from "../../assets/images/heros.png";
import bgHomeImage from "../../assets/images/bg-home.png"; 
import STYLES from "./styles";
import { OptionsPanel } from "../../components/ui/OptionsPanel";
import { useState } from "react";
import { NotificationBell } from "../../components/ui/notificationBell/NotificationBell";


export function HomePage() {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const guide = useGuide('home', GUIDES.home);

  const onStartGame = () => navigate('/team');
  const onEditGambit = () => navigate('/team');
  const onArena = () => navigate('/arena');
  const onOpenOptions = () => setShowOptions(true);
  const onCloseOptions = () => setShowOptions(false);

  return (
    <div className={STYLES.container}>
      <AnimatedBackground />
      <div className={STYLES.bgContainer}>
        <img src={bgHomeImage} alt="Reflexer Background" className={STYLES.bgImage} />
      </div>

      <div className={STYLES.overlay} />
      <div className={STYLES.foreground}>
        <NotificationBell />

        <div className={STYLES.titleWrapper}>
          <h1 className={STYLES.mainTitle}>REFLEXER</h1>
          <p className={STYLES.subtitle}>Tactical Roguelike</p>
        </div>

        <div className={STYLES.heroCenterPosition}>
          <div className={STYLES.heroGroup}>
            <div className={STYLES.heroGlow} />
            <div className={STYLES.heroImageWrapper}>
              <img src={herosImage} alt="Personnages du Jeu" className={STYLES.heroImage} />
            </div>
          </div>
        </div>

        <div className={STYLES.navContainer}>
          <div data-guide="nouvelle-partie">
            <MenuButton onClick={onStartGame}>Nouvelle partie</MenuButton>
          </div>
          <div data-guide="gambit">
            <MenuButton onClick={onEditGambit}>Gambits</MenuButton>
          </div>
          <div data-guide="arene">
            <MenuButton onClick={onArena}>Arène</MenuButton>
          </div>
          <MenuButton onClick={onOpenOptions}>Options</MenuButton>
        </div>
      </div>

      {showOptions && <OptionsPanel onClose={onCloseOptions} />}

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
