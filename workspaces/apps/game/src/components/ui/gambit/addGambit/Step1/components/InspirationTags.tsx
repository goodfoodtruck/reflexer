import { Styles } from "../Situation.styles";

interface InspirationTagsProps {
  tags: readonly string[];
  onSelect: (tag: string) => void;
}

export function InspirationTags({ tags, onSelect }: InspirationTagsProps) {
  return (
    <div>
      <p className={Styles.sectionLabel}>Inspirations</p>

      <div className={Styles.tagsContainer}>
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelect(tag)}
            className={Styles.tagBtn}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}