import { useEffect, useState, useCallback } from 'react';
import DatePickerCard from './components/DatePickerCard.jsx';
import EquipmentDetails from './components/EquipmentDetails.jsx';
import EquipmentList from './components/EquipmentList.jsx';
import RequestList from './components/RequestList.jsx';
import ResetControl from './components/ResetControl.jsx';
import SafetyBanner from './components/SafetyBanner.jsx';
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
  const [requests, setRequests] = useState(() => repository.findAll().requests);
  const [student, setStudent] = useState(() => repository.findAll().student);
  const [notice, setNotice] = useState('');

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
        setNotice(response.error);
      }
    } catch (err) {
      setNotice(err.message || 'Gagal memuat ketersediaan alat.');
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
    setNotice('');
  }

  async function handleRealTimeCheck() {
    await fetchAvailability(dateRange.startDate, dateRange.endDate);
    const count = availabilityResult?.availableModelsCount ?? 0;
    setNotice(
      `Pemeriksaan Real-Time selesai: ${count} model alat laboratorium siap dipinjam untuk periode ${dateRange.startDate} s/d ${dateRange.endDate}.`
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
      setNotice(eligibility.reasonSummary || 'Mahasiswa tidak memenuhi kelayakan untuk mengajukan peminjaman ini.');
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
    setNotice(`Permohonan ${newReq.id} berhasil diajukan untuk periode ${dateRange.startDate} s/d ${dateRange.endDate}.`);
  }

  function handleReset() {
    const fresh = repository.reset();
    setRequests(fresh.requests);
    setStudent(fresh.student);
    fetchAvailability('2026-10-25', '2026-10-28');
    setDateRange({ startDate: '2026-10-25', endDate: '2026-10-28' });
    setNotice('Data laboratorium berhasil di-reset ke kondisi awal.');
  }

  const catalog = availabilityResult?.catalog || [];
  const selectedItemEntry = catalog.find((c) => c.item.id === selectedId) || catalog[0] || null;

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

        {/* Tab Switcher */}
        <nav className="tab-switcher-pillbar" aria-label="Navigasi Peran">
          <button type="button" className="tab-pill-btn active-pill">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>Portal Mahasiswa (Reservasi)</span>
          </button>

          <button type="button" className="tab-pill-btn">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            <span>Panel Staf (Inspeksi &amp; Serah Terima)</span>
            <span className="us7-gold-badge">US7</span>
          </button>
        </nav>
      </header>

      {/* US1 Poin 3: Banner Filter Keamanan Alat Aktif */}
      <SafetyBanner />

      {/* Notifikasi Sistem */}
      {notice && <div className="system-alert alert-info" role="status">{notice}</div>}

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
          />
        </section>
      </main>

      <footer className="app-main-footer">
        <p>LabAsset Management System · Implementasi US 1 (OOP Architecture) · SDLC P10</p>
      </footer>
    </div>
  );
}
