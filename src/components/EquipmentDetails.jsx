import { getEligibility } from '../utils/equipmentUtils.js';

export default function EquipmentDetails({
  equipmentItem,
  student,
  requests,
  availableUnits,
  startDate,
  endDate,
  onDateChange,
  onCreateRequest,
}) {
  if (!equipmentItem) {
    return <div className="empty-state">Select equipment to view its details.</div>;
  }

  const eligibility = getEligibility(equipmentItem, student, requests);
  const canRequest = eligibility.eligible && availableUnits > 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{equipmentItem.id} · {equipmentItem.category}</p>
          <h2>{equipmentItem.name}</h2>
        </div>
        <span className={`status-badge ${availableUnits > 0 ? 'success' : 'warning'}`}>
          {availableUnits > 0 ? `${availableUnits} AVAILABLE` : 'UNAVAILABLE'}
        </span>
      </div>
      <p className="muted equipment-description">{equipmentItem.description}</p>

      <div className={`eligibility-card ${eligibility.eligible ? 'eligible' : 'ineligible'}`} role="status">
        <strong>{eligibility.eligible ? 'Eligible to request' : 'Not eligible'}</strong>
        <span>{eligibility.reason}</span>
        {equipmentItem.requiresTraining && (
          <span className="meta">
            Required training: {student.trainingCompleted ? 'completed' : 'not completed'}
          </span>
        )}
      </div>

      <div className="date-fields">
        <label>
          Borrow from
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(event) => onDateChange('startDate', event.target.value)}
          />
        </label>
        <label>
          Return by
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(event) => onDateChange('endDate', event.target.value)}
          />
        </label>
      </div>

      <p className="availability-note">
        {availableUnits} physical {availableUnits === 1 ? 'unit is' : 'units are'} free for these dates.
      </p>

      <div className="accessory-preview">
        <strong>Included accessories</strong>
        <span>{equipmentItem.accessories.join(' · ')}</span>
      </div>

      <button
        className="primary-button request-button"
        type="button"
        onClick={() => onCreateRequest(equipmentItem.id)}
        disabled={!canRequest}
      >
        {canRequest ? 'Request equipment' : !eligibility.eligible ? 'Request unavailable' : 'No units available'}
      </button>
    </>
  );
}
