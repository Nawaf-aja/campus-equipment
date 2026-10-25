export class EquipmentController {
  /**
   * @param {EquipmentAvailabilityService} service
   */
  constructor(service) {
    this.service = service;
  }

  /**
   * US1 Poin 2: Endpoint API untuk cek database ketersediaan alat
   * Simulates: GET /api/v1/equipment/availability?startDate=...&endDate=...
   *
   * @param {Object} query
   * @param {string} query.startDate
   * @param {string} query.endDate
   * @returns {Promise<Object>}
   */
  async getAvailability(query) {
    try {
      const { startDate, endDate } = query || {};
      
      // Simulasi delay I/O database network (100ms)
      await new Promise((resolve) => setTimeout(resolve, 100));

      const availabilityData = this.service.checkAvailability(startDate, endDate);

      return {
        status: 200,
        success: true,
        message: 'Data ketersediaan alat berhasil diambil dari database.',
        data: availabilityData,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: error.message || 'Terjadi kesalahan saat memeriksa ketersediaan.',
        data: null,
      };
    }
  }
}
