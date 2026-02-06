interface GroupHeaderProps {
  label: string;
  count: number;
  collapsed: boolean;
  onToggle: (recursive: boolean) => void;
}

export function GroupHeader({ label, count, collapsed, onToggle }: GroupHeaderProps) {
  const handleClick = (e: React.MouseEvent) => {
    onToggle(e.altKey);
  };

  return (
    <div className="group-header" onClick={handleClick}>
      <span
        className={`group-header__chevron ${collapsed ? 'group-header__chevron--collapsed' : ''}`}
      >
        <span className="codicon codicon-chevron-down" />
      </span>
      <span>{label}</span>
      {count > 1 && <span className="group-header__count">{count}</span>}
    </div>
  );
}
