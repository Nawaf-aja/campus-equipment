import { formatDate, getEquipmentName, isOverdue } from '../utils/equipmentUtils.js';
import StatusBadge from './StatusBadge.jsx';

export default function RequestList({ requests, equipment }) {
  if (requests.length === 0) {
    return (
      <div className="empty-requests-box">
        <p>Belum ada riwayat permohonan. Ajukan peminjaman alat di katalog atas.</p>
      </div>
    );
  }

  return (
    <div className="requests-cards-stack">
      {requests.map((request) => {
        const overdue = isOverdue(request);
        const item = equipment.find((eq) => eq.id === request.equipmentId);
        const unit = item?.units.find((u) => u.id === request.inventoryUnitId);

        return (
          <article
            key={request.id}
            className={`request-card-row ${overdue ? 'is-overdue' : ''} ${request.status === 'INCOMPLETE_RETURN' ? 'is-incomplete' : ''}`}
          >
            <div className="request-card-main">
              <div className="request-header-line">
                <span className="request-id-badge">{request.id}</span>
                <StatusBadge status={overdue ? 'LATE' : request.status} />
              </div>

              <h3 className="request-equipment-name">
                {getEquipmentName(equipment, request.equipmentId)}
              </h3>

              <p className="request-dates-line">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(request.startDate)} – {formatDate(request.endDate)}
              </p>

              <div className="request-meta-tags">
                {/* US3: Physical Inventory Unit Serial Number */}
                {unit && (
                  <span className="meta-tag tag-serial">
                    <strong>No. Seri Fisik (US3):</strong> {unit.serialNumber}
                  </span>
                )}

                {/* US7: Pickup Verification Code */}
                {request.pickupCode ? (
                  <span className="meta-tag tag-pickup-code">
                    <span className="pickup-label">KODE PICKUP (US7):</span>
                    <strong className="code-value">{request.pickupCode}</strong>
                  </span>
                ) : (
                  request.status === 'PENDING' && (
                    <span className="meta-tag tag-awaiting-code">
                      Menunggu persetujuan staf untuk kode pickup
                    </span>
                  )
                )}
              </div>

              {/* US6: Overdue Warning */}
              {overdue && (
                <div className="alert-banner-late" role="alert">
                  ⚠️ <strong>Keterlambatan Terdeteksi (US6):</strong> Pengembalian melewati tenggat waktu. Harap segera kembalikan ke staf laboratorium.
                </div>
              )}

              {/* US5: Incomplete Return Warning */}
              {request.status === 'INCOMPLETE_RETURN' && (
                <div className="alert-banner-incomplete" role="alert">
                  ❌ <strong>Pengembalian Tidak Lengkap (US5):</strong> Terdapat aksesoris yang belum diserahkan. Hak peminjaman ditangguhkan hingga diselesaikan bersama staf.
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
