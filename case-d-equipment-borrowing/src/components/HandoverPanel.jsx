import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

const HANDOVER_STATUSES = ['PENDING', 'APPROVED', 'REQUESTED'];
const ACTIVE_STATUSES = ['PENDING', 'APPROVED', 'BORROWED', 'REQUESTED'];

function formatDate(dateString) {
  if (!dateString) return 'Belum ditentukan';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

function getAvailableUnits(request, equipment, requests) {
  const item = equipment.find((entry) => entry.id === request.equipmentId);
  if (!item) return [];

  return item.units.filter((unit) => (
    unit.status === 'AVAILABLE'
    && !requests.some((entry) => (
      entry.id !== request.id
      && entry.inventoryUnitId === unit.id
      && ACTIVE_STATUSES.includes(entry.status)
      && entry.startDate <= request.endDate
      && request.startDate <= entry.endDate
    ))
  ));
}

export default function HandoverPanel({ requests, equipment, onHandover }) {
  const [selectedUnits, setSelectedUnits] = useState({});
  const waitingRequests = requests.filter((request) => HANDOVER_STATUSES.includes(request.status));

  return (
    <section className="handover-section" aria-labelledby="handover-heading">
      <div className="section-title-bar">
        <div>
          <h2 id="handover-heading" className="section-main-heading">Serah Terima Peralatan</h2>
          <p className="section-sub-heading">
            Pilih ID inventaris fisik yang diserahkan untuk setiap permohonan.
          </p>
        </div>
        <span className="requests-count-tag">{waitingRequests.length} Menunggu</span>
      </div>

      {waitingRequests.length === 0 ? (
        <div className="empty-requests-box">
          <p>Tidak ada permohonan yang menunggu serah terima.</p>
        </div>
      ) : (
        <div className="handover-cards-stack">
          {waitingRequests.map((request) => {
            const item = equipment.find((entry) => entry.id === request.equipmentId);
            const availableUnits = getAvailableUnits(request, equipment, requests);
            const selectId = `handover-unit-${request.id}`;
            const selectedUnitId = selectedUnits[request.id] || '';

            return (
              <article key={request.id} className="handover-card">
                <div className="handover-card-heading">
                  <span className="request-id-badge">{request.id}</span>
                  <StatusBadge status={request.status} />
                </div>
                <h3 className="request-equipment-name">{item?.name || request.equipmentId}</h3>
                <p className="request-dates-line">
                  Jadwal: {formatDate(request.startDate)} – {formatDate(request.endDate)}
                </p>
                <div className="handover-controls">
                  <label htmlFor={selectId}>Unit fisik / ID inventaris</label>
                  <select
                    id={selectId}
                    value={selectedUnitId}
                    onChange={(event) => {
                      setSelectedUnits((current) => ({
                        ...current,
                        [request.id]: event.target.value,
                      }));
                    }}
                  >
                    <option value="" disabled>Pilih unit inventaris</option>
                    {availableUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.id}{unit.serialNumber ? ` · ${unit.serialNumber}` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    className="primary-button"
                    type="button"
                    disabled={!availableUnits.some((unit) => unit.id === selectedUnitId)}
                    onClick={() => {
                      if (onHandover(request.id, selectedUnitId)) {
                        setSelectedUnits((current) => {
                          const updated = { ...current };
                          delete updated[request.id];
                          return updated;
                        });
                      }
                    }}
                  >
                    Catat Serah Terima
                  </button>
                </div>
                {availableUnits.length === 0 && (
                  <p className="handover-no-units">Tidak ada unit fisik yang tersedia untuk permohonan ini.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
