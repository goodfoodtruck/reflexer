import { Styles } from "../Situation.styles";

interface StepHeaderProps {
  eyebrow: string;
  title: string;
}

export function StepHeader({ eyebrow, title }: StepHeaderProps) {
  return (
    <div>
      <p className={Styles.eyebrow}>{eyebrow}</p>
      <h3 className={Styles.title}>{title}</h3>
    </div>
  );
}