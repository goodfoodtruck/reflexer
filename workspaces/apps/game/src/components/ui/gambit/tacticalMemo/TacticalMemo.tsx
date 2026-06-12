import { Styles } from './tactical.styles';

export function TacticalMemo() {
    const steps = [
          {
            num: 1,
            title: 'Situation',
            desc: 'Quand cette règle doit-elle se déclencher ? (combat, attente, repli...)'
          },
          {
            num: 2,
            title: 'Conditions',
            desc: 'Filtres supplémentaires : seuils de PV, statuts, distance...'
          },
          { num: 3, title: 'Action', desc: 'Le coup à exécuter — attaque, soin, compétence.' },
          { num: 4, title: 'Cible', desc: 'Qui est visé et dans quel ordre de priorité.' }
        ];

  return (
    <>
      <h3 className={Styles.subtitle}>Mémo Tactique</h3>
      <h2 className={Styles.title}>Comment ça marche</h2>
      <p className={Styles.intro}>
        Les gambits s'exécutent de haut en bas à chaque tour. La première règle dont la condition
        est vraie déclenche son action.
      </p>

      <div className={Styles.stepsContainer}>
        {steps.map((step) => (
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
          <span className={Styles.footerDot} />
          L'ordre fait la stratégie
        </div>
      </div>
    </>
  );
}
