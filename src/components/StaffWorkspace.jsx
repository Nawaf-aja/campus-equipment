import { useState } from 'react';
import { formatDate, getAssignableUnits, getEquipmentName, isOverdue } from '../utils/equipmentUtils.js';
import StatusBadge from './StatusBadge.jsx';

function Checklist({ accessories, checked, onChange, legend }) {
  return (
    <fieldset className="checklist">
      <legend>{legend}</legend>
      {accessories.map((accessory) => (
        <label className="checklist-item" key={accessory}>
          <input
            type="checkbox"
            checked={checked.includes(accessory)}
            onChange={() => onChange(accessory)}
          />
          <span>{accessory}</span>
        </label>
      ))}
    </fieldset>
  );
}

function HandoverForm({ request, equipmentItem, requests, onSubmit }) {
  const units = getAssignableUnits(equipmentItem, requests, request);
  const [unitId, setUnitId] = useState(units[0]?.id ?? '');
  const [code, setCode] = useState('');
  const [checked, setChecked] = useState(equipmentItem.accessories);
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('Good');
  const [error, setError] = useState('');

  function toggleAccessory(accessory) {
    setChecked((current) => current.includes(accessory)
      ? current.filter((item) => item !== accessory)
      : [...current, accessory]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!unitId) {
      setError('No physical unit is available for these dates.');
      return;
    }
    if (!/^[A-Z0-9]{6}$/i.test(code.trim())) {
      setError('Enter the 6-character pickup code provided by the student.');
      return;
    }
    const submissionError = onSubmit(request.id, {
      unitId,
      code: code.trim().toUpperCase(),
      checkedAccessories: checked,
      notes,
      condition,
    });
    setError(submissionError ?? '');
  }

  return (
    <form className="workflow-form" onSubmit={handleSubmit}>
      <label>
        Verify pickup code
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="6-character code"
          maxLength={6}
          autoComplete="off"
        />
      </label>
      <label>
        Physical inventory ID
        <select value={unitId} onChange={(event) => setUnitId(event.target.value)} disabled={!units.length}>
          {units.length === 0 && <option value="">No units available</option>}
          {units.map((unit) => (
            <option value={unit.id} key={unit.id}>{unit.serialNumber} · {unit.condition}</option>
          ))}
        </select>
      </label>
      <Checklist
        accessories={equipmentItem.accessories}
        checked={checked}
        onChange={toggleAccessory}
        legend="Handover condition & accessories"
      />
      <label>
        Condition notes
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
      </label>
      <label>
        Physical condition
        <select value={condition} onChange={(event) => setCondition(event.target.value)}>
          <option>Good</option>
          <option>Fair</option>
          <option>Damaged</option>
        </select>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={!units.length}>Verify code &amp; hand over</button>
    </form>
  );
}

function ReturnForm({ request, equipmentItem, onSubmit }) {
  const [checked, setChecked] = useState(equipmentItem.accessories);
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('Good');
  const [error, setError] = useState('');

  function toggleAccessory(accessory) {
    setChecked((current) => current.includes(accessory)
      ? current.filter((item) => item !== accessory)
      : [...current, accessory]);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const submissionError = onSubmit(request.id, { checkedAccessories: checked, notes, condition });
    setError(submissionError ?? '');
  }

  return (
    <form className="workflow-form" onSubmit={handleSubmit}>
      <Checklist
        accessories={equipmentItem.accessories}
        checked={checked}
        onChange={toggleAccessory}
        legend="Return condition & accessories"
      />
      <label>
        Return notes
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
      </label>
      <label>
        Physical condition
        <select value={condition} onChange={(event) => setCondition(event.target.value)}>
          <option>Good</option>
          <option>Fair</option>
          <option>Damaged</option>
        </select>
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit">Record return</button>
    </form>
  );
}

export default function StaffWorkspace({
  requests,
  equipment,
  onApprove,
  onHandover,
  onReturn,
  onResolveIncomplete,
}) {
  const actionableRequests = requests.filter((request) =>
    ['PENDING', 'APPROVED', 'BORROWED', 'INCOMPLETE_RETURN'].includes(request.status)
  );

  if (actionableRequests.length === 0) {
    return <div className="empty-state">No requests need staff attention right now.</div>;
  }

  return (
    <div className="staff-request-list">
      {actionableRequests.map((request) => {
        const equipmentItem = equipment.find((item) => item.id === request.equipmentId);
        if (!equipmentItem) return null;
        const overdue = isOverdue(request);

        return (
          <article className={`staff-request${overdue ? ' overdue-row' : ''}`} key={request.id}>
            <div className="staff-request-heading">
              <div>
                <p className="eyebrow">{request.id} · {request.studentId}</p>
                <h3>{getEquipmentName(equipment, request.equipmentId)}</h3>
                <span className="meta">
                  {formatDate(request.startDate)} – {formatDate(request.endDate)}
                </span>
              </div>
              <StatusBadge status={overdue ? 'LATE' : request.status} />
            </div>
            {overdue && <p className="late-warning">This item is overdue. Record the return to close the loan.</p>}
            {request.status === 'PENDING' && (
              <button className="primary-button" type="button" onClick={() => onApprove(request.id)}>
                Approve &amp; generate pickup code
              </button>
            )}
            {request.status === 'APPROVED' && (
              <HandoverForm
                request={request}
                equipmentItem={equipmentItem}
                requests={requests}
                onSubmit={onHandover}
              />
            )}
            {request.status === 'BORROWED' && (
              <div className="return-workflow">
                <p className="meta">Physical ID: {equipmentItem.units.find((unit) => unit.id === request.inventoryUnitId)?.serialNumber ?? 'Not recorded'}</p>
                <ReturnForm request={request} equipmentItem={equipmentItem} onSubmit={onReturn} />
              </div>
            )}
            {request.status === 'INCOMPLETE_RETURN' && (
              <div className="resolution-panel">
                <p className="late-warning">
                  Missing accessories are recorded. Confirm the issue has been resolved to restore student eligibility.
                </p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onResolveIncomplete(request.id)}
                >
                  Resolve return issue
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
