import { useEffect, useState, useCallback } from 'react';
import ActiveBorrowingWidget from './components/ActiveBorrowingWidget.jsx';
import DatePickerCard from './components/DatePickerCard.jsx';
import EquipmentDetails from './components/EquipmentDetails.jsx';
import EquipmentList from './components/EquipmentList.jsx';
import HandoverPanel from './components/HandoverPanel.jsx';
import ReturnPanel from './components/ReturnPanel.jsx';
import RequestList from './components/RequestList.jsx';
import ResetControl from './components/ResetControl.jsx';
import SafetyBanner from './components/SafetyBanner.jsx';
import ToastNotification from './components/ToastNotification.jsx';
import { equipmentApi } from './api/equipmentApi.js';
import { evaluateBorrowEligibility } from './utils/equipmentUtils.js';

export default function App() {
  const repository = equipmentApi.getRepository();

  const [dateRange, setDateRange] = useState({
    startDate: '2026-10-25',
    endDate: '2026-10-28',
  });
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activeView, setActiveView] = useState('student');
  const [staffDeskTab, setStaffDeskTab] = useState('return'); // 'return' or 'handover'
  const [requests, setRequests] = useState(() => repository.findAll().requests);
  const [student, setStudent] = useState(() => repository.findAll().student);
  const [checklistResetKey, setChecklistResetKey] = useState(0);
  const [toast, setToast] = useState(null);

  function showToast(type, title, message) {
    setToast({
      id: Date.now(),
      type,
      title,
      message,
    });
  }

  // Panggilan ke API Controller (US1 Poin 2: Cek database ketersediaan)
  const fetchAvailability = useCallback(async (start, end) => {
    setIsLoading(true);
    try {
      const response = await equipmentApi.checkAvailability(start, end);
      if (response.success) {
        setAvailabilityResult(response.data);
        if (!selectedId && response.data.catalog.length > 0) {
          setSelectedId(response.data.catalog[0].item.id);
        }
      } else {
        showToast('error', 'Gagal Memeriksa Ketersediaan', response.error);
      }
    } catch (err) {
      showToast('error', 'Kesalahan Sistem', err.message || 'Gagal memuat ketersediaan alat.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchAvailability(dateRange.startDate, dateRange.endDate);
  }, [dateRange.startDate, dateRange.endDate, fetchAvailability]);

  function handleDateChange(field, value) {
    setDateRange((current) => {
      const updated = { ...current, [field]: value };
      if (field === 'startDate' && updated.endDate < value) {
        updated.endDate = value;
      }
      return updated;
    });
  }

  async function handleRealTimeCheck() {
    await fetchAvailability(dateRange.startDate, dateRange.endDate);
    const count = availabilityResult?.availableModelsCount ?? 0;
    showToast(
      'success',
      'Pengecekan Real-Time Berhasil',
      `Ditemukan ${count} model alat laboratorium yang siap dipinjam untuk periode ${dateRange.startDate} s/d ${dateRange.endDate}.`
    );
    const heading = document.getElementById('catalog-heading');
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleCreateRequest(equipmentId) {
    const equipment = repository.findAll().equipment.find((item) => item.id === equipmentId);
    const eligibility = evaluateBorrowEligibility(student, equipment, requests);

    if (!eligibility.eligible) {
      showToast(
        'warning',
        'Pengajuan Ditolak (Kelayakan)',
        eligibility.reasonSummary || 'Mahasiswa tidak memenuhi kelayakan untuk mengajukan peminjaman ini.'
      );
      return;
    }

    const newReq = {
      id: `REQ-${String(requests.length + 1).padStart(3, '0')}`,
      studentId: student?.id,
      equipmentId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      status: 'PENDING',
    };

    const updatedRequests = [...requests, newReq];
    setRequests(updatedRequests);

    // Simpan ke database via repository
    const currentData = repository.findAll();
    repository.save({
      ...currentData,
      requests: updatedRequests,
    });

    // Refresh availability
    fetchAvailability(dateRange.startDate, dateRange.endDate);
    showToast(
      'success',
      'Permohonan Berhasil Diajukan',
      `Permohonan ${newReq.id} berhasil dicatat. Staf laboratorium akan memproses verifikasi fisik.`
    );
  }

  function handleHandover(requestId, inventoryUnitId) {
    const currentData = repository.findAll();
    const request = currentData.requests.find((entry) => entry.id === requestId);
    const item = currentData.equipment.find((entry) => entry.id === request?.equipmentId);
    const unit = item?.units.find((entry) => entry.id === inventoryUnitId);

    if (!request || !item || !unit || !['PENDING', 'APPROVED', 'REQUESTED'].includes(request.status)) {
      showToast('error', 'Serah Terima Gagal', 'Permohonan atau unit inventaris tidak valid.');
      return false;
    }

    if (unit.status !== 'AVAILABLE') {
      showToast('error', 'Serah Terima Gagal', `Unit ${unit.id} sudah tidak tersedia.`);
      return false;
    }

    const hasAssignmentConflict = currentData.requests.some((entry) => (
      entry.id !== requestId
      && entry.inventoryUnitId === inventoryUnitId
      && ['PENDING', 'APPROVED', 'BORROWED', 'REQUESTED'].includes(entry.status)
      && entry.startDate <= request.endDate
      && request.startDate <= entry.endDate
    ));

    if (hasAssignmentConflict) {
      showToast('error', 'Serah Terima Gagal', `Unit ${unit.id} sudah ditugaskan untuk permohonan lain pada periode tersebut.`);
      return false;
    }

    const updatedRequests = currentData.requests.map((entry) => (
      entry.id === requestId
        ? { ...entry, status: 'BORROWED', inventoryUnitId }
        : entry
    ));
    const updatedEquipment = currentData.equipment.map((entry) => (
      entry.id === item.id
        ? {
            ...entry,
            units: entry.units.map((inventoryUnit) => (
              inventoryUnit.id === inventoryUnitId
                ? { ...inventoryUnit, status: 'BORROWED' }
                : inventoryUnit
            )),
          }
        : entry
    ));

    if (!repository.save({ ...currentData, requests: updatedRequests, equipment: updatedEquipment })) {
      showToast('error', 'Gagal Menyimpan', 'Periksa penyimpanan browser lalu coba lagi.');
      return false;
    }

    setRequests(updatedRequests);
    fetchAvailability(dateRange.startDate, dateRange.endDate);
    showToast('success', 'Serah Terima Berhasil (US3)', `Unit ${unit.id} (${item.name}) telah diserahkan ke ${request.studentId}.`);
    return true;
  }

  // US5: Handler Proses Pengembalian (Return & Incomplete Return)
  async function handleProcessReturn(payload) {
    const response = await equipmentApi.processReturn(payload);
    if (response.success) {
      const freshData = repository.findAll();
      setRequests(freshData.requests);
      fetchAvailability(dateRange.startDate, dateRange.endDate);

      if (response.data.isIncomplete) {
        showToast(
          'warning',
          'Status: INCOMPLETE RETURN (US5)',
          response.message
        );
      } else {
        showToast(
          'success',
          'Pengembalian Lengkap Berhasil',
          response.message
        );
      }
    } else {
      showToast('error', 'Gagal Memproses Pengembalian', response.error || 'Terjadi kesalahan.');
    }
  }

  // US5: Handler Penyelesaian Incomplete Return
  async function handleResolveIncomplete(payload) {
    const response = await equipmentApi.resolveIncompleteReturn(payload);
    if (response.success) {
      const freshData = repository.findAll();
      setRequests(freshData.requests);
      fetchAvailability(dateRange.startDate, dateRange.endDate);
      showToast(
        'success',
        'Tanggungan Incomplete Return Selesai',
        response.message
      );
    } else {
      showToast('error', 'Gagal Menyelesaikan', response.error || 'Terjadi kesalahan.');
    }
  }

  function handleReset() {
    const fresh = repository.reset();
    setRequests(fresh.requests);
    setStudent(fresh.student);
    setChecklistResetKey((current) => current + 1);
    fetchAvailability('2026-10-25', '2026-10-28');
    setDateRange({ startDate: '2026-10-25', endDate: '2026-10-28' });
    showToast('info', 'Demo Reset', 'Data laboratorium berhasil dikembalikan ke kondisi awal.');
  }

  function handleSaveChecklist(requestId, handoverChecklist) {
    const currentData = repository.findAll();
    const updatedRequests = currentData.requests.map((request) => (
      request.id === requestId ? { ...request, handoverChecklist } : request
    ));

    if (!repository.save({ ...currentData, requests: updatedRequests })) {
      showToast('error', 'Gagal Menyimpan Checklist', 'Periksa penyimpanan browser lalu coba lagi.');
      return;
    }

    setRequests(updatedRequests);
    showToast('success', 'Checklist Tersimpan', `Checklist serah terima untuk ${requestId} berhasil disimpan.`);
  }

  const catalog = availabilityResult?.catalog || [];
  const selectedItemEntry = catalog.find((c) => c.item.id === selectedId) || catalog[0] || null;
  const incompleteCount = requests.filter((r) => r.status === 'INCOMPLETE_RETURN').length;
  const borrowedCount = requests.filter((r) => r.status === 'BORROWED').length;
  const handoverWaitingCount = requests.filter((r) => ['PENDING', 'APPROVED', 'REQUESTED'].includes(r.status)).length;

  // Daftar ID alat yang saat ini sedang dipinjam oleh mahasiswa yang sedang login
  const currentlyBorrowedEquipmentIds = requests
    .filter((r) => r.studentId === student?.id && r.status === 'BORROWED')
    .map((r) => r.equipmentId);

  return (
    <div className="app-container">
      {/* Toast Notification Floating (Mulus & Jelas) */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

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

        {/* Tab Switcher Utama */}
        <nav className="tab-switcher-pillbar" aria-label="Navigasi Peran">
          <button
            type="button"
            className={`tab-pill-btn ${activeView === 'student' ? 'active-pill' : ''}`}
            aria-pressed={activeView === 'student'}
            onClick={() => setActiveView('student')}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>Portal Mahasiswa (Reservasi)</span>
            {borrowedCount > 0 && <span className="tab-active-indicator" title="Ada barang yang sedang dipinjam">{borrowedCount} Dipinjam</span>}
          </button>

          <button
            type="button"
            className={`tab-pill-btn ${activeView === 'staff' ? 'active-pill' : ''}`}
            aria-pressed={activeView === 'staff'}
            onClick={() => setActiveView('staff')}
          >
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            <span>Panel Staf (Inspeksi &amp; Serah Terima)</span>
            <span className="us7-gold-badge">US3 &amp; US5</span>
            {incompleteCount > 0 && <span className="pending-badge-count">{incompleteCount}</span>}
          </button>
        </nav>
      </header>

      {activeView === 'student' && <SafetyBanner />}

      {/* Widget Peringatan & Status Peminjaman Aktif Mahasiswa */}
      {activeView === 'student' && (
        <ActiveBorrowingWidget
          requests={requests}
          equipment={repository.findAll().equipment}
          student={student}
        />
      )}

      {activeView === 'student' ? (
        <main className="student-view-layout">
          {/* US1 Poin 1: UI Pemilih Tanggal (Kalender) */}
          <DatePickerCard
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            onCheckAvailability={handleRealTimeCheck}
            isLoading={isLoading}
          />

          {/* Katalog Alat Siap Pinjam & Detail */}
          <div className="catalog-and-details-grid">
            <EquipmentList
              catalog={catalog}
              availableCount={availabilityResult?.availableModelsCount ?? 0}
              selectedId={selectedItemEntry?.item.id}
              onSelect={setSelectedId}
              borrowedEquipmentIds={currentlyBorrowedEquipmentIds}
            />

            <aside className="details-sidebar-column">
              <EquipmentDetails
                equipmentItem={selectedItemEntry?.item}
                availableUnits={selectedItemEntry?.availableUnits ?? 0}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onCreateRequest={handleCreateRequest}
                student={student}
                requests={requests}
              />
            </aside>
          </div>

          {/* Riwayat Permohonan */}
          <section className="student-requests-section" aria-labelledby="my-requests-heading">
            <div className="section-title-bar">
              <div>
                <h2 id="my-requests-heading" className="section-main-heading">Permohonan Peminjaman Saya</h2>
                <p className="section-sub-heading">Daftar reservasi alat laboratorium yang telah Anda ajukan.</p>
              </div>
              <span className="requests-count-tag">{requests.length} Riwayat</span>
            </div>
            <RequestList
              requests={requests}
              equipment={repository.findAll().equipment}
              checklistResetKey={checklistResetKey}
              onSaveChecklist={handleSaveChecklist}
            />
          </section>
        </main>
      ) : (
        <main className="staff-view-layout">
          {/* Sub-navigasi Meja Staf: Serah Terima vs Pengembalian */}
          <div className="staff-desk-selector" role="tablist" aria-label="Sub Meja Staf">
            <button
              type="button"
              className={`staff-desk-tab-btn ${staffDeskTab === 'return' ? 'active-desk' : ''}`}
              onClick={() => setStaffDeskTab('return')}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              <span>Meja Pengembalian &amp; Incomplete Return (US5)</span>
              {borrowedCount > 0 && <span className="desk-count-pill">{borrowedCount}</span>}
              {incompleteCount > 0 && <span className="desk-count-pill tag-danger">{incompleteCount} Masalah</span>}
            </button>

            <button
              type="button"
              className={`staff-desk-tab-btn ${staffDeskTab === 'handover' ? 'active-desk' : ''}`}
              onClick={() => setStaffDeskTab('handover')}
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <span>Meja Serah Terima Fisik (US3)</span>
              {handoverWaitingCount > 0 && <span className="desk-count-pill">{handoverWaitingCount}</span>}
            </button>
          </div>

          {staffDeskTab === 'return' ? (
            <ReturnPanel
              requests={requests}
              equipment={repository.findAll().equipment}
              onProcessReturn={handleProcessReturn}
              onResolveIncomplete={handleResolveIncomplete}
            />
          ) : (
            <HandoverPanel
              requests={requests}
              equipment={repository.findAll().equipment}
              onHandover={handleHandover}
            />
          )}
        </main>
      )}

      <footer className="app-main-footer">
        <p>LabAsset Management System · Implementasi US1, US3 &amp; US5 (OOP Architecture) · SDLC P10</p>
      </footer>
    </div>
  );
}
