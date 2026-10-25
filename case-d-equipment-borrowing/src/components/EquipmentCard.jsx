import { getEquipmentAvailabilityStatus } from '../utils/equipmentUtils.js';

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
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  );
}

export default function EquipmentCard({ item, availableUnits, isReady, isSelected, onSelect }) {
  const unitText = `${Math.max(0, Number(availableUnits ?? 0))} Unit Fisik Siap`;
  const status = getEquipmentAvailabilityStatus({ availableUnits: Number(availableUnits ?? item?.availableUnits ?? 0) });
  const statusLabel = status === 'AVAILABLE' ? 'Ready' : 'Inspection Buffer';

  return (
    <div
      role="button"
      tabIndex={0}
      className={`lab-item-card${isSelected ? ' is-selected' : ''}`}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item.id);
        }
      }}
      aria-pressed={isSelected}
    >
      <div className="lab-item-icon-wrap" aria-hidden="true">
        {getEquipmentIcon(item.name, item.category)}
      </div>

      <div className="lab-item-content">
        <div className="lab-item-header">
          <h3 className="lab-item-title">{item.name}</h3>
          <span className={`ready-tag ${isReady ? 'tag-ready' : 'tag-unavailable'}`}>
            {statusLabel}
          </span>
        </div>

        <p className="lab-item-subtitle">
          {item.model ? `Model: ${item.model}` : item.id}
          {item.lab ? ` · ${item.lab}` : ` · ${item.category}`}
        </p>

        <div className="lab-item-meta-row">
          <span className="unit-availability-label">
            <span className={`status-dot ${isReady ? 'dot-active' : 'dot-inactive'}`} />
            {unitText}
          </span>
          {item.requiresTraining && (
            <span className="training-required-chip">Wajib Sertifikasi</span>
          )}
        </div>
      </div>
    </div>
  );
}
