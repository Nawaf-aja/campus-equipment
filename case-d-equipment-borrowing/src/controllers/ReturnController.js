export class ReturnController {
  /**
   * @param {ReturnProcessingService} returnService
   */
  constructor(returnService) {
    this.service = returnService;
  }

  /**
   * Endpoint handler: PATCH /api/v1/transactions/:id/return
   * @param {Object} payload
   */
  async handleReturn(payload) {
    try {
      // Simulasi latency endpoint API (100ms)
      await new Promise((resolve) => setTimeout(resolve, 100));
      const result = this.service.processReturn(payload);
      return {
        status: 200,
        success: true,
        message: result.message,
        data: result,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: error.message || 'Gagal memproses pengembalian.',
      };
    }
  }

  /**
   * Endpoint handler: POST /api/v1/transactions/:id/resolve
   * @param {Object} payload
   */
  async handleResolveIncomplete(payload) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const result = this.service.resolveIncompleteReturn(payload);
      return {
        status: 200,
        success: true,
        message: result.message,
        data: result,
      };
    } catch (error) {
      return {
        status: 400,
        success: false,
        error: error.message || 'Gagal menyelesaikan incomplete return.',
      };
    }
  }
}
