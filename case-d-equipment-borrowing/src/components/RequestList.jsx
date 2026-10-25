import { getEquipmentName } from '../utils/equipmentUtils.js';
import StatusBadge from './StatusBadge.jsx';

export default function RequestList({ requests, equipment }) {
  if (requests.length === 0) {
    return <div className="empty-state">No demo requests have been recorded.</div>;
  }

  return (
    <ul className="secondary-list" aria-label="Demo equipment requests">
      {requests.map((request) => (
        <li className="secondary-row" key={request.id}>
          <div>
            <p>
              <strong>{getEquipmentName(equipment, request.equipmentId)}</strong>
            </p>
            <span className="meta">{request.id}</span>
          </div>
          <StatusBadge status={request.status} />
        </li>
      ))}
    </ul>
  );
}
