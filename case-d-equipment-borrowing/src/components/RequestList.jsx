import HandoverChecklist from './HandoverChecklist.jsx';
import StatusBadge from './StatusBadge.jsx';

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
        return (
          <article key={request.id} className="request-card-row">
            <div className="request-card-main">
              <div className="request-header-line">
                <span className="request-id-badge">{request.id}</span>
                <StatusBadge status={request.status || 'PENDING'} />
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
