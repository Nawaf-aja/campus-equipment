const reservingStatuses = new Set(['PENDING', 'APPROVED', 'BORROWED']);

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDate(dateString) {
  if (!dateString) return 'Not set';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

export function isDateRangeValid(startDate, endDate) {
  return Boolean(startDate && endDate && startDate <= endDate);
}

export function isOverdue(request, today = localDateString()) {
  return request.late === true || (request.status === 'BORROWED' && request.endDate < today);
}

export function getEquipmentName(equipment, equipmentId) {
  return equipment.find((item) => item.id === equipmentId)?.name ?? 'Unknown equipment';
}

export function getEligibility(equipmentItem, student, requests) {
  if (!equipmentItem) return { eligible: false, reason: 'Select equipment first.' };
  if (!student.trainingCompleted && equipmentItem.requiresTraining) {
    return { eligible: false, reason: 'Complete the required equipment training before requesting this item.' };
  }
  if (requests.some((request) =>
    request.studentId === student.id && request.status === 'INCOMPLETE_RETURN'
  )) {
    return { eligible: false, reason: 'Resolve your incomplete return before creating another request.' };
  }
  return { eligible: true, reason: 'You are eligible to request this equipment.' };
}

export function getAvailableUnits(equipmentItem, requests, startDate, endDate, excludeRequestId = null) {
  if (!equipmentItem || !isDateRangeValid(startDate, endDate)) return 0;

  const usableUnits = equipmentItem.units.filter((unit) => unit.status === 'AVAILABLE').length;
  const overlappingReservations = requests.filter((request) => {
    if (request.id === excludeRequestId || request.equipmentId !== equipmentItem.id) return false;
    if (!reservingStatuses.has(request.status)) return false;
    return request.startDate <= endDate && request.endDate >= startDate;
  }).length;

  return Math.max(0, usableUnits - overlappingReservations);
}

export function getAssignableUnits(equipmentItem, requests, request) {
  if (!equipmentItem || !request) return [];

  const overlappingReservations = requests.filter((other) =>
    other.id !== request.id &&
    other.equipmentId === equipmentItem.id &&
    reservingStatuses.has(other.status) &&
    other.startDate <= request.endDate &&
    other.endDate >= request.startDate
  );
  const assignedUnitIds = new Set(
    overlappingReservations
      .filter((other) => other.inventoryUnitId)
      .map((other) => other.inventoryUnitId),
  );
  const unassignedReservations = overlappingReservations.filter((other) => !other.inventoryUnitId).length;
  const freeUnits = equipmentItem.units.filter((unit) =>
    unit.status === 'AVAILABLE' && !assignedUnitIds.has(unit.id)
  );

  return freeUnits.length > unassignedReservations ? freeUnits : [];
}

export function createDemoRequest(requests, equipmentId, studentId, startDate, endDate) {
  const nextNumber = requests.reduce((largest, request) => {
    const number = Number(request.id.split('-').at(-1));
    return Number.isFinite(number) ? Math.max(largest, number) : largest;
  }, 0) + 1;

  return {
    id: `REQ-${String(nextNumber).padStart(3, '0')}`,
    studentId,
    equipmentId,
    startDate,
    endDate,
    status: 'PENDING',
    inventoryUnitId: null,
    pickupCode: null,
    logs: [],
  };
}

export function createPickupCode(requests) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 6 }, () =>
      characters[Math.floor(Math.random() * characters.length)]
    ).join('');
  } while (requests.some((request) => request.pickupCode === code));
  return code;
}

export function createChecklistLog(kind, requestId, checkedAccessories, notes, condition) {
  return {
    id: `${kind}-${Date.now()}`,
    kind,
    requestId,
    checkedAccessories: [...checkedAccessories],
    notes: notes.trim(),
    condition,
    createdAt: new Date().toISOString(),
  };
}
