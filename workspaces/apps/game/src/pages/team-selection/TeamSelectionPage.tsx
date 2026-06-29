import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { TeamService } from '@services/team.service';
import { useAuth } from '@hooks/useAuth';
import { resolveCharacterImages } from '@components/ui/images/characterImages';
import { CharacterSelectScreen } from '@components/ui/team/CharacterSelectScreen';
import { TeamConfigureScreen } from '@components/ui/team/TeamConfigureScreen';
import type { SelectedCharacter } from '@components/ui/team/type';

export function TeamSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // /gambits -> écran de configuration (les 2 persos de l'équipe)
  // /team    -> mosaïque de sélection des personnages
  const isGambits = location.pathname.startsWith('/gambits');

  const [team, setTeam] = useState<[SelectedCharacter, SelectedCharacter] | null>(null);
  const [loading, setLoading] = useState(true);

  // on charge l'équipe enregistrée (pré-sélection mosaïque + écran gambits)
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    TeamService.getMine()
      .then((savedTeam) => {
        if (!savedTeam) return;

        const visuals = savedTeam.characterIds.map((char) => ({
          id: char._id,
          slug: char.slug,
          name: char.characterName,
          description: char.description,
          baseStats: char.baseStats as { health: number; energy: number; armor: number },
          ...resolveCharacterImages(char.slug)
        })) as [SelectedCharacter, SelectedCharacter];

        setTeam(visuals);
      })
      .catch((err) => {
        console.error('Erreur chargement équipe:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleTeamConfirm = async (newTeam: [SelectedCharacter, SelectedCharacter]) => {
    setTeam(newTeam);
    try {
      await TeamService.save([newTeam[0].id, newTeam[1].id]);
    } catch (err) {
      console.error('Erreur sauvegarde équipe:', err);
    }
    navigate('/gambits');
  };

  if (loading) {
    return null;
  }

  if (isGambits) {
    // pas d'équipe encore configurée -> on renvoie vers la mosaïque
    if (!team) {
      return <Navigate to="/team" replace />;
    }

    return (
      <TeamConfigureScreen
        team={team}
        onChangeTeam={() => navigate('/team')}
        onBuildHero={(characterId) => navigate(`/gestion-gambits/${characterId}`)}
      />
    );
  }

  return <CharacterSelectScreen onConfirm={handleTeamConfirm} initialSelection={team} />;
}
