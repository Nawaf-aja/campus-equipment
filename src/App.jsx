import { useEffect, useState } from 'react';
import DatePickerCard from './components/DatePickerCard.jsx';
import EquipmentDetails from './components/EquipmentDetails.jsx';
import EquipmentList from './components/EquipmentList.jsx';
import RequestList from './components/RequestList.jsx';
import ResetControl from './components/ResetControl.jsx';
import SafetyBanner from './components/SafetyBanner.jsx';
import StaffWorkspace from './components/StaffWorkspace.jsx';
import { createSeedData } from './data/seed.js';
import {
  createChecklistLog,
  createDemoRequest,
  createPickupCode,
  getAssignableUnits,
  getAvailableUnits,
  getEligibility,
  isDateRangeValid,
  isOverdue,
} from './utils/equipmentUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-d:v2';

function withUpdatedRequest(data, requestId, updateRequest, updateEquipment) {
  return {
    ...data,
    requests: data.requests.map((request) =>
      request.id === requestId ? updateRequest(request) : request
    ),
    ...(updateEquipment ? { equipment: updateEquipment(data.equipment) } : {}),
  };
}

export default function App() {
  const [initialLoad] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [data, setData] = useState(initialLoad.state);
  const [selectedId, setSelectedId] = useState(() => initialLoad.state.equipment[0]?.id ?? null);
  const [view, setView] = useState('student');
  const [dateRange, setDateRange] = useState({
    startDate: '2026-10-25',
    endDate: '2026-10-28',
  });
  const [notice, setNotice] = useState('');
  const [storageWarning, setStorageWarning] = useState(initialLoad.warning);

  useEffect(() => {
    setStorageWarning(saveState(STORAGE_KEY, data));
  }, [data]);

  const selectedEquipment =
    data.equipment.find((item) => item.id === selectedId) ?? null;
  const availableCount = data.equipment.filter((item) =>
    getAvailableUnits(item, data.requests, dateRange.startDate, dateRange.endDate) > 0
  ).length;
  const studentRequests = data.requests.filter((request) => request.studentId === data.student.id);
  const pendingCount = data.requests.filter((request) => request.status === 'PENDING').length;
  const incompleteCount = data.requests.filter((request) =>
    request.status === 'INCOMPLETE_RETURN'
  ).length;

  function handleDateChange(field, value) {
    setDateRange((current) => {
      const updated = { ...current, [field]: value };
      if (field === 'startDate' && updated.endDate < value) updated.endDate = value;
      return updated;
    });
    setNotice('');
  }

  function handleCheckAvailability() {
    setNotice(
      `Ketersediaan real-time diperbarui: ${availableCount} model alat laboratorium siap dipinjam untuk periode ${dateRange.startDate} s/d ${dateRange.endDate}.`
    );
    const catalogElem = document.getElementById('catalog-heading');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleCreateRequest(equipmentId) {
    const equipmentItem = data.equipment.find((item) => item.id === equipmentId);
    const eligibility = getEligibility(equipmentItem, data.student, data.requests);
    if (!eligibility.eligible) {
      setNotice(eligibility.reason);
      return;
    }
    if (!isDateRangeValid(dateRange.startDate, dateRange.endDate)) {
      setNotice('Pilih rentang tanggal peminjaman yang valid.');
      return;
    }
    if (getAvailableUnits(equipmentItem, data.requests, dateRange.startDate, dateRange.endDate) < 1) {
      setNotice('Tidak ada unit fisik yang tersedia untuk tanggal yang dipilih.');
      return;
    }

    setData((current) => ({
      ...current,
      requests: [
        ...current.requests,
        createDemoRequest(
          current.requests,
          equipmentId,
          current.student.id,
          dateRange.startDate,
          dateRange.endDate,
        ),
      ],
    }));
    setNotice('Permohonan berhasil diajukan. Staf laboratorium akan memverifikasi dan menerbitkan kode pickup.');
  }

  function handleApprove(requestId) {
    const request = data.requests.find((item) => item.id === requestId);
    const equipmentItem = data.equipment.find((item) => item.id === request?.equipmentId);
    if (!request || request.status !== 'PENDING') return;
    const eligibility = getEligibility(equipmentItem, data.student, data.requests);
    if (!eligibility.eligible) {
      setNotice(`Gagal menyetujui ${requestId}: ${eligibility.reason}`);
      return;
    }
    if (getAvailableUnits(equipmentItem, data.requests, request.startDate, request.endDate, request.id) < 1) {
      setNotice(`Gagal menyetujui ${requestId}: tidak ada unit tersedia pada tanggal tersebut.`);
      return;
    }

    setData((current) => withUpdatedRequest(current, requestId, (item) => ({
      ...item,
      status: 'APPROVED',
      pickupCode: createPickupCode(current.requests),
    })));
    setNotice(`${requestId} disetujui. Kode unik pickup (US7) berhasil diterbitkan.`);
  }

  function handleHandover(requestId, details) {
    const request = data.requests.find((item) => item.id === requestId);
    const equipmentItem = data.equipment.find((item) => item.id === request?.equipmentId);
    if (!request || request.status !== 'APPROVED') return 'Permohonan ini tidak sedang menunggu serah terima.';
    if (details.code !== request.pickupCode) return 'Kode pickup tidak cocok dengan permohonan ini.';
    const assignableUnits = getAssignableUnits(equipmentItem, data.requests, request);
    if (!assignableUnits.some((unit) => unit.id === details.unitId)) {
      return 'Unit fisik tersebut tidak tersedia untuk rentang tanggal ini. Pilih unit lain.';
    }

    const log = createChecklistLog(
      'HANDOVER',
      requestId,
      details.checkedAccessories,
      details.notes,
      details.condition,
    );
    setData((current) => withUpdatedRequest(current, requestId, (item) => ({
      ...item,
      status: 'BORROWED',
      inventoryUnitId: details.unitId,
      logs: [...item.logs, log],
    })));
    setNotice(`${requestId} berhasil diserah-terimakan. ID inventaris fisik dan checklist US4 tersimpan.`);
    return '';
  }

  function handleReturn(requestId, details) {
    const request = data.requests.find((item) => item.id === requestId);
    const equipmentItem = data.equipment.find((item) => item.id === request?.equipmentId);
    if (!request || request.status !== 'BORROWED') return 'Permohonan ini tidak sedang dalam status dipinjam.';

    const overdue = isOverdue(request);
    const missingAccessories = equipmentItem.accessories.some(
      (accessory) => !details.checkedAccessories.includes(accessory),
    );
    const status = missingAccessories ? 'INCOMPLETE_RETURN' : overdue ? 'LATE' : 'RETURNED';
    const log = createChecklistLog(
      'RETURN',
      requestId,
      details.checkedAccessories,
      details.notes,
      details.condition,
    );
    setData((current) => withUpdatedRequest(
      current,
      requestId,
      (item) => ({
        ...item,
        status,
        late: overdue,
        logs: [...item.logs, log],
      }),
      (items) => items.map((item) => item.id !== request.equipmentId
        ? item
        : {
          ...item,
          units: item.units.map((unit) => unit.id !== request.inventoryUnitId
            ? unit
            : {
              ...unit,
              status: missingAccessories
                ? 'MAINTENANCE'
                : details.condition === 'Damaged' ? 'OUT_OF_SERVICE' : 'AVAILABLE',
              condition: details.condition,
            }),
        }),
    ));
    setNotice(missingAccessories
      ? `${requestId} dicatat sebagai Incomplete Return (US5). Kelayakan peminjaman ditangguhkan hingga staf menyelesaikan.`
      : overdue
        ? `${requestId} dikembalikan dan dicatat Terlambat (US6).`
        : `${requestId} berhasil dikembalikan dan inventaris diperbarui.`);
    return '';
  }

  function handleResolveIncomplete(requestId) {
    const request = data.requests.find((item) => item.id === requestId);
    if (!request || request.status !== 'INCOMPLETE_RETURN') return;
    const latestReturn = [...request.logs].reverse().find((log) => log.kind === 'RETURN');
    setData((current) => withUpdatedRequest(
      current,
      requestId,
      (item) => ({ ...item, status: item.late ? 'LATE' : 'RETURNED' }),
      (items) => items.map((item) => item.id !== request.equipmentId
        ? item
        : {
          ...item,
          units: item.units.map((unit) => unit.id !== request.inventoryUnitId
            ? unit
            : {
              ...unit,
              status: latestReturn?.condition === 'Damaged' ? 'OUT_OF_SERVICE' : 'AVAILABLE',
            }),
        }),
    ));
    setNotice(`Kekurangan aksesoris untuk ${requestId} telah diselesaikan. Hak peminjaman mahasiswa dipulihkan.`);
  }

  function handleReset() {
    const result = resetState(STORAGE_KEY, createSeedData);
    setData(result.state);
    setSelectedId(result.state.equipment[0]?.id ?? null);
    setStorageWarning(result.warning);
    setView('student');
    setNotice('Data demo berhasil di-reset ke kondisi awal.');
  }

  return (
    <div className="app-container">
      {/* Top Header Card */}
      <header className="main-header-card">
        <div className="header-brand-row">
          <div className="brand-logo-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
              <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">LabAsset Management System</h1>
            <p className="brand-subtitle">Desain Antarmuka Terpadu: Mahasiswa &amp; Panel Staf</p>
          </div>
          <div className="header-reset-wrapper">
            <ResetControl onReset={handleReset} />
          </div>
        </div>

        {/* Tab Switcher (Segmented Pill Bar) */}
        <nav className="tab-switcher-pillbar" aria-label="Navigasi Peran">
          <button
            type="button"
            className={`tab-pill-btn ${view === 'student' ? 'active-pill' : ''}`}
            onClick={() => { setView('student'); setNotice(''); }}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>Portal Mahasiswa (Reservasi)</span>
          </button>

          <button
            type="button"
            className={`tab-pill-btn ${view === 'staff' ? 'active-pill' : ''}`}
            onClick={() => { setView('staff'); setNotice(''); }}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            <span>Panel Staf (Inspeksi &amp; Serah Terima)</span>
            <span className="us7-gold-badge">US7</span>
            {pendingCount > 0 && <span className="pending-badge-count">{pendingCount}</span>}
          </button>
        </nav>
      </header>

      {/* Security Safety Banner */}
      <SafetyBanner />

      {/* Notifications / Alerts */}
      {storageWarning && <div className="system-alert alert-danger" role="alert">{storageWarning}</div>}
      {notice && <div className="system-alert alert-info" role="status">{notice}</div>}

      {/* Main Views */}
      {view === 'student' ? (
        <main className="student-view-layout">
          {/* Date Picker Card */}
          <DatePickerCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            onCheckAvailability={handleCheckAvailability}
          />

          {/* Catalog & Equipment Details Split Layout */}
          <div className="catalog-and-details-grid">
            <EquipmentList
              equipment={data.equipment}
              selectedId={selectedId}
              onSelect={setSelectedId}
              requests={data.requests}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
            />

            <aside className="details-sidebar-column">
              <EquipmentDetails
                equipmentItem={selectedEquipment}
                student={data.student}
                requests={data.requests}
                availableUnits={getAvailableUnits(
                  selectedEquipment,
                  data.requests,
                  dateRange.startDate,
                  dateRange.endDate,
                )}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onCreateRequest={handleCreateRequest}
              />
            </aside>
          </div>

          {/* Student Requests History Section */}
          <section className="student-requests-section" aria-labelledby="my-requests-heading">
            <div className="section-title-bar">
              <div>
                <h2 id="my-requests-heading" className="section-main-heading">Permohonan Peminjaman Saya</h2>
                <p className="section-sub-heading">
                  Pantau status persetujuan, kode verifikasi pickup (US7), dan jadwal pengembalian.
                </p>
              </div>
              <span className="requests-count-tag">{studentRequests.length} Riwayat</span>
            </div>
            <RequestList requests={studentRequests} equipment={data.equipment} />
          </section>
        </main>
      ) : (
        <main className="staff-view-layout">
          <StaffWorkspace
            requests={data.requests}
            equipment={data.equipment}
            onApprove={handleApprove}
            onHandover={handleHandover}
            onReturn={handleReturn}
            onResolveIncomplete={handleResolveIncomplete}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="app-main-footer">
        <p>LabAsset Management System · Prototipe Terpadu SDLC P10 (US1 - US7) · Penyimpanan Lokal Browser</p>
      </footer>
    </div>
  );
}
