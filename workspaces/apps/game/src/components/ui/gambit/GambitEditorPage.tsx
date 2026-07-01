/* eslint-disable react-hooks/rules-of-hooks */
import bgHomeImage from '@assets/images/bg-home.png';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@components/ui/header/Header';
import { TacticalMemo } from './tacticalMemo/TacticalMemo';
import { GambitListPanel } from './GambitListPanel';
import { GambitEdition } from './GambitEdition';
import { Styles_gambit_editor } from './Gambit.styles';
import { useGuide, GuideOverlay, GuideButton, GUIDES } from "../../guide";
import { useAuth } from '@hooks/useAuth';
import { resolveCharacterImages } from '@components/ui/images/characterImages';
import { useGambitEditor } from './UseGambitEditor';

export function GambitEditorPage() {
    const { user } = useAuth()
    if (! user) return null
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
  } = useGambitEditor(user.id);

  const guide = useGuide("gambit-editor", GUIDES["gambit-editor"]);

  const currentHeroImage = character?.slug
    ? resolveCharacterImages(character.slug).illustration || bgHomeImage
    : bgHomeImage;

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
          onBack={() => navigate('/gambits')}
        />

        <div className={Styles_gambit_editor.workspace}>
          <AnimatePresence>
            {!isEditing && (
              <motion.div
                key="gambit-list"
                className="h-full flex shrink-0"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {isEditing ? (
            <section className={Styles_gambit_editor.rightPanelWizard}>
              <GambitEdition
                key={gambitToEdit?._id ?? 'new'}
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
