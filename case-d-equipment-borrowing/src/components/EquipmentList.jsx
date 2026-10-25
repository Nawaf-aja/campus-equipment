import EquipmentCard from './EquipmentCard.jsx';

export default function EquipmentList({ equipment, selectedId, onSelect }) {
  if (equipment.length === 0) {
    return <div className="empty-state">No equipment records are available.</div>;
  }

  return (
    <ul className="record-list" aria-label="Campus equipment">
      {equipment.map((equipmentItem) => (
        <li key={equipmentItem.id}>
          <EquipmentCard
            equipmentItem={equipmentItem}
            isSelected={equipmentItem.id === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}
