import { DateRange } from '../models/DateRange.js';

export class EquipmentAvailabilityService {
  /**
   * @param {EquipmentRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * US1 Poin 2 & 3:
   * Pengecekan ketersediaan real-time berbasis tanggal dengan filter keamanan alat.
   *
   * @param {string} startDate - YYYY-MM-DD
   * @param {string} endDate   - YYYY-MM-DD
   */
  checkAvailability(startDate, endDate) {
    const dateRange = new DateRange(startDate, endDate);
    if (!dateRange.isValid()) {
      throw new Error('Pilih rentang tanggal yang valid (tanggal mulai harus sebelum atau sama dengan tanggal selesai).');
    }

    const { equipment, requests } = this.repository.findAll();

    // US1 Poin 3: Integrasikan filter agar alat berstatus Maintenance dan In Inspection tidak muncul
    const safetyApprovedList = equipment.filter((item) => item.passesSafetyFilter());

    // Hitung ketersediaan unit untuk masing-masing model alat
    const catalog = safetyApprovedList.map((item) => {
      const availableUnits = item.calculateAvailableUnits(dateRange, requests);
      return {
        id: item.id,
        name: item.name,
        model: item.model,
        lab: item.lab,
        category: item.category,
        description: item.description,
        requiresTraining: item.requiresTraining,
        accessories: item.accessories,
        unitsCount: item.getSafetyApprovedUnits().length,
        availableUnits,
        isReady: availableUnits > 0,
      };
    });

    const readyModelsCount = catalog.filter((c) => c.isReady).length;

    return {
      dateRange: {
        startDate,
        endDate,
        formattedDisplay: dateRange.formatDisplay(),
      },
      availableModelsCount: readyModelsCount,
      totalSafetyApprovedModels: catalog.length,
      catalog,
      safetyFilterApplied: {
        active: true,
        excludedStatuses: ['MAINTENANCE', 'IN_INSPECTION', 'OUT_OF_SERVICE'],
      },
    };
  }
}
