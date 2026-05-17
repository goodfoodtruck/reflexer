type SlotProps = {
  active?: boolean;
  label?: string;
  className?: string;
};

export function Slot({ active = false, label, className = "" }: SlotProps) {
  return (
    <div className={`relative w-16 h-16 border-2 flex items-center justify-center transition-all duration-300 rounded-md
      ${active 
        ? 'border-amber-500 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
        : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'} 
      ${className}`}>
    
      <svg className={`w-6 h-6 ${active ? 'text-amber-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
      
      {label && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-200 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap shadow-md rounded border border-slate-700 z-10">
          {label}
        </div>
      )}
    </div>
  );
}