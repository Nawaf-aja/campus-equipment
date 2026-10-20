import { formatDate, getEquipmentName, isOverdue } from '../utils/equipmentUtils.js';
import StatusBadge from './StatusBadge.jsx';

export default function RequestList({ requests, equipment }) {
  if (requests.length === 0) {
    return <div className="empty-state">No requests yet. Your equipment requests will appear here.</div>;
  }

  return (
    <ul className="secondary-list" aria-label="Your equipment requests">
      {requests.map((request) => {
        const overdue = isOverdue(request);
        const unit = equipment
          .find((item) => item.id === request.equipmentId)
          ?.units.find((item) => item.id === request.inventoryUnitId);

        return (
          <li className={`secondary-row request-row${overdue ? ' overdue-row' : ''}`} key={request.id}>
            <div className="request-summary">
              <p><strong>{getEquipmentName(equipment, request.equipmentId)}</strong></p>
              <span className="meta">
                {request.id} · {formatDate(request.startDate)} – {formatDate(request.endDate)}
              </span>
              {unit && <span className="meta unit-reference">Physical ID: {unit.serialNumber}</span>}
              {request.pickupCode && (
                <span className="pickup-code">
                  Pickup code <strong>{request.pickupCode}</strong>
                </span>
              )}
              {overdue && <span className="late-warning">Return overdue — please contact equipment staff.</span>}
              {request.status === 'INCOMPLETE_RETURN' && (
                <span className="late-warning">Incomplete return — resolve with equipment staff to restore eligibility.</span>
              )}
            </div>
            <StatusBadge status={overdue ? 'LATE' : request.status} />
          </li>
        );
      })}
    </ul>
  );
}
