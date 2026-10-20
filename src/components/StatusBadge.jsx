const successStatuses = new Set(['STORED', 'AVAILABLE', 'DONE', 'READY', 'RETURNED']);
const infoStatuses = new Set(['FOUND', 'NEW', 'IN_PROGRESS', 'REQUESTED', 'PENDING', 'APPROVED', 'BORROWED']);
const warningStatuses = new Set(['PREPARING', 'MAINTENANCE']);
const dangerStatuses = new Set(['INCOMPLETE_RETURN', 'LATE', 'OUT_OF_SERVICE']);

function getTone(status) {
  if (successStatuses.has(status)) return 'success';
  if (infoStatuses.has(status)) return 'info';
  if (warningStatuses.has(status)) return 'warning';
  if (dangerStatuses.has(status)) return 'danger';
  return 'neutral';
}

export default function StatusBadge({ status }) {
  const label = status.replaceAll('_', ' ');
  return <span className={`status-badge ${getTone(status)}`}>{label}</span>;
}
