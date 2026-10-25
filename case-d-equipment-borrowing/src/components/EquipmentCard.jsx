import { getEquipmentAvailabilityStatus } from '../utils/equipmentUtils.js';

export default function EquipmentCard({ equipmentItem, isSelected, onSelect }) {
  const unitLabel = equipmentItem.availableUnits === 1 ? 'unit' : 'units';
  const status = getEquipmentAvailabilityStatus(equipmentItem);

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
        <span className={`status-badge ${status === 'AVAILABLE' ? 'success' : 'warning'}`}>
          {status.replaceAll('_', ' ')}
        </span>
      </span>
      <span className="card-footer">
        <span>{equipmentItem.category}</span>
        <span>
          {equipmentItem.availableUnits} {unitLabel}
        </span>
      </span>
    </button>
  );
}
