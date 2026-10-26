export function canCreateDemoRequest(equipmentItem) {
  return Number(equipmentItem?.availableUnits) > 0;
}

export function getEquipmentName(equipment, equipmentId) {
  return equipment.find((item) => item.id === equipmentId)?.name ?? 'Unknown equipment';
}

export function getOverdueDays(request, today = new Date()) {
  if (String(request?.status ?? '').toUpperCase() !== 'BORROWED') {
    return 0;
  }

  const dueDate = request.dueDate ?? request.endDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate ?? '')) {
    return 0;
  }

  const [year, month, day] = dueDate.split('-').map(Number);
  const dueTimestamp = Date.UTC(year, month - 1, day);
  const due = new Date(dueTimestamp);
  if (
    due.getUTCFullYear() !== year
    || due.getUTCMonth() !== month - 1
    || due.getUTCDate() !== day
  ) {
    return 0;
  }

  const todayTimestamp = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return Math.max(0, Math.floor((todayTimestamp - dueTimestamp) / 86_400_000));
}

export function createDemoRequest(requests, equipmentId) {
  const nextNumber =
    requests.reduce((largest, request) => {
      const number = Number(request.id.split('-').at(-1));
      return Number.isFinite(number) ? Math.max(largest, number) : largest;
    }, 0) + 1;

  return {
    id: `REQ-${String(nextNumber).padStart(3, '0')}`,
    equipmentId,
    status: 'REQUESTED',
  };
}
