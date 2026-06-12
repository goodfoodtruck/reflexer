import { Styles } from '../Condition.styles';

interface ConditionBannerProps {
  text: string;
}

export function ConditionBanner({ text }: ConditionBannerProps) {
  return (
    <div className={Styles.banner}>
      <div className={Styles.bannerGlow} />
      <span className="relative z-10">{text}</span>
    </div>
  );
}