import EquipmentCard from './EquipmentCard.jsx';

export default function EquipmentList({
  catalog = [],
  availableCount = 0,
  selectedId,
  onSelect,
}) {
  return (
    <section className="catalog-section" aria-labelledby="catalog-heading">
      <div className="catalog-section-header">
        <div className="catalog-title-group">
          <h2 id="catalog-heading" className="catalog-title">Alat Siap Pinjam</h2>
          <span className="available-models-pill">
            {availableCount} Model Tersedia
          </span>
        </div>
        <div className="filter-auto-status">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
          Filter otomatis diterapkan
        </div>
      </div>

      {catalog.length === 0 ? (
        <div className="empty-catalog-state">
          Tidak ada peralatan yang lolos uji keamanan saat ini.
        </div>
      ) : (
        <div className="equipment-cards-stack">
          {catalog.map(({ item, availableUnits, isReady }) => (
            <EquipmentCard
              key={item.id}
              item={item}
              availableUnits={availableUnits}
              isReady={isReady}
              isSelected={item.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
