import HandoverChecklist from './HandoverChecklist.jsx';
import StatusBadge from './StatusBadge.jsx';
import { getOverdueDays } from '../utils/equipmentUtils.js';

function formatDate(dateString) {
  if (!dateString) return 'Belum ditentukan';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function RequestList({
  requests,
  equipment,
  checklistResetKey,
  onSaveChecklist,
}) {
  if (requests.length === 0) {
    return (
      <div className="empty-requests-box">
        <p>Belum ada permohonan. Pilih alat pada katalog dan ajukan peminjaman.</p>
      </div>
    );
  }

  return (
    <div className="requests-cards-stack">
      {requests.map((request) => {
        const item = equipment.find((entry) => entry.id === request.equipmentId);
        const inventoryUnit = item?.units.find((unit) => unit.id === request.inventoryUnitId);
        const isIncomplete = request.status === 'INCOMPLETE_RETURN';
        const overdueDays = getOverdueDays(request);
        const dueDate = request.dueDate ?? request.endDate;

        return (
          <article
            key={request.id}
            className={`request-card-row ${isIncomplete ? 'card-incomplete-return' : ''} ${overdueDays > 0 ? 'card-overdue-return' : ''}`}
          >
            <div className="request-card-main">
              <div className="request-header-line">
                <span className="request-id-badge">{request.id}</span>
                <StatusBadge status={overdueDays > 0 ? 'OVERDUE' : request.status || 'PENDING'} />
              </div>

              <h3 className="request-equipment-name">{item?.name || request.equipmentId}</h3>

              {request.startDate && request.endDate && (
                <p className="request-dates-line">
                  Jadwal: {formatDate(request.startDate)} – {formatDate(request.endDate)}
                </p>
              )}

              {inventoryUnit && (
                <p className="request-inventory-line">
                  ID inventaris: <strong>{inventoryUnit.id}</strong>
                  {inventoryUnit.serialNumber && ` · Nomor seri: ${inventoryUnit.serialNumber}`}
                </p>
              )}

              {overdueDays > 0 && (
                <div className="overdue-student-warning" role="alert">
                  <strong>PERINGATAN PENGEMBALIAN TERLAMBAT (US6)</strong>
                  <p>
                    Batas pengembalian {formatDate(dueDate)} — terlambat {overdueDays}{' '}
                    {overdueDays === 1 ? 'hari' : 'hari'}. Harap segera kembalikan alat ke laboratorium.
                  </p>
                </div>
              )}

              {/* US5: Peringatan Incomplete Return pada kartu mahasiswa */}
              {isIncomplete && (
                <div className="incomplete-student-warning" role="alert">
                  <div className="warning-badge-icon">⚠️</div>
                  <div className="warning-badge-text">
                    <strong>PENGEMBALIAN TIDAK LENGKAP (US5):</strong>
                    <p>
                      Terdapat komponen yang belum diserahkan ke staf lab:{' '}
                      <strong>
                        {request.missingAccessories && request.missingAccessories.length > 0
                          ? request.missingAccessories.join(', ')
                          : 'Komponen aksesoris bawaan'}
                      </strong>.
                    </p>
                    <p className="lockout-notice">
                      Penyelesaian pengembalian ditahan dan hak pengajuan alat baru <strong>ditangguhkan</strong> hingga barang dipertanggungjawabkan kepada staf laboratorium.
                    </p>
                  </div>
                </div>
              )}

              <HandoverChecklist
                key={`${request.id}-${checklistResetKey}`}
                request={request}
                accessories={item?.accessories ?? []}
                onSave={onSaveChecklist}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
