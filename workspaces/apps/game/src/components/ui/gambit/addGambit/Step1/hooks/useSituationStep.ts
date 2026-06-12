import type { DraftGambit } from "../../../GambitTypes";
import { SITUATION_CONSTANTS } from "../constants/situation.constants";
 
interface UseSituationStepProps {
  draft: DraftGambit;
  updateDraft: (updates: Partial<DraftGambit>) => void;
}
 
export function useSituationStep({ draft, updateDraft }: UseSituationStepProps) {
  const { MAX_CHARS } = SITUATION_CONSTANTS;
 
  const isAtMaxChars = draft.name.length >= MAX_CHARS;
  const charCountLabel = `${draft.name.length}/${MAX_CHARS}`;
 
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateDraft({ name: e.target.value });
  };
 
  const handleTagClick = (tag: string) => {
    updateDraft({ name: tag });
  };
 
  return {
    MAX_CHARS,
    isAtMaxChars,
    charCountLabel,
    handleNameChange,
    handleTagClick,
  };
}
