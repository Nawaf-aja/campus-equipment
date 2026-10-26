export class InventoryUnit {
  /**
   * @param {Object} data
   * @param {string} data.id
   * @param {string} data.serialNumber
   * @param {'AVAILABLE'|'BORROWED'|'MAINTENANCE'|'IN_INSPECTION'|'OUT_OF_SERVICE'} data.status
   * @param {string} data.condition
   */
  constructor({ id, serialNumber, status = 'AVAILABLE', condition = 'Good' }) {
    this.id = id;
    this.serialNumber = serialNumber;
    this.status = status;
    this.condition = condition;
  }

  isAvailable() {
    return this.status === 'AVAILABLE';
  }

  isBorrowed() {
    return this.status === 'BORROWED';
  }

  isUnderMaintenance() {
    return this.status === 'MAINTENANCE';
  }

  isInInspection() {
    return this.status === 'IN_INSPECTION' || this.status === 'OUT_OF_SERVICE';
  }

  /**
   * US1 Poin 3: Filter Keamanan
   * Unit tidak boleh berstatus Maintenance atau In Inspection.
   */
  passesSafetyFilter() {
    return !this.isUnderMaintenance() && !this.isInInspection();
  }

  /**
   * US5: Menandai unit masuk ke status MAINTENANCE karena aksesoris kurang / incomplete return
   * @param {string} condition
   */
  markAsMaintenance(condition = 'Aksesoris kurang (Incomplete Return)') {
    this.status = 'MAINTENANCE';
    this.condition = condition;
  }

  /**
   * US5: Memulihkan unit kembali ke status AVAILABLE setelah kelengkapan selesai
   * @param {string} condition
   */
  markAsAvailable(condition = 'Good (Lengkap)') {
    this.status = 'AVAILABLE';
    this.condition = condition;
  }

  markAsBorrowed() {
    this.status = 'BORROWED';
  }
}
