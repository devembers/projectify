interface IconButtonProps {
  icon: string;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
  className?: string;
}

/** Renders a codicon icon button. Pass the codicon name without the `codicon-` prefix. */
export function IconButton({ icon, title, onClick, danger, className }: IconButtonProps) {
  return (
    <button
      className={`icon-button ${danger ? 'icon-button--danger' : ''} ${className ?? ''}`}
      title={title}
      aria-label={title}
      data-tooltip={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <span className={`codicon codicon-${icon}`} />
    </button>
  );
}
