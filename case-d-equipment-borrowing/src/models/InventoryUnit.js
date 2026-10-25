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
}
