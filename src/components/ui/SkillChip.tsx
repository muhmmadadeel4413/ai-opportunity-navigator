interface SkillChipProps {
  skill: string;
  matched?: boolean;
  missing?: boolean;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}

export function SkillChip({
  skill,
  matched,
  missing,
  onClick,
  removable,
  onRemove,
}: SkillChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all duration-150
        ${
          matched
            ? "bg-emerald-50 text-accent border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
            : missing
            ? "bg-amber-50 text-warning border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
            : "bg-muted text-foreground border border-border hover:border-primary/30 dark:hover:border-primary/50"
        }`}
      onClick={onClick}
    >
      {matched && (
        <span className="text-accent" aria-hidden="true">
          ✓
        </span>
      )}

      {missing && (
        <span className="text-warning" aria-hidden="true">
          !
        </span>
      )}

      {skill}

      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:opacity-70"
          aria-label={`Remove ${skill}`}
        >
          ×
        </button>
      )}
    </span>
  );
}