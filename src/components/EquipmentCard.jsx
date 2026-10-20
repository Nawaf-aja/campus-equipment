export default function EquipmentCard({ equipmentItem, isSelected, onSelect }) {
  const availableUnits = equipmentItem.units.filter((unit) => unit.status === 'AVAILABLE').length;
  const unitLabel = availableUnits === 1 ? 'unit' : 'units';

  return (
    <button
      className={`record-card${isSelected ? ' selected' : ''}`}
      type="button"
      onClick={() => onSelect(equipmentItem.id)}
      aria-pressed={isSelected}
    >
      <span className="card-heading">
        <span>
          <strong>{equipmentItem.name}</strong>
          <span className="meta"> · {equipmentItem.id}</span>
        </span>
        <span className={`status-badge ${availableUnits > 0 ? 'success' : 'neutral'}`}>
          {availableUnits > 0 ? 'AVAILABLE' : 'UNAVAILABLE'}
        </span>
      </span>
      <span className="card-footer">
        <span>{equipmentItem.category}</span>
        <span>
          {availableUnits} {unitLabel}
        </span>
      </span>
    </button>
  );
}
