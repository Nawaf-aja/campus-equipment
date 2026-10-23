function getEquipmentIcon(name = '', category = '') {
  const lower = (name + ' ' + category).toLowerCase();
  if (lower.includes('oscilloscope') || lower.includes('osiloskop')) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="15" rx="3" />
        <path d="M6 11h2l2-4 3 8 2.5-5 1.5 1h3" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="18" x2="12" y2="21" />
      </svg>
    );
  }
  if (lower.includes('generator')) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M6 12c1.5-3 3-3 4 0s2.5 3 4 0 2.5-3 4 0" />
        <circle cx="18" cy="8" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (lower.includes('multimeter')) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 8a4 4 0 0 1 8 0" />
        <line x1="12" y1="8" x2="14" y2="6" />
        <circle cx="9" cy="15" r="1" fill="currentColor" />
        <circle cx="15" cy="15" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (lower.includes('projector') || lower.includes('proyektor')) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="11" rx="2" />
        <circle cx="8" cy="12.5" r="2.5" />
        <path d="M16 11h2M16 14h2" />
        <path d="M6 18v2M18 18v2" />
      </svg>
    );
  }
  if (lower.includes('camera') || lower.includes('kamera')) {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  );
}

export default function EquipmentCard({ equipmentItem, availableUnits, isSelected, onSelect }) {
  const isAvailable = availableUnits > 0;
  const unitText = `${availableUnits} Unit Fisik Siap`;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`lab-item-card${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(equipmentItem.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(equipmentItem.id);
        }
      }}
      aria-pressed={isSelected}
    >
      <div className="lab-item-icon-wrap" aria-hidden="true">
        {getEquipmentIcon(equipmentItem.name, equipmentItem.category)}
      </div>

      <div className="lab-item-content">
        <div className="lab-item-header">
          <h3 className="lab-item-title">{equipmentItem.name}</h3>
          <span className={`ready-tag ${isAvailable ? 'tag-ready' : 'tag-unavailable'}`}>
            {isAvailable ? 'Ready' : 'Penuh'}
          </span>
        </div>

        <p className="lab-item-subtitle">
          {equipmentItem.model ? `Model: ${equipmentItem.model}` : equipmentItem.id}
          {equipmentItem.lab ? ` · ${equipmentItem.lab}` : ` · ${equipmentItem.category}`}
        </p>

        <div className="lab-item-meta-row">
          <span className="unit-availability-label">
            <span className={`status-dot ${isAvailable ? 'dot-active' : 'dot-inactive'}`} />
            {unitText}
          </span>
          {equipmentItem.requiresTraining && (
            <span className="training-required-chip">Wajib Sertifikasi</span>
          )}
        </div>
      </div>
    </div>
  );
}
