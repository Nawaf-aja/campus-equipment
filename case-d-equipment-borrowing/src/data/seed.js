function dateFromToday(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const seedEquipment = [
  {
    id: 'EQ-001',
    name: 'Digital Oscilloscope 100MHz',
    model: 'Rigol DS1054Z',
    lab: 'Elektronika Dasar',
    category: 'Instrumen Laboratorium',
    description: '4-channel digital oscilloscope kit 100MHz dengan sampling rate 1GSa/s untuk analisis sinyal dan praktikum rangkaian.',
    requiresTraining: true,
    accessories: ['Oscilloscope Unit', 'Passive Probe (4x)', 'Power Cable', 'USB Cable', 'Manual Book'],
    units: [
      { id: 'UNIT-001', serialNumber: 'OSC-24-001', status: 'BORROWED', condition: 'Good' },
      { id: 'UNIT-002', serialNumber: 'OSC-24-002', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-003', serialNumber: 'OSC-24-003', status: 'MAINTENANCE', condition: 'Under maintenance' },
    ],
  },
  {
    id: 'EQ-002',
    name: 'Function Generator 25MHz',
    model: 'Rigol DG1022Z',
    lab: 'Instrumentasi & Pengukuran',
    category: 'Instrumen Laboratorium',
    description: 'Dual-channel arbitrary waveform generator 25MHz untuk pembangkitan sinyal analog dan digital presisi.',
    requiresTraining: false,
    accessories: ['Generator Unit', 'BNC to Alligator Cable (2x)', 'Power Cable'],
    units: [
      { id: 'UNIT-004', serialNumber: 'GEN-24-001', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-005', serialNumber: 'GEN-24-002', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-006', serialNumber: 'GEN-24-003', status: 'AVAILABLE', condition: 'Fair' },
    ],
  },
  {
    id: 'EQ-003',
    name: 'Digital Multimeter 6.5 Digit',
    model: 'Keysight 34461A',
    lab: 'Elektronika Dasar',
    category: 'Instrumen Laboratorium',
    description: 'Benchtop True RMS multimeter presisi 6.5 digit untuk pengukuran tegangan, arus, resistansi, dan kapasitansi.',
    requiresTraining: true,
    accessories: ['Multimeter Unit', 'Test Leads Set', 'Power Cable'],
    units: [
      { id: 'UNIT-007', serialNumber: 'DMM-24-001', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-008', serialNumber: 'DMM-24-002', status: 'AVAILABLE', condition: 'Good' },
    ],
  },
  {
    id: 'EQ-004',
    name: 'Portable Projector HD',
    model: 'Epson EB-X51',
    lab: 'Multimedia & Presentasi',
    category: 'Peralatan Presentasi',
    description: 'Proyektor HD portabel untuk keperluan seminar, presentasi kelompok, dan demo praktikum.',
    requiresTraining: false,
    accessories: ['Projector Unit', 'Power Adapter', 'HDMI Cable', 'Remote Control', 'Carry Bag'],
    units: [
      { id: 'UNIT-009', serialNumber: 'PRO-24-001', status: 'AVAILABLE', condition: 'Good' },
      { id: 'UNIT-010', serialNumber: 'PRO-24-002', status: 'IN_INSPECTION', condition: 'In Inspection' },
    ],
  },
  {
    id: 'EQ-005',
    name: 'Spectrum Analyzer 1.5GHz',
    model: 'Rigol DSA815-TG',
    lab: 'Telekomunikasi & RF',
    category: 'Instrumen Frekuensi Radio',
    description: 'Spectrum analyzer 9kHz-1.5GHz dengan Tracking Generator untuk uji frekuensi dan filter RF.',
    requiresTraining: true,
    accessories: ['Analyzer Unit', 'N-to-BNC Adapter', 'Antenna Kit', 'Power Cable'],
    units: [
      { id: 'UNIT-011', serialNumber: 'SPA-24-001', status: 'MAINTENANCE', condition: 'Under maintenance' },
      { id: 'UNIT-012', serialNumber: 'SPA-24-002', status: 'IN_INSPECTION', condition: 'In Inspection' },
    ],
  },
  {
    id: 'EQ-006',
    name: 'DC Power Supply 30V/5A',
    model: 'GW Instek GPS-3303',
    lab: 'Sistem Tenaga Listrik',
    category: 'Catu Daya',
    description: 'Catu daya DC regulasi 3 saluran terisolasi dengan proteksi overload.',
    requiresTraining: false,
    accessories: ['Power Supply Unit', 'Banana-to-Alligator Leads (2x)', 'Power Cable'],
    units: [
      { id: 'UNIT-013', serialNumber: 'PWR-24-001', status: 'MAINTENANCE', condition: 'Under maintenance' },
      { id: 'UNIT-014', serialNumber: 'PWR-24-002', status: 'IN_INSPECTION', condition: 'In Inspection' },
    ],
  },
];

export function createSeedData() {
  return {
    student: {
      id: 'MHS-2024-018',
      name: 'Alex Morgan',
      trainingCompleted: true,
    },
    equipment: seedEquipment.map((item) => ({
      ...item,
      accessories: [...item.accessories],
      units: item.units.map((unit) => ({ ...unit })),
    })),
    requests: [
      {
        id: 'REQ-001',
        studentId: 'MHS-2024-018',
        equipmentId: 'EQ-002',
        startDate: dateFromToday(1),
        endDate: dateFromToday(3),
        status: 'PENDING',
      },
      {
        id: 'REQ-002',
        studentId: 'MHS-2024-018',
        equipmentId: 'EQ-004',
        startDate: dateFromToday(2),
        endDate: dateFromToday(4),
        status: 'PENDING',
      },
      {
        id: 'REQ-003',
        studentId: 'MHS-2024-018',
        equipmentId: 'EQ-001',
        inventoryUnitId: 'UNIT-001',
        startDate: dateFromToday(-3),
        endDate: dateFromToday(-1),
        status: 'BORROWED',
      },
    ],
  };
}
