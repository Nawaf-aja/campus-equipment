const successStatuses = new Set(['STORED', 'AVAILABLE', 'DONE', 'READY']);
const infoStatuses = new Set(['FOUND', 'NEW', 'IN_PROGRESS', 'REQUESTED']);
const warningStatuses = new Set(['PREPARING']);

function getTone(status) {
  if (successStatuses.has(status)) return 'success';
  if (infoStatuses.has(status)) return 'info';
  if (warningStatuses.has(status)) return 'warning';
  return 'neutral';
}

export default function StatusBadge({ status }) {
  const label = status.replaceAll('_', ' ');
  return <span className={`status-badge ${getTone(status)}`}>{label}</span>;
}
