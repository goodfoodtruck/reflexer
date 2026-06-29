import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthPage } from "@pages/auth/AuthPage";
import { TeamSelectionPage } from "@pages/team-selection/TeamSelectionPage";
import { GambitEditorPage } from "@components/ui/gambit/GambitEditorPage";
import { ProtectedRoute } from "@components/auth/ProtectedRoute";
import { AppLayout } from "@components/layout/AppLayout";
import ArenaPage from "@pages/arena/ArenaPage";
import { CombatPage } from "@pages/combat/CombatPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/arena" replace />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/team" element={<TeamSelectionPage />} />
            <Route path="/gambits" element={<TeamSelectionPage />} />
          </Route>
          <Route path="/gestion-gambits/:characterId" element={<GambitEditorPage />} />
          <Route path="/fight" element={<CombatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
