import type { DraftGambit } from '../../GambitTypes';
import { formatConditionSummary, formatIntentSummary, formatTargetSummary } from '../../gambit.summary';

interface Section {
  label: string;
  summary: string;
  empty: string;
  step: number;
}

interface Props {
  draft: DraftGambit;
  currentStep: number;
  onNavigate: (step: number) => void;
}

export function RuleSkeleton({ draft, currentStep, onNavigate }: Props) {
  const sections: Section[] = [
    { label: 'SI',    summary: formatConditionSummary(draft), empty: 'toujours actif', step: 2 },
    { label: 'FAIRE', summary: formatIntentSummary(draft),    empty: 'action...',      step: 3 },
    { label: 'À',     summary: formatTargetSummary(draft),    empty: 'cible...',        step: 4 },
  ];

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 border-b border-slate-800/60 overflow-x-auto no-scrollbar">
      <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase shrink-0">
        {draft.name || '(sans nom)'}
      </span>
      <span className="text-slate-700 text-xs shrink-0">›</span>

      {sections.map((s, i) => {
        const isActive = currentStep === s.step;
        const isDone = s.summary !== '';
        const canGoBack = isDone && currentStep > s.step;

        return (
          <div key={s.label} className="flex items-center gap-1.5 shrink-0">
            {i > 0 && <span className="text-slate-700 text-[10px]">→</span>}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all duration-200 ${
              isActive
                ? 'border-amber-500/40 bg-amber-500/5'
                : isDone
                  ? 'border-slate-700/40 bg-transparent'
                  : 'border-transparent'
            }`}>
              <span className={`font-black tracking-widest text-[9px] uppercase ${
                isActive ? 'text-amber-400' : 'text-slate-600'
              }`}>
                {s.label}
              </span>
              {isDone ? (
                <button
                  onClick={() => canGoBack && onNavigate(s.step)}
                  className={`text-[10px] font-semibold truncate max-w-[140px] transition-colors ${
                    canGoBack
                      ? 'text-slate-300 hover:text-amber-400 cursor-pointer'
                      : 'text-slate-300 cursor-default'
                  }`}
                  title={s.summary}
                >
                  {s.summary}
                </button>
              ) : (
                <span className="text-[10px] text-slate-600 italic">{s.empty}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
