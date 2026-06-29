import { ERange } from "@reflexer/engine";

const RANGE_LABEL_TO_RANGE: Record<string, ERange> = {
  'À COURTE PORTÉE':  ERange.SHORT,
  'À MOYENNE PORTÉE': ERange.MEDIUM,
  'À LONGUE PORTÉE':  ERange.LONG,
};

export const ALL_RANGES: ERange[] = [ERange.SHORT, ERange.MEDIUM, ERange.LONG];

export const rangeLabelToRange = (label: string): ERange =>
  RANGE_LABEL_TO_RANGE[label] ?? ERange.LONG;

export const rangeToLabel = (range: number): string => {
  const entry = Object.entries(RANGE_LABEL_TO_RANGE).find(([, v]) => v === range);
  return entry ? entry[0] : `PORTÉE ${range}`;
};