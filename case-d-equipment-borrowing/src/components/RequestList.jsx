import StatusBadge from './StatusBadge.jsx';

function formatDate(dateString) {
  if (!dateString) return 'Not set';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function RequestList({ requests, equipment }) {
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
        const item = equipment.find((eq) => eq.id === request.equipmentId);
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
            </div>
          </article>
        );
      })}
    </div>
  );
}
