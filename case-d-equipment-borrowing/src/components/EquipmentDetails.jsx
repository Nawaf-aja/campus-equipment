import { evaluateBorrowEligibility } from '../utils/equipmentUtils.js';

function formatDisplayDate(isoDate) {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export default function EquipmentDetails({
  equipmentItem,
  availableUnits = 0,
  startDate,
  endDate,
  onCreateRequest,
  student = null,
  requests = [],
}) {
  if (!equipmentItem) {
    return (
      <div className="equipment-details-card empty-details">
        <p>Pilih alat di katalog untuk melihat detail dan mengajukan reservasi.</p>
      </div>
    );
  }

  const eligibility = evaluateBorrowEligibility(student, equipmentItem, requests);
  const canRequest = availableUnits > 0 && eligibility.eligible;
  const requestButtonText = !availableUnits
    ? 'Unit Penuh pada Rentang Ini'
    : !eligibility.eligible
      ? 'Kelayakan Belum Memenuhi Syarat'
      : 'Ajukan Peminjaman Sekarang';

  return (
    <div className="equipment-details-card" aria-labelledby="equipment-details-title">
      <div className="details-header-top">
        <div>
          <span className="details-meta-id">{equipmentItem.id} · {equipmentItem.category}</span>
          <h2 id="equipment-details-title" className="details-main-title">{equipmentItem.name}</h2>
          <p className="details-model-tag">
            {equipmentItem.model ? `Model: ${equipmentItem.model}` : ''}
            {equipmentItem.lab ? ` · ${equipmentItem.lab}` : ''}
          </p>
        </div>
        <span className={`ready-tag ${availableUnits > 0 ? 'tag-ready' : 'tag-unavailable'}`}>
          {availableUnits > 0 ? `${availableUnits} UNIT TERSEDIA` : 'TIDAK TERSEDIA'}
        </span>
      </div>

      <p className="details-description">{equipmentItem.description}</p>

      {!eligibility.eligible && eligibility.reasons.length > 0 && (
        <div className="system-alert alert-info" role="alert">
          {eligibility.reasons.join(' ')}
        </div>
      )}

      {/* Booking Date Range Summary */}
      <div className="details-date-summary">
        <div className="date-summary-item">
          <span className="summary-date-label">Mulai Pinjam:</span>
          <span className="summary-date-value">{formatDisplayDate(startDate)}</span>
        </div>
        <span className="date-arrow" aria-hidden="true">→</span>
        <div className="date-summary-item">
          <span className="summary-date-label">Selesai Pinjam:</span>
          <span className="summary-date-value">{formatDisplayDate(endDate)}</span>
        </div>
      </div>

      {/* Accessories Preview */}
      {equipmentItem.accessories && equipmentItem.accessories.length > 0 && (
        <div className="accessories-inspection-box">
          <h4 className="accessories-heading">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Daftar Aksesoris Fisik Termasuk
          </h4>
          <ul className="accessories-badges-list">
            {equipmentItem.accessories.map((acc, index) => (
              <li key={index} className="accessory-badge-item">
                <span className="check-dot" aria-hidden="true">✓</span>
                {acc}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="submit-request-action-btn"
        onClick={() => onCreateRequest(equipmentItem.id)}
        disabled={!canRequest}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
        {requestButtonText}
      </button>
    </div>
  );
}
