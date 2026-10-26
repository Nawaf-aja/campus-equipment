function formatDate(dateString) {
  if (!dateString) return 'Belum ditentukan';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function ActiveBorrowingWidget({
  requests = [],
  equipment = [],
  student = null,
}) {
  const studentRequests = requests.filter((r) => r.studentId === student?.id);
  const borrowedItems = studentRequests.filter((r) => r.status === 'BORROWED');
  const incompleteItems = studentRequests.filter((r) => r.status === 'INCOMPLETE_RETURN');

  const hasBorrowed = borrowedItems.length > 0;
  const hasIncomplete = incompleteItems.length > 0;

  // Jika mahasiswa memiliki tanggungan Incomplete Return (US5), prioritaskan peringatan ini di posisi teratas!
  if (hasIncomplete) {
    return (
      <div className="active-borrowing-card card-alert-incomplete" role="alert">
        <div className="borrowing-widget-header">
          <div className="widget-header-title-wrap">
            <span className="widget-icon icon-danger" aria-hidden="true">⚠️</span>
            <div>
              <h3 className="widget-main-title">Peringatan: Tanggungan Pengembalian Belum Selesai (US5)</h3>
              <p className="widget-sub-title">
                Penyelesaian pengembalian ditahan karena ada komponen fisik yang belum Anda serahkan.
              </p>
            </div>
          </div>
          <span className="widget-badge badge-danger">Akses Baru Terkunci</span>
        </div>

        <div className="borrowing-items-list">
          {incompleteItems.map((req) => {
            const item = equipment.find((e) => e.id === req.equipmentId);
            const missingList = req.missingAccessories || ['Aksesoris fisik'];
            return (
              <div key={req.id} className="borrowed-detail-row row-incomplete">
                <div className="row-item-main">
                  <div className="row-title-line">
                    <strong className="item-name">{item?.name || req.equipmentId}</strong>
                    <span className="req-id-pill">{req.id}</span>
                  </div>
                  <p className="row-meta-line">
                    Unit Fisik: <code>{req.inventoryUnitId || 'UNIT-001'}</code> · Jadwal Pinjam: {formatDate(req.startDate)} s/d {formatDate(req.endDate)}
                  </p>
                  <div className="missing-alert-box">
                    <strong>Komponen Kurang / Belum Diserahkan:</strong>
                    <div className="missing-tags-container">
                      {missingList.map((missing) => (
                        <span key={missing} className="missing-item-tag">
                          ❌ {missing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="widget-footer-notice">
          ℹ️ Hak peminjaman alat baru otomatis <strong>ditangguhkan</strong> hingga Anda menyerahkan/mengganti komponen yang hilang kepada staf laboratorium.
        </div>
      </div>
    );
  }

  // Jika mahasiswa sedang meminjam barang (BORROWED)
  if (hasBorrowed) {
    return (
      <div className="active-borrowing-card card-borrowed-active" role="region" aria-label="Barang Sedang Dipinjam">
        <div className="borrowing-widget-header">
          <div className="widget-header-title-wrap">
            <span className="widget-icon icon-primary" aria-hidden="true">📦</span>
            <div>
              <h3 className="widget-main-title">Peralatan yang Sedang Anda Pinjam ({borrowedItems.length})</h3>
              <p className="widget-sub-title">
                Harap jaga fisik alat dan bawa seluruh aksesoris lengkap saat pengembalian ke laboratorium.
              </p>
            </div>
          </div>
          <span className="widget-badge badge-active">Sedang Aktif Dipinjam</span>
        </div>

        <div className="borrowing-items-list">
          {borrowedItems.map((req) => {
            const item = equipment.find((e) => e.id === req.equipmentId);
            const unit = item?.units.find((u) => u.id === req.inventoryUnitId);
            const accessoriesList = item?.accessories || [];

            return (
              <div key={req.id} className="borrowed-detail-row row-active">
                <div className="row-item-main">
                  <div className="row-title-line">
                    <strong className="item-name">{item?.name || req.equipmentId}</strong>
                    <span className="req-id-pill">{req.id}</span>
                  </div>
                  <p className="row-meta-line">
                    ID Inventaris Fisik: <strong>{req.inventoryUnitId || 'UNIT-001'}</strong>
                    {unit?.serialNumber ? ` (${unit.serialNumber})` : ''} · Batas Pengembalian: <strong>{formatDate(req.endDate)}</strong>
                  </p>

                  {accessoriesList.length > 0 && (
                    <div className="held-accessories-box">
                      <span className="held-acc-title">Kelengkapan di tangan Anda:</span>
                      <div className="held-acc-tags">
                        {accessoriesList.map((acc) => (
                          <span key={acc} className="held-acc-pill">
                            ✓ {acc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Jika tidak ada barang yang sedang dipinjam
  return (
    <div className="clean-account-status-bar">
      <span className="status-dot-clean" aria-hidden="true" />
      <span>
        Status Akun Mahasiswa: <strong>Aktif &amp; Bebas Tanggungan</strong> · Tidak ada alat yang sedang dipinjam (Siap mengajukan reservasi).
      </span>
    </div>
  );
}
