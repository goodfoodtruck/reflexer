import heroM from '../../../assets/images/hero-m.png';
import heroW from '../../../assets/images/hero-w.png';
import bgHomeImage from '../../../assets/images/bg-home.png';
import { Header } from '../header/Header';
import { TacticalMemo } from './tacticalMemo/TacticalMemo';
import { GambitListPanel } from './GambitListPanel';
import { GambitEdition } from './GambitEdition';
import { Styles_gambit_editor } from './Gambit.styles';
import { useGambitEditor } from './UseGambitEditor';
import { useGuide, GuideOverlay, GuideButton, GUIDES } from "../../guide";

export function GambitEditorPage() {
  const {
    navigate,
    character,
    gambits,
    isEditing,
    gambitToEdit,
    sensors,
    handleDragEnd,
    handleDeleteGambit,
    handleEditClick,
    handleAddClick,
    handleCancelEdit,
    handleSaveGambit
  } = useGambitEditor();

  const guide = useGuide("gambit-editor", GUIDES["gambit-editor"]);

  const currentHeroImage = character?.characterName === 'CHARACTER_1' ? heroM : heroW;

  return (
    <div className={Styles_gambit_editor.container}>
      <div className={Styles_gambit_editor.bgContainer}>
        <img src={bgHomeImage} alt="Reflexer Background" className={Styles_gambit_editor.bgImage} />
      </div>
      <div className={Styles_gambit_editor.bgHeroContainer}>
        <img
          src={currentHeroImage}
          alt="Agent Background"
          className={`${Styles_gambit_editor.bgHeroImageBase} ${isEditing ? Styles_gambit_editor.bgHeroEditing : Styles_gambit_editor.bgHeroIdle}`}
        />
      </div>
      <div className={Styles_gambit_editor.overlay} />

      <div className={Styles_gambit_editor.foreground}>
        <Header
          title="Éditeur de Gambits"
          subtitle="Configuration tactique"
          onBack={() => navigate('/team')}
        />

        <div className={Styles_gambit_editor.workspace}>
          <div className="h-full flex">
            <GambitListPanel
              caracterName={character?.characterName ?? ''}
              gambits={gambits}
              isEditing={isEditing}
              onAddClick={handleAddClick}
              onEdit={handleEditClick}
              onDelete={handleDeleteGambit}
              sensors={sensors}
              onDragEnd={handleDragEnd}
            />
          </div>

          {isEditing ? (
            <section className={Styles_gambit_editor.rightPanelWizard}>
              <GambitEdition
                initialGambit={gambitToEdit}
                onCancel={handleCancelEdit}
                onSave={handleSaveGambit}
              />
            </section>
          ) : (
            <section className={Styles_gambit_editor.rightPanelMemo}>
              <TacticalMemo />
            </section>
          )}
        </div>
      </div>

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
