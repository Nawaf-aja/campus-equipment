import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

function formatDate(dateString) {
  if (!dateString) return 'Belum ditentukan';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function ReturnPanel({
  requests = [],
  equipment = [],
  onProcessReturn,
  onResolveIncomplete,
}) {
  const borrowedRequests = requests.filter((r) => r.status === 'BORROWED');
  const incompleteRequests = requests.filter((r) => r.status === 'INCOMPLETE_RETURN');

  // Local state for accessories checklist per request { [requestId]: ['acc1', 'acc2'] }
  const [checkedAccessoriesMap, setCheckedAccessoriesMap] = useState({});
  const [conditionsMap, setConditionsMap] = useState({});
  const [notesMap, setNotesMap] = useState({});
  const [resolveNotesMap, setResolveNotesMap] = useState({});

  function getCheckedAccessories(request, item) {
    if (checkedAccessoriesMap[request.id] !== undefined) {
      return checkedAccessoriesMap[request.id];
    }
    // Default: seluruh aksesoris dicentang
    return item?.accessories || [];
  }

  function handleToggleAccessory(requestId, accessory, item) {
    const current = getCheckedAccessories({ id: requestId }, item);
    const updated = current.includes(accessory)
      ? current.filter((a) => a !== accessory)
      : [...current, accessory];

    setCheckedAccessoriesMap((prev) => ({
      ...prev,
      [requestId]: updated,
    }));
  }

  return (
    <div className="return-panel-stack">
      {/* 1. Meja Pengembalian & Pemeriksaan Aksesoris (US5) */}
      <section className="return-section-card" aria-labelledby="return-heading">
        <div className="section-title-bar">
          <div>
            <h2 id="return-heading" className="section-main-heading">Meja Pengembalian &amp; Inspeksi Aksesoris (US5)</h2>
            <p className="section-sub-heading">
              Periksa kelengkapan komponen fisik. Jika ada komponen kurang, sistem otomatis menandai transaksi sebagai <strong>Incomplete Return</strong>.
            </p>
          </div>
          <span className="requests-count-tag">{borrowedRequests.length} Menunggu Kembali</span>
        </div>

        {borrowedRequests.length === 0 ? (
          <div className="empty-requests-box">
            <p>Tidak ada peralatan yang sedang dalam status dipinjam saat ini.</p>
          </div>
        ) : (
          <div className="return-cards-stack">
            {borrowedRequests.map((request) => {
              const item = equipment.find((e) => e.id === request.equipmentId);
              const checkedList = getCheckedAccessories(request, item);
              const missingList = (item?.accessories || []).filter((a) => !checkedList.includes(a));
              const hasMissing = missingList.length > 0;
              const condition = conditionsMap[request.id] || 'Good';
              const notes = notesMap[request.id] || '';

              return (
                <article key={request.id} className={`return-inspection-card ${hasMissing ? 'has-missing-warning' : ''}`}>
                  <div className="return-card-header">
                    <div>
                      <span className="request-id-badge">{request.id}</span>
                      <span className="student-tag">Peminjam: {request.studentId}</span>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <h3 className="return-item-title">{item?.name || request.equipmentId}</h3>
                  <p className="return-meta-line">
                    Unit Fisik: <strong>{request.inventoryUnitId || 'UNIT-001'}</strong> · Jadwal: {formatDate(request.startDate)} s/d {formatDate(request.endDate)}
                  </p>

                  {/* Checklist Aksesoris (US5) */}
                  <fieldset className="accessories-checklist-fieldset">
                    <legend className="checklist-legend-title">
                      Checklist Kelengkapan Komponen Bawaan (US5):
                    </legend>
                    <div className="accessories-checkbox-grid">
                      {(item?.accessories || []).map((acc) => {
                        const isChecked = checkedList.includes(acc);
                        return (
                          <label key={acc} className={`accessory-checkbox-item ${!isChecked ? 'is-unchecked' : ''}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAccessory(request.id, acc, item)}
                            />
                            <span>{acc}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  {/* Warning Box jika ada komponen kurang */}
                  {hasMissing && (
                    <div className="incomplete-alert-callout" role="alert">
                      <div className="callout-icon">⚠️</div>
                      <div className="callout-text">
                        <strong>PERINGATAN INCOMPLETE RETURN:</strong>
                        <p>
                          Komponen <code>{missingList.join(', ')}</code> tidak dicentang (kurang).
                          Transaksi ini akan ditandai sebagai <strong>INCOMPLETE_RETURN</strong>, unit fisik <code>{request.inventoryUnitId}</code> akan dikunci ke status <strong>MAINTENANCE</strong>, dan hak peminjaman mahasiswa akan ditangguhkan hingga barang dipertanggungjawabkan.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Input Kondisi Fisik & Catatan */}
                  <div className="return-controls-row">
                    <div className="return-control-group">
                      <label htmlFor={`condition-${request.id}`}>Kondisi Fisik Alat:</label>
                      <select
                        id={`condition-${request.id}`}
                        value={condition}
                        onChange={(e) => setConditionsMap((prev) => ({ ...prev, [request.id]: e.target.value }))}
                      >
                        <option value="Good">Good (Bagus / Normal)</option>
                        <option value="Fair">Fair (Ada goresan wajar)</option>
                        <option value="Damaged">Damaged (Rusak fisik)</option>
                      </select>
                    </div>

                    <div className="return-control-group flex-2">
                      <label htmlFor={`notes-${request.id}`}>Catatan Pemeriksaan Staf:</label>
                      <input
                        id={`notes-${request.id}`}
                        type="text"
                        placeholder="Contoh: Kabel daya tidak disertakan saat pengembalian..."
                        value={notes}
                        onChange={(e) => setNotesMap((prev) => ({ ...prev, [request.id]: e.target.value }))}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`process-return-action-btn ${hasMissing ? 'btn-warn-incomplete' : 'btn-success-complete'}`}
                    onClick={() => {
                      onProcessReturn({
                        requestId: request.id,
                        returnedAccessories: checkedList,
                        condition,
                        notes,
                      });
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    {hasMissing
                      ? 'Simpan & Tandai sebagai Incomplete Return (US5)'
                      : 'Simpan Checklist & Proses Pengembalian Lengkap'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Penyelesaian Incomplete Return (US5 Resolusi) */}
      <section className="return-section-card resolution-card" aria-labelledby="resolution-heading">
        <div className="section-title-bar">
          <div>
            <h2 id="resolution-heading" className="section-main-heading">Penyelesaian Incomplete Return (US5)</h2>
            <p className="section-sub-heading">
              Daftar transaksi yang ditahan karena komponen kurang. Selesaikan setelah mahasiswa mengganti atau mengembalikan barang.
            </p>
          </div>
          <span className={`requests-count-tag ${incompleteRequests.length > 0 ? 'tag-danger' : ''}`}>
            {incompleteRequests.length} Tanggungan
          </span>
        </div>

        {incompleteRequests.length === 0 ? (
          <div className="empty-requests-box">
            <p>Tidak ada tanggungan pengembalian tidak lengkap saat ini. Semua transaksi tertib.</p>
          </div>
        ) : (
          <div className="resolution-cards-stack">
            {incompleteRequests.map((request) => {
              const item = equipment.find((e) => e.id === request.equipmentId);
              const missingAccessories = request.missingAccessories || ['Komponen bawaan'];
              const resolveNote = resolveNotesMap[request.id] || '';

              return (
                <article key={request.id} className="resolution-item-box">
                  <div className="resolution-top-info">
                    <div>
                      <span className="request-id-badge">{request.id}</span>
                      <h3 className="resolution-item-title">{item?.name || request.equipmentId}</h3>
                      <p className="resolution-student-line">
                        Mahasiswa: <strong>{request.studentId}</strong> · Unit Inventaris: <code>{request.inventoryUnitId}</code>
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <div className="missing-components-box">
                    <strong>Komponen yang Belum Dikembalikan:</strong>
                    <ul className="missing-tags-list">
                      {missingAccessories.map((missing) => (
                        <li key={missing} className="missing-tag-pill">
                          ❌ {missing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="resolution-action-row">
                    <input
                      type="text"
                      className="resolve-notes-input"
                      placeholder="Catatan resolusi (misal: Komponen pengganti diserahkan...)"
                      value={resolveNote}
                      onChange={(e) => setResolveNotesMap((prev) => ({ ...prev, [request.id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="resolve-submit-btn"
                      onClick={() => {
                        onResolveIncomplete({
                          requestId: request.id,
                          staffNotes: resolveNote,
                        });
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Tandai Lengkap &amp; Pulihkan Mahasiswa (US5)
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
