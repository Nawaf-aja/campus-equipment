function dateFromToday(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function timestampDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

const equipment = [
  {
    id: 'EQ-001',
    name: 'Digital Camera',
    category: 'Media Equipment',
    description: 'Mirrorless camera kit for campus projects and events.',
    requiresTraining: true,
    accessories: ['Camera body', 'Lens', 'Battery', 'Memory card', 'Camera bag'],
    units: [
      { id: 'UNIT-001', serialNumber: 'CAM-24-001', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-002', serialNumber: 'CAM-24-002', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-003', serialNumber: 'CAM-24-003', status: 'MAINTENANCE', condition: 'Under maintenance' },
    ],
  },
  {
    id: 'EQ-002',
    name: 'Tripod',
    category: 'Media Equipment',
    description: 'Adjustable tripod for cameras and lightweight recording equipment.',
    requiresTraining: false,
    accessories: ['Tripod', 'Quick-release plate', 'Carry bag'],
    units: [
      { id: 'UNIT-004', serialNumber: 'TRI-24-001', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-005', serialNumber: 'TRI-24-002', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-006', serialNumber: 'TRI-24-003', status: 'AVAILABLE', condition: 'Fair' },
    ],
  },
  {
    id: 'EQ-003',
    name: 'Wireless Microphone',
    category: 'Audio Equipment',
    description: 'Wireless microphone set with receiver for presentations and recording.',
    requiresTraining: true,
    accessories: ['Microphone', 'Receiver', 'USB cable', 'Carrying case'],
    units: [
      { id: 'UNIT-007', serialNumber: 'MIC-24-001', status: 'MAINTENANCE', condition: 'Under maintenance' },
      { id: 'UNIT-008', serialNumber: 'MIC-24-002', status: 'OUT_OF_SERVICE', condition: 'Out of service' },
    ],
  },
  {
    id: 'EQ-004',
    name: 'Portable Projector',
    category: 'Presentation Equipment',
    description: 'Portable HD projector for classrooms and student events.',
    requiresTraining: false,
    accessories: ['Projector', 'Power adapter', 'HDMI cable', 'Remote control'],
    units: [
      { id: 'UNIT-009', serialNumber: 'PRO-24-001', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-010', serialNumber: 'PRO-24-002', status: 'OUT_OF_SERVICE', condition: 'Out of service' },
    ],
  },
  {
    id: 'EQ-005',
    name: 'Drawing Tablet',
    category: 'Computer Equipment',
    description: 'Pen display tablet for design, illustration, and coursework.',
    requiresTraining: true,
    accessories: ['Tablet', 'Stylus', 'USB cable', 'Pen nibs'],
    units: [
      { id: 'UNIT-011', serialNumber: 'TAB-24-001', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-012', serialNumber: 'TAB-24-002', status: 'AVAILABLE', condition: 'Good' },
    ],
  },
  {
    id: 'EQ-006',
    name: 'Extension Cable',
    category: 'General Equipment',
    description: 'Heavy-duty extension cable for temporary indoor use.',
    requiresTraining: false,
    accessories: ['Extension cable'],
    units: [
      { id: 'UNIT-013', serialNumber: 'CAB-24-001', status: 'OUT_OF_SERVICE', condition: 'Out of service' },
      { id: 'UNIT-014', serialNumber: 'CAB-24-002', status: 'MAINTENANCE', condition: 'Under maintenance' },
    ],
  },
];

export function createSeedData() {
  return {
    student: {
      id: 'STU-2024-018',
      name: 'Alex Morgan',
      trainingCompleted: true,
    },
    equipment: equipment.map((item) => ({
      ...item,
      accessories: [...item.accessories],
      units: item.units.map((unit) => ({ ...unit })),
    })),
    requests: [
      {
        id: 'REQ-001',
        studentId: 'STU-2024-018',
        equipmentId: 'EQ-002',
        startDate: dateFromToday(1),
        endDate: dateFromToday(3),
        status: 'PENDING',
        inventoryUnitId: null,
        pickupCode: null,
        logs: [],
      },
      {
        id: 'REQ-002',
        studentId: 'STU-2024-018',
        equipmentId: 'EQ-004',
        startDate: dateFromToday(2),
        endDate: dateFromToday(4),
        status: 'PENDING',
        inventoryUnitId: null,
        pickupCode: null,
        logs: [],
      },
      {
        id: 'REQ-003',
        studentId: 'STU-2024-018',
        equipmentId: 'EQ-001',
        startDate: dateFromToday(-5),
        endDate: dateFromToday(-1),
        status: 'BORROWED',
        inventoryUnitId: 'UNIT-001',
        pickupCode: 'CAMP42',
        late: false,
        logs: [{
          id: 'HANDOVER-REQ-003',
          kind: 'HANDOVER',
          requestId: 'REQ-003',
          checkedAccessories: ['Camera body', 'Lens', 'Battery', 'Memory card', 'Camera bag'],
          notes: '',
          condition: 'Good',
          createdAt: timestampDaysAgo(5),
        }],
      },
    ],
  };
}
