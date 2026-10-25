export default function StatusBadge({ status = 'AVAILABLE' }) {
  const normalized = status.toUpperCase();
  let tone = 'neutral';

  if (['AVAILABLE', 'READY', 'RETURNED'].includes(normalized)) tone = 'success';
  if (['PENDING', 'REQUESTED', 'APPROVED', 'BORROWED'].includes(normalized)) tone = 'info';
  if (['MAINTENANCE', 'PREPARING'].includes(normalized)) tone = 'warning';
  if (['INCOMPLETE_RETURN', 'LATE', 'OUT_OF_SERVICE', 'IN_INSPECTION'].includes(normalized)) tone = 'danger';

  return <span className={`status-badge ${tone}`}>{normalized.replaceAll('_', ' ')}</span>;
}
