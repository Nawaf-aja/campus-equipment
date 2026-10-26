const equipment = [
  {
    id: 'EQ-001',
    name: 'Digital Camera',
    category: 'Media Equipment',
    availableUnits: 2,
  },
  {
    id: 'EQ-002',
    name: 'Tripod',
    category: 'Media Equipment',
    availableUnits: 3,
  },
  {
    id: 'EQ-003',
    name: 'Wireless Microphone',
    category: 'Audio Equipment',
    availableUnits: 0,
  },
  {
    id: 'EQ-004',
    name: 'Portable Projector',
    category: 'Presentation Equipment',
    availableUnits: 1,
  },
  {
    id: 'EQ-005',
    name: 'Drawing Tablet',
    category: 'Computer Equipment',
    availableUnits: 2,
  },
  {
    id: 'EQ-006',
    name: 'Extension Cable',
    category: 'General Equipment',
    availableUnits: 0,
  },
];

const requests = [
  { id: 'REQ-001', equipmentId: 'EQ-002', status: 'REQUESTED' },
  { id: 'REQ-002', equipmentId: 'EQ-004', status: 'REQUESTED' },
];

function dateFromToday(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function createSeedData() {
  return {
    equipment: equipment.map((item) => ({ ...item })),
    requests: [
      ...requests.map((request) => ({ ...request })),
      {
        id: 'REQ-003',
        equipmentId: 'EQ-001',
        status: 'BORROWED',
        dueDate: dateFromToday(-1),
      },
    ],
  };
}
