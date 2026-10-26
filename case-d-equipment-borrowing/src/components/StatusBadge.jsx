const successStatuses = new Set(['STORED', 'AVAILABLE', 'DONE', 'READY', 'RETURNED']);
const infoStatuses = new Set(['FOUND', 'NEW', 'IN_PROGRESS', 'REQUESTED', 'PENDING', 'APPROVED', 'BORROWED']);
const warningStatuses = new Set([
  'PREPARING',
  'MAINTENANCE',
  'INSPECTION_BUFFER',
  'IN_INSPECTION',
  'NEEDS_INSPECTION',
]);
const dangerStatuses = new Set(['INCOMPLETE_RETURN', 'LATE', 'OVERDUE', 'OUT_OF_SERVICE']);

function getTone(status) {
  const normalized = String(status ?? '').toUpperCase();

  if (successStatuses.has(normalized)) return 'success';
  if (infoStatuses.has(normalized)) return 'info';
  if (dangerStatuses.has(normalized)) return 'danger';
  if (
    warningStatuses.has(normalized)
    || normalized.includes('INSPECTION')
    || normalized.includes('BUFFER')
  ) {
    return 'warning';
  }
  return 'neutral';
}

export default function StatusBadge({ status = 'AVAILABLE' }) {
  const normalized = String(status ?? '').toUpperCase();
  const label = normalized.replaceAll('_', ' ');
  return <span className={`status-badge ${getTone(status)}`}>{label}</span>;
}
