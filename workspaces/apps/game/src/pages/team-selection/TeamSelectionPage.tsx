import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamService } from '@services/team.service';
import { useAuth } from '@hooks/useAuth';
import { resolveCharacterImages } from '@components/ui/images/characterImages';
import { CharacterSelectScreen } from '@components/ui/team/CharacterSelectScreen';
import { TeamConfigureScreen } from '@components/ui/team/TeamConfigureScreen';
import type { SelectedCharacter } from '@components/ui/team/type';

type View = 'loading' | 'select' | 'configure';

export function TeamSelectionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [view, setView] = useState<View>('loading');
  const [selectedCharacters, setSelectedCharacters] = useState<
    [SelectedCharacter, SelectedCharacter] | null
  >(null);

  // si le joueur a déjà une équipe enregistrée, on saute l'écran de sélection
  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView('select');
      return;
    }

    TeamService.getMine()
      .then((team) => {
        if (!team) {
          setView('select');
          return;
        }

        const visuals = team.characterIds.map((char) => ({
          id: char._id,
          slug: char.slug,
          name: char.characterName,
          description: char.description,
          baseStats: char.baseStats as { health: number; energy: number; armor: number },
          ...resolveCharacterImages(char.slug)
        })) as [SelectedCharacter, SelectedCharacter];

        setSelectedCharacters(visuals);
        setView('configure');
      })
      .catch((err) => {
        console.error('Erreur chargement équipe:', err);
        setView('select');
      });
  }, [user]);

  const handleBack = () => navigate('/');
  const handleBackToSelect = () => setView('select');
  const handleBuildHero = (characterId: string) => navigate(`/gestion-gambits/${characterId}`);

  const handleTeamConfirm = async (team: [SelectedCharacter, SelectedCharacter]) => {
    setSelectedCharacters(team);
    setView('configure');
    try {
      await TeamService.save([team[0].id, team[1].id]);
    } catch (err) {
      console.error('Erreur sauvegarde équipe:', err);
    }
  };

  if (view === 'loading') {
    return null;
  }

  if (view === 'select') {
    return <CharacterSelectScreen onConfirm={handleTeamConfirm} onBack={handleBack} />;
  }

  return (
    <TeamConfigureScreen
      team={selectedCharacters!}
      onChangeTeam={handleBackToSelect}
      onBuildHero={handleBuildHero}
      onBack={handleBack}
    />
  );
}
