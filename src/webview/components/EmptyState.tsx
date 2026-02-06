interface EmptyStateProps {
  onAddProject: () => void;
}

export function EmptyState({ onAddProject }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12h.01" />
          <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <path d="M22 13a18.15 18.15 0 0 1-20 0" />
          <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
      </div>
      <div className="empty-state__title">No projects yet</div>
      <div className="empty-state__desc">
        Add your project folders to get started.
      </div>
      <div className="empty-state__actions">
        <button
          className="empty-state__btn empty-state__btn--primary"
          onClick={onAddProject}
        >
          <span className="codicon codicon-add" /> Add Project
        </button>
      </div>
    </div>
  );
}
