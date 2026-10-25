import { canCreateDemoRequest } from '../utils/equipmentUtils.js';

export default function EquipmentDetails({ equipmentItem, onCreateRequest }) {
  if (!equipmentItem) {
    return <div className="empty-state">Select equipment to view its details.</div>;
  }

  const canRequest = canCreateDemoRequest(equipmentItem);

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{equipmentItem.id}</p>
          <h2>{equipmentItem.name}</h2>
        </div>
        <span className={`status-badge ${canRequest ? 'success' : 'neutral'}`}>
          {canRequest ? 'AVAILABLE' : 'UNAVAILABLE'}
        </span>
      </div>

      <dl className="details-list">
        <dt>Category</dt>
        <dd>{equipmentItem.category}</dd>
        <dt>Available units</dt>
        <dd>{equipmentItem.availableUnits}</dd>
      </dl>

      <button
        className="primary-button"
        type="button"
        onClick={() => onCreateRequest(equipmentItem.id)}
        disabled={!canRequest}
      >
        {canRequest ? 'Create Demo Request' : 'No Units Available'}
      </button>
      <p className="helper-text">
        A demo request is only a record. It does not reduce available units.
      </p>
    </>
  );
}
