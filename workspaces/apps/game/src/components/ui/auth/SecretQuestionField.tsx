import { FormField } from './FormField';

const SECRET_QUESTION = 'Quel est le prénom de votre mère ?';

const style = 'text-xs text-amber-500/80 font-bold italic mb-1';

type Props = { value: string; onChange: (v: string) => void };

export function SecretQuestionField({ value, onChange }: Props) {
  return (
    <div>
      <p className={style}>{SECRET_QUESTION}</p>
      <FormField
        label="Question secrète"
        placeholder="Votre réponse"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
