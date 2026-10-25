function formatDisplayDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export default function DatePickerCard({
  startDate,
  endDate,
  onDateChange,
  onCheckAvailability,
  isLoading = false,
}) {
  // Tanggal bulan Oktober 2026 sesuai dengan tampilan desain antarmuka
  // Hari: S (Senin), S (Selasa), R (Rabu), K (Kamis), J (Jumat), S (Sabtu), M (Minggu)
  const calendarDays = [
    { day: 22, dateStr: '2026-10-22' },
    { day: 23, dateStr: '2026-10-23' },
    { day: 24, dateStr: '2026-10-24' },
    { day: 25, dateStr: '2026-10-25' },
    { day: 26, dateStr: '2026-10-26' },
    { day: 27, dateStr: '2026-10-27' },
    { day: 28, dateStr: '2026-10-28' },
    { day: 29, dateStr: '2026-10-29' },
    { day: 30, dateStr: '2026-10-30' },
    { day: 31, dateStr: '2026-10-31' },
  ];

  function handleDayClick(dateStr) {
    if (!startDate || (startDate && endDate && startDate !== endDate)) {
      onDateChange('startDate', dateStr);
      onDateChange('endDate', dateStr);
    } else if (dateStr < startDate) {
      onDateChange('startDate', dateStr);
    } else {
      onDateChange('endDate', dateStr);
    }
  }

  function getDayClass(dateStr) {
    const isStart = dateStr === startDate;
    const isEnd = dateStr === endDate;
    const inRange = startDate && endDate && dateStr > startDate && dateStr < endDate;

    if (isStart && isEnd) return 'calendar-day day-start-end';
    if (isStart) return 'calendar-day day-start';
    if (isEnd) return 'calendar-day day-end';
    if (inRange) return 'calendar-day day-in-range';
    return 'calendar-day';
  }

  return (
    <section className="date-picker-card" aria-labelledby="date-picker-heading">
      <div className="date-card-header">
        <div className="date-card-title-wrap">
          <span className="date-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <h2 id="date-picker-heading" className="date-card-title">Pilih Tanggal Peminjaman</h2>
        </div>
        <span className="month-badge">Oktober 2026</span>
      </div>

      <div className="date-inputs-grid">
        <div className="date-input-group">
          <label htmlFor="mulai-pinjam" className="date-label">Mulai Pinjam</label>
          <div className="custom-date-box">
            <input
              id="mulai-pinjam"
              type="date"
              className="native-date-input"
              value={startDate}
              onChange={(e) => onDateChange('startDate', e.target.value)}
            />
            <span className="formatted-date-text">{formatDisplayDate(startDate) || 'Pilih tanggal'}</span>
            <span className="date-box-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>
        </div>

        <div className="date-input-group">
          <label htmlFor="selesai-pinjam" className="date-label">Selesai Pinjam</label>
          <div className="custom-date-box">
            <input
              id="selesai-pinjam"
              type="date"
              className="native-date-input"
              min={startDate}
              value={endDate}
              onChange={(e) => onDateChange('endDate', e.target.value)}
            />
            <span className="formatted-date-text">{formatDisplayDate(endDate) || 'Pilih tanggal'}</span>
            <span className="date-box-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Mini Kalender Visual Mahasiswa */}
      <div className="mini-calendar-widget">
        <div className="calendar-weekdays-row" aria-hidden="true">
          <span>S</span>
          <span>S</span>
          <span>R</span>
          <span>K</span>
          <span>J</span>
          <span>S</span>
          <span>M</span>
        </div>
        <div className="calendar-grid-row">
          {calendarDays.map((item) => (
            <button
              key={item.day}
              type="button"
              className={getDayClass(item.dateStr)}
              onClick={() => handleDayClick(item.dateStr)}
              aria-label={`Pilih tanggal ${item.day} Oktober 2026`}
            >
              {item.day}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-dot dot-selected" aria-hidden="true" />
          Dipilih
        </span>
        <span className="legend-item">
          <span className="legend-dot dot-available" aria-hidden="true" />
          Tersedia
        </span>
        <span className="legend-item">
          <span className="legend-dot dot-full" aria-hidden="true" />
          Penuh
        </span>
      </div>

      <button
        type="button"
        className="realtime-check-btn"
        onClick={onCheckAvailability}
        disabled={isLoading}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {isLoading ? 'Memeriksa Database...' : 'Cek Ketersediaan Real-Time'}
      </button>
    </section>
  );
}
