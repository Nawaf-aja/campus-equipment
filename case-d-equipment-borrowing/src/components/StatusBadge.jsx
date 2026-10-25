const successStatuses = new Set(['STORED', 'AVAILABLE', 'DONE', 'READY']);
const infoStatuses = new Set(['FOUND', 'NEW', 'IN_PROGRESS', 'REQUESTED']);
const warningStatuses = new Set([
  'PREPARING',
  'INSPECTION_BUFFER',
  'IN_INSPECTION',
  'NEEDS_INSPECTION',
]);

function getTone(status) {
  const normalized = String(status ?? '').toUpperCase();

  if (successStatuses.has(normalized)) return 'success';
  if (infoStatuses.has(normalized)) return 'info';
  if (warningStatuses.has(normalized) || normalized.includes('INSPECTION') || normalized.includes('BUFFER')) {
    return 'warning';
  }
  return 'neutral';
}

export default function StatusBadge({ status }) {
  const label = String(status ?? '').replaceAll('_', ' ');
  return <span className={`status-badge ${getTone(status)}`}>{label}</span>;
}
