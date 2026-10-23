import { useState } from 'react';
import { formatDate, getAssignableUnits, getEquipmentName, isOverdue } from '../utils/equipmentUtils.js';
import StatusBadge from './StatusBadge.jsx';

function Checklist({ accessories, checked, onChange, legend }) {
  return (
    <fieldset className="checklist-container">
      <legend className="checklist-legend">{legend}</legend>
      <div className="checklist-grid">
        {accessories.map((accessory) => (
          <label className="checklist-box-item" key={accessory}>
            <input
              type="checkbox"
              checked={checked.includes(accessory)}
              onChange={() => onChange(accessory)}
            />
            <span className="checklist-label-text">{accessory}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function HandoverForm({ request, equipmentItem, requests, onSubmit }) {
  const units = getAssignableUnits(equipmentItem, requests, request);
  const [unitId, setUnitId] = useState(units[0]?.id ?? '');
  const [code, setCode] = useState('');
  const [checked, setChecked] = useState(equipmentItem.accessories);
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('Good');
  const [error, setError] = useState('');

  function toggleAccessory(accessory) {
    setChecked((current) =>
      current.includes(accessory)
        ? current.filter((item) => item !== accessory)
        : [...current, accessory]
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!unitId) {
      setError('Tidak ada unit fisik yang tersedia untuk rentang tanggal ini.');
      return;
    }
    if (!/^[A-Z0-9]{6}$/i.test(code.trim())) {
      setError('Masukkan 6-karakter kode verifikasi pickup (US7) yang ditunjukkan mahasiswa.');
      return;
    }
    const submissionError = onSubmit(request.id, {
      unitId,
      code: code.trim().toUpperCase(),
      checkedAccessories: checked,
      notes,
      condition,
    });
    setError(submissionError ?? '');
  }

  return (
    <form className="staff-workflow-form" onSubmit={handleSubmit}>
      <div className="form-two-cols">
        <label className="staff-field-label">
          <span>Kode Pickup Mahasiswa (US7)</span>
          <input
            className="staff-text-input"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Contoh: CAMP42"
            maxLength={6}
            autoComplete="off"
          />
        </label>

        <label className="staff-field-label">
          <span>Pilih No. Seri Fisik Inventaris (US3)</span>
          <select
            className="staff-select-input"
            value={unitId}
            onChange={(event) => setUnitId(event.target.value)}
            disabled={!units.length}
          >
            {units.length === 0 && <option value="">Tidak ada unit tersedia</option>}
            {units.map((unit) => (
              <option value={unit.id} key={unit.id}>
                {unit.serialNumber} · Kondisi: {unit.condition}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Checklist
        accessories={equipmentItem.accessories}
        checked={checked}
        onChange={toggleAccessory}
        legend="Pemeriksaan Kelengkapan Aksesoris Serah Terima (US4)"
      />

      <div className="form-two-cols">
        <label className="staff-field-label">
          <span>Kondisi Fisik Alat</span>
          <select
            className="staff-select-input"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
          >
            <option value="Good">Good (Bagus &amp; Siap Pakai)</option>
            <option value="Fair">Fair (Ada goresan wajar)</option>
            <option value="Damaged">Damaged (Rusak / Butuh servis)</option>
          </select>
        </label>

        <label className="staff-field-label">
          <span>Catatan Kondisi Serah Terima</span>
          <input
            className="staff-text-input"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Opsional, misal: kabel sedikit kaku..."
          />
        </label>
      </div>

      {error && <p className="staff-form-error" role="alert">{error}</p>}

      <button className="staff-action-submit-btn" type="submit" disabled={!units.length}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Validasi Kode Pickup &amp; Serahkan Alat (US7 &amp; US3)
      </button>
    </form>
  );
}

function ReturnForm({ request, equipmentItem, onSubmit }) {
  const [checked, setChecked] = useState(equipmentItem.accessories);
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('Good');
  const [error, setError] = useState('');

  function toggleAccessory(accessory) {
    setChecked((current) =>
      current.includes(accessory)
        ? current.filter((item) => item !== accessory)
        : [...current, accessory]
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const submissionError = onSubmit(request.id, {
      checkedAccessories: checked,
      notes,
      condition,
    });
    setError(submissionError ?? '');
  }

  const missingAccessories = equipmentItem.accessories.filter((item) => !checked.includes(item));

  return (
    <form className="staff-workflow-form" onSubmit={handleSubmit}>
      <Checklist
        accessories={equipmentItem.accessories}
        checked={checked}
        onChange={toggleAccessory}
        legend="Checklist Pemeriksaan Aksesoris Pengembalian (US4)"
      />

      {missingAccessories.length > 0 && (
        <div className="warning-callout-box">
          ⚠️ <strong>Peringatan Aksesoris Kurang:</strong> {missingAccessories.join(', ')} tidak dicentang.
          Transaksi akan ditandai sebagai <code>INCOMPLETE_RETURN (US5)</code> dan akun mahasiswa akan ditangguhkan hingga lengkap.
        </div>
      )}

      <div className="form-two-cols">
        <label className="staff-field-label">
          <span>Kondisi Fisik Saat Kembali</span>
          <select
            className="staff-select-input"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
          >
            <option value="Good">Good (Bagus &amp; Bersih)</option>
            <option value="Fair">Fair (Ada tanda pemakaian)</option>
            <option value="Damaged">Damaged (Rusak saat pakai)</option>
          </select>
        </label>

        <label className="staff-field-label">
          <span>Catatan Pemeriksaan Pengembalian</span>
          <input
            className="staff-text-input"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Catatan kebersihan atau kelayakan..."
          />
        </label>
      </div>

      {error && <p className="staff-form-error" role="alert">{error}</p>}

      <button className="staff-action-submit-btn" type="submit">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        Simpan Checklist &amp; Proses Pengembalian (US4 / US5)
      </button>
    </form>
  );
}

export default function StaffWorkspace({
  requests,
  equipment,
  onApprove,
  onHandover,
  onReturn,
  onResolveIncomplete,
}) {
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const handoverRequests = requests.filter((r) => r.status === 'APPROVED');
  const borrowedRequests = requests.filter((r) => r.status === 'BORROWED');
  const incompleteRequests = requests.filter((r) => r.status === 'INCOMPLETE_RETURN');

  return (
    <div className="staff-workspace-container">
      {/* 1. Pending Approvals (US1, US2) */}
      <section className="staff-section-card">
        <div className="staff-section-header">
          <div>
            <h3 className="staff-section-title">1. Persetujuan Permohonan Baru (US1 &amp; US2)</h3>
            <p className="staff-section-desc">
              Verifikasi kelayakan mahasiswa dan ketersediaan unit, kemudian buat kode pickup (US7).
            </p>
          </div>
          <span className="staff-count-tag">{pendingRequests.length} Menunggu</span>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="empty-staff-state">Tidak ada permohonan yang menunggu persetujuan.</div>
        ) : (
          <div className="staff-requests-stack">
            {pendingRequests.map((req) => (
              <div key={req.id} className="staff-req-item">
                <div className="staff-req-info">
                  <div className="req-top-row">
                    <strong>{req.id}</strong> · Mahasiswa: <code>{req.studentId}</code>
                    <StatusBadge status={req.status} />
                  </div>
                  <h4 className="req-item-name">{getEquipmentName(equipment, req.equipmentId)}</h4>
                  <p className="req-dates">
                    Jadwal Pinjam: {formatDate(req.startDate)} s/d {formatDate(req.endDate)}
                  </p>
                </div>
                <button
                  type="button"
                  className="staff-approve-btn"
                  onClick={() => onApprove(req.id)}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Setujui &amp; Terbitkan Kode Pickup (US7)
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Physical Handover Desk (US3, US4, US7) */}
      <section className="staff-section-card">
        <div className="staff-section-header">
          <div>
            <h3 className="staff-section-title">2. Meja Serah Terima Fisik (US3, US4 &amp; US7)</h3>
            <p className="staff-section-desc">
              Cek kode verifikasi mahasiswa (US7), pasangkan No. Seri inventaris fisik (US3), dan isi checklist kelengkapan (US4).
            </p>
          </div>
          <span className="staff-count-tag">{handoverRequests.length} Siap Diambil</span>
        </div>

        {handoverRequests.length === 0 ? (
          <div className="empty-staff-state">Tidak ada peralatan yang sedang menunggu serah terima fisik.</div>
        ) : (
          <div className="staff-requests-stack">
            {handoverRequests.map((req) => {
              const item = equipment.find((eq) => eq.id === req.equipmentId);
              return (
                <div key={req.id} className="staff-handover-item">
                  <div className="handover-summary-bar">
                    <div>
                      <strong>{req.id}</strong> — {item?.name}
                      <span className="student-badge">Peminjam: {req.studentId}</span>
                    </div>
                    <span className="secret-hint-tag">Kode Mahasiswa: <strong>{req.pickupCode}</strong></span>
                  </div>
                  <HandoverForm
                    request={req}
                    equipmentItem={item}
                    requests={requests}
                    onSubmit={onHandover}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Return & Inspection Desk (US4, US5, US6) */}
      <section className="staff-section-card">
        <div className="staff-section-header">
          <div>
            <h3 className="staff-section-title">3. Meja Pengembalian &amp; Inspeksi (US4, US5 &amp; US6)</h3>
            <p className="staff-section-desc">
              Periksa kondisi fisik dan kelengkapan aksesoris. Deteksi otomatis keterlambatan (US6) dan barang kurang (US5).
            </p>
          </div>
          <span className="staff-count-tag">{borrowedRequests.length} Sedang Dipinjam</span>
        </div>

        {borrowedRequests.length === 0 ? (
          <div className="empty-staff-state">Tidak ada peralatan yang sedang dalam masa peminjaman aktif.</div>
        ) : (
          <div className="staff-requests-stack">
            {borrowedRequests.map((req) => {
              const overdue = isOverdue(req);
              const item = equipment.find((eq) => eq.id === req.equipmentId);
              const unit = item?.units.find((u) => u.id === req.inventoryUnitId);

              return (
                <div key={req.id} className={`staff-return-item ${overdue ? 'is-overdue-box' : ''}`}>
                  <div className="return-summary-bar">
                    <div>
                      <strong>{req.id}</strong> — {item?.name}
                      <span className="unit-badge">Unit Fisik: {unit?.serialNumber || req.inventoryUnitId}</span>
                    </div>
                    <StatusBadge status={overdue ? 'LATE' : req.status} />
                  </div>
                  {overdue && (
                    <div className="overdue-staff-alert">
                      ⚠️ <strong>Peminjaman Melewati Tenggat:</strong> Batas pengembalian adalah {formatDate(req.endDate)}.
                    </div>
                  )}
                  <ReturnForm
                    request={req}
                    equipmentItem={item}
                    onSubmit={onReturn}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Incomplete Returns Resolution (US5) */}
      {incompleteRequests.length > 0 && (
        <section className="staff-section-card incomplete-resolution-card">
          <div className="staff-section-header">
            <div>
              <h3 className="staff-section-title">4. Penyelesaian Pengembalian Tidak Lengkap (US5)</h3>
              <p className="staff-section-desc">
                Peralatan dengan aksesoris hilang/kurang. Selesaikan saat mahasiswa telah mengembalikan kekurangan.
              </p>
            </div>
            <span className="staff-count-tag tag-warning">{incompleteRequests.length} Masalah</span>
          </div>

          <div className="staff-requests-stack">
            {incompleteRequests.map((req) => {
              const item = equipment.find((eq) => eq.id === req.equipmentId);
              return (
                <div key={req.id} className="incomplete-req-row">
                  <div>
                    <strong>{req.id}</strong> — {item?.name}
                    <p className="incomplete-student-info">
                      Peminjam: {req.studentId} · Periode: {formatDate(req.startDate)} - {formatDate(req.endDate)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="resolve-incomplete-btn"
                    onClick={() => onResolveIncomplete(req.id)}
                  >
                    Tandai Aksesoris Lengkap &amp; Pulihkan Mahasiswa
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
