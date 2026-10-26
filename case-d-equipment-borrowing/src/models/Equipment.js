import { InventoryUnit } from './InventoryUnit.js';
import { evaluateBorrowEligibility } from '../utils/equipmentUtils.js';

export class Equipment {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.name
   * @param {string} [data.model]
   * @param {string} [data.lab]
   * @param {string} data.category
   * @param {string} [data.description]
   * @param {boolean} [data.requiresTraining]
   * @param {string[]} [data.accessories]
   * @param {Object[]} [data.units]
   */
  constructor({
    id,
    name,
    model = '',
    lab = '',
    category = 'Umum',
    description = '',
    requiresTraining = false,
    accessories = [],
    units = [],
  }) {
    this.id = id;
    this.name = name;
    this.model = model;
    this.lab = lab;
    this.category = category;
    this.description = description;
    this.requiresTraining = requiresTraining;
    this.accessories = accessories;
    this.units = units.map((u) => (u instanceof InventoryUnit ? u : new InventoryUnit(u)));
  }

  /**
   * Mengambil unit yang lolos uji filter keamanan (bukan Maintenance / In Inspection).
   */
  getSafetyApprovedUnits() {
    return this.units.filter((unit) => unit.passesSafetyFilter());
  }

  /**
   * US1 Poin 3: Integrasikan filter agar alat berstatus Maintenance dan In Inspection tidak muncul.
   * Model alat hanya lolos jika memiliki minimal 1 unit fisik yang lolos uji.
   */
  passesSafetyFilter() {
    return this.getSafetyApprovedUnits().length > 0;
  }

  /**
   * Menghitung ketersediaan unit fisik real-time pada rentang tanggal tertentu.
   * @param {DateRange} dateRange
   * @param {Array} activeRequests
   * @returns {number}
   */
  calculateAvailableUnits(dateRange, activeRequests = []) {
    if (!this.passesSafetyFilter() || !dateRange.isValid()) {
      return 0;
    }

    const operableAvailableUnits = this.getSafetyApprovedUnits().filter((u) => u.isAvailable()).length;

    // Hitung permohonan yang bertabrakan pada rentang tanggal
    const overlappingCount = activeRequests.filter((req) => {
      if (req.equipmentId !== this.id) return false;
      if (!['PENDING', 'APPROVED', 'BORROWED', 'REQUESTED'].includes(req.status)) return false;
      if (req.inventoryUnitId) return false;
      return dateRange.isOverlapping(req.startDate, req.endDate);
    }).length;

    return Math.max(0, operableAvailableUnits - overlappingCount);
  }

  isEligibleForBorrow(student, requests = []) {
    return evaluateBorrowEligibility(student, this, requests).eligible;
  }

  /**
   * US5: Mengetahui aksesoris/komponen apa saja yang kurang saat pengembalian
   * @param {string[]} returnedAccessories - Komponen yang dicentang oleh staf
   * @returns {string[]} Daftar komponen yang belum dikembalikan
   */
  getMissingAccessories(returnedAccessories = []) {
    return this.accessories.filter((accessory) => !returnedAccessories.includes(accessory));
  }

  /**
   * US5: Memeriksa apakah seluruh komponen dikembalikan lengkap
   * @param {string[]} returnedAccessories
   * @returns {boolean}
   */
  isReturnComplete(returnedAccessories = []) {
    return this.getMissingAccessories(returnedAccessories).length === 0;
  }
}
