import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/home/HomePage";
import { TeamSelectionPage } from "./pages/team-selection/TeamSelectionPage";
import { GambitEditorPage } from "./components/ui/gambit/GambitEditorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/team" element={<TeamSelectionPage />} />
        <Route path="/gestion-gambits/:caracterId" element={<GambitEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}