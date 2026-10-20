export function canCreateDemoRequest(equipmentItem) {
  return Number(equipmentItem?.availableUnits) > 0;
}

export function getEquipmentName(equipment, equipmentId) {
  return equipment.find((item) => item.id === equipmentId)?.name ?? 'Unknown equipment';
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
