import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { OptionsPanel } from "@components/ui/optionPanel/OptionsPanel";
import { useGuide, GuideOverlay, GuideButton, GUIDES } from "@components/guide";

export function AppLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const guide = useGuide("home", GUIDES.home);

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-slate-200">
      <Navbar onOpenProfile={() => setShowProfile(true)} />

      <div className="relative flex flex-col flex-1">
        <Outlet />
      </div>

      {showProfile && <OptionsPanel onClose={() => setShowProfile(false)} />}

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
