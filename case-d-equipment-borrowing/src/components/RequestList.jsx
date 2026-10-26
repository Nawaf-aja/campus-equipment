import { getEquipmentName, getOverdueDays } from '../utils/equipmentUtils.js';
import StatusBadge from './StatusBadge.jsx';

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export default function RequestList({ requests, equipment }) {
  if (requests.length === 0) {
    return <div className="empty-state">No demo requests have been recorded.</div>;
  }

  return (
    <ul className="secondary-list" aria-label="Demo equipment requests">
      {requests.map((request) => {
        const overdueDays = getOverdueDays(request);
        const dueDate = request.dueDate ?? request.endDate;

        return (
          <li
            className={`secondary-row${overdueDays > 0 ? ' overdue-row' : ''}`}
            key={request.id}
          >
            <div className="request-summary">
              <p>
                <strong>{getEquipmentName(equipment, request.equipmentId)}</strong>
              </p>
              <span className="meta">{request.id}</span>
              {overdueDays > 0 && (
                <div className="overdue-warning" role="alert">
                  <strong>Late return warning</strong>
                  <span>
                    Due {formatDate(dueDate)} · {overdueDays} {overdueDays === 1 ? 'day' : 'days'} overdue.
                    Please return this equipment as soon as possible.
                  </span>
                </div>
              )}
            </div>
            <StatusBadge status={overdueDays > 0 ? 'OVERDUE' : request.status} />
          </li>
        );
      })}
    </ul>
  );
}
