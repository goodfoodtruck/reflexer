const Styles = {
  subtitle: "text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2",
  title: "text-xl font-bold text-white mb-4",
  intro: "text-sm text-slate-400 mb-8 leading-relaxed",
  stepsContainer: "space-y-6 mb-12 flex-1",
  stepRow: "flex gap-4",
  stepNumber: "w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 font-bold text-xs shrink-0",
  stepTitle: "text-xs font-bold text-slate-200 uppercase tracking-widest mb-1",
  stepDesc: "text-xs text-slate-500",
  footerContainer: "mt-auto space-y-3 pt-6 border-t border-slate-700/50",
  footerText: "mt-8 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest",
  footerDot: "w-1.5 h-1.5 rounded-full bg-amber-500"
};

export function TacticalMemo() {
  return (
    <>
      <h3 className={Styles.subtitle}>Mémo Tactique</h3>
      <h2 className={Styles.title}>Comment ça marche</h2>
      <p className={Styles.intro}>
        Les gambits s'exécutent de haut en bas à chaque tour. La première règle dont la condition est vraie déclenche son action.
      </p>

      <div className={Styles.stepsContainer}>
        {[
          { num: 1, title: "Situation", desc: "Quand cette règle doit-elle se déclencher ? (combat, attente, repli...)" },
          { num: 2, title: "Conditions", desc: "Filtres supplémentaires : seuils de PV, statuts, distance..." },
          { num: 3, title: "Action", desc: "Le coup à exécuter — attaque, soin, compétence." },
          { num: 4, title: "Cible", desc: "Qui est visé et dans quel ordre de priorité." }
        ].map(step => (
          <div key={step.num} className={Styles.stepRow}>
            <div className={Styles.stepNumber}>{step.num}</div>
            <div>
              <h4 className={Styles.stepTitle}>{step.title}</h4>
              <p className={Styles.stepDesc}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={Styles.footerContainer}>
        <div className={Styles.footerText}>
          <span className={Styles.footerDot}></span>
          L'ordre fait la stratégie
        </div>
      </div>
    </>
  );
}