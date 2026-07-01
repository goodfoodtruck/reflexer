type HeaderProps = {
  title: string;
  subtitle: string;
  onBack?: () => void;
};

const STYLES = {
  header: "flex-none flex items-center gap-4 pt-8 px-8",
  backButton: "group flex items-center justify-center w-10 h-10 bg-slate-800/80 border border-slate-600 rounded-full hover:bg-slate-700 hover:border-amber-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 shadow-lg",
  subtitle: "text-amber-500 font-bold text-[10px] tracking-widest uppercase mb-0.5",
  title: "text-xl font-black tracking-widest text-white drop-shadow-md uppercase",
  svg: "w-6 h-6 text-slate-300 group-hover:text-amber-400 group-hover:-translate-x-1 transition-all"
};

export function Header({ title, subtitle, onBack }: HeaderProps) {
  return (
    <header className={STYLES.header}>
      {onBack && (
        <button onClick={onBack} aria-label="Retour" className={STYLES.backButton}>
          <svg className={STYLES.svg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      <div>
        <div className={STYLES.subtitle}>{subtitle}</div>
        <h1 className={STYLES.title}>{title}</h1>
      </div>
    </header>
  );
}