export default function SafetyBanner() {
  return (
    <div className="safety-banner" role="status" aria-label="Filter Keamanan Alat">
      <div className="safety-banner-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <div className="safety-banner-text">
        <strong>Filter Keamanan Alat Aktif:</strong> Hanya menampilkan alat yang lolos uji. Alat berstatus{' '}
        <span className="safety-pill badge-inspection">In Inspection</span> dan{' '}
        <span className="safety-pill badge-maintenance">Maintenance</span> otomatis disembunyikan.
      </div>
    </div>
  );
}
