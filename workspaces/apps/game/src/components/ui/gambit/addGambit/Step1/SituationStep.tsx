import { motion } from "framer-motion";
import type { DraftGambit } from "../../GambitTypes";
import { INSPIRATIONS } from "./constants/situation.constants";
import { Styles } from "./Situation.styles";
import { SITUATION_CONSTANTS } from "./constants/situation.constants";
import { useSituationStep } from "./hooks/useSituationStep";
import { StepHeader } from "./components/StepHeader";
import { NameInput } from "./components/NameInput";
import { AdviceBox } from "./components/AdviceBox";
import { InspirationTags } from "./components/InspirationTags";

const ANIMATION = {
  key: SITUATION_CONSTANTS.STEP_KEY,
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.2 },
} as const;

interface Props {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}

export function SituationStep({ draft, updateDraft }: Props) {
  const { MAX_CHARS, isAtMaxChars, charCountLabel, handleNameChange, handleTagClick } =
    useSituationStep({ draft, updateDraft });

  return (
    <motion.div {...ANIMATION} className={Styles.container}>

      <StepHeader
        eyebrow={SITUATION_CONSTANTS.STEP_LABEL}
        title={SITUATION_CONSTANTS.STEP_TITLE}
      />

      <NameInput
        value={draft.name}
        maxLength={MAX_CHARS}
        isAtMaxChars={isAtMaxChars}
        charCountLabel={charCountLabel}
        onChange={handleNameChange}
      />

      <AdviceBox />

      <InspirationTags
        tags={INSPIRATIONS}
        onSelect={handleTagClick}
      />

    </motion.div>
  );
}