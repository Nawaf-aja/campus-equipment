import { getEligibility } from '../utils/equipmentUtils.js';

function formatDisplayDate(isoDate) {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export default function EquipmentDetails({
  equipmentItem,
  student,
  requests,
  availableUnits,
  startDate,
  endDate,
  onCreateRequest,
}) {
  if (!equipmentItem) {
    return (
      <div className="equipment-details-card empty-details">
        <p>Pilih alat di katalog untuk melihat detail dan mengajukan reservasi.</p>
      </div>
    );
  }

  const eligibility = getEligibility(equipmentItem, student, requests);
  const canRequest = eligibility.eligible && availableUnits > 0;

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

      {/* US2: Eligibility Check Banner */}
      <div className={`eligibility-status-banner ${eligibility.eligible ? 'is-eligible' : 'is-blocked'}`}>
        <div className="eligibility-icon-wrap" aria-hidden="true">
          {eligibility.eligible ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div className="eligibility-content">
          <strong>{eligibility.eligible ? 'Memenuhi Syarat Peminjaman (US2)' : 'Belum Memenuhi Syarat (US2)'}</strong>
          <p>{eligibility.reason}</p>
          {equipmentItem.requiresTraining && (
            <span className="eligibility-training-note">
              Status Pelatihan Lab: {student.trainingCompleted ? 'Lulus / Terverifikasi' : 'Belum Selesai'}
            </span>
          )}
        </div>
      </div>

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

      {/* US4: Accessory Checklist Preview */}
      <div className="accessories-inspection-box">
        <h4 className="accessories-heading">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Daftar Kelengkapan Fisik &amp; Aksesoris (US4)
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
        {canRequest
          ? 'Ajukan Peminjaman Sekarang'
          : !eligibility.eligible
            ? 'Tidak Memenuhi Syarat'
            : 'Tidak Ada Unit Tersedia'}
      </button>
    </div>
  );
}
