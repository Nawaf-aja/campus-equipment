import { getEquipmentName } from '../utils/equipmentUtils.js';
import HandoverChecklist from './HandoverChecklist.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function RequestList({ requests, equipment, onSaveChecklist }) {
  if (requests.length === 0) {
    return <div className="empty-state">No demo requests have been recorded.</div>;
  }

  return (
    <ul className="secondary-list" aria-label="Demo equipment requests">
      {requests.map((request) => {
        const equipmentItem = equipment.find((item) => item.id === request.equipmentId);
        return (
          <li className="request-checklist-row" key={request.id}>
            <div className="secondary-row">
              <div>
                <p>
                  <strong>{getEquipmentName(equipment, request.equipmentId)}</strong>
                </p>
                <span className="meta">{request.id}</span>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <HandoverChecklist
              request={request}
              accessories={equipmentItem?.accessories ?? []}
              onSave={onSaveChecklist}
            />
          </li>
        );
      })}
    </ul>
  );
}
