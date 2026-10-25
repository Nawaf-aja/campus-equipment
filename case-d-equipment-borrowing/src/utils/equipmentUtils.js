export function hasIncompleteReturn(studentId, requests = []) {
  if (!studentId || !Array.isArray(requests)) {
    return false;
  }

  return requests.some((request) => {
    if (!request || request.studentId !== studentId) {
      return false;
    }

    const status = String(request.status ?? '').toUpperCase();
    return ['INCOMPLETE_RETURN', 'LATE', 'OVERDUE'].includes(status);
  });
}

export function evaluateBorrowEligibility(student, equipment, requests = []) {
  const reasons = [];
  const hasTrainingRequirement = Boolean(equipment?.requiresTraining);
  const incompleteReturnExists = hasIncompleteReturn(student?.id, requests);

  if (hasTrainingRequirement && student?.trainingCompleted !== true) {
    reasons.push('Mahasiswa belum menyelesaikan sertifikasi yang diwajibkan untuk alat ini.');
  }

  if (incompleteReturnExists) {
    reasons.push('Mahasiswa masih memiliki pengembalian yang belum selesai atau tertunda.');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    reasonSummary: reasons.join(' '),
    hasTrainingRequirement,
    hasIncompleteReturn: incompleteReturnExists,
    trainingCompleted: Boolean(student?.trainingCompleted),
  };
}

export function canCreateDemoRequest(equipmentItem, student = null, requests = []) {
  const availableUnits = Number(equipmentItem?.availableUnits ?? equipmentItem?.available ?? 0);
  if (!equipmentItem || availableUnits <= 0) {
    return false;
  }

  if (!student && (!Array.isArray(requests) || requests.length === 0)) {
    return true;
  }

  return evaluateBorrowEligibility(student, equipmentItem, requests).eligible;
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
