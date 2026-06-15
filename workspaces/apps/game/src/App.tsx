import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "@pages/home/HomePage";
import { AuthPage } from "@pages/auth/AuthPage";
import { TeamSelectionPage } from "@pages/team-selection/TeamSelectionPage";
import { GambitEditorPage } from "@components/ui/gambit/GambitEditorPage";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import ArenaPage from "@pages/arena/ArenaPage";
import { CombatPage } from "@pages/combat/CombatPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/arena" element={<ArenaPage />} />
          <Route path="/team" element={<TeamSelectionPage />} />
          <Route path="/gestion-gambits/:characterId" element={<GambitEditorPage />} />
          <Route path="/fight" element={<CombatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}