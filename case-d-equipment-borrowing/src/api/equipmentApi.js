import { EquipmentRepository } from '../repositories/EquipmentRepository.js';
import { EquipmentAvailabilityService } from '../services/EquipmentAvailabilityService.js';
import { EquipmentController } from '../controllers/EquipmentController.js';
import { ReturnProcessingService } from '../services/ReturnProcessingService.js';
import { ReturnController } from '../controllers/ReturnController.js';

// Dependency Injection: Repository -> Services -> Controllers
const equipmentRepository = new EquipmentRepository();
const availabilityService = new EquipmentAvailabilityService(equipmentRepository);
const equipmentController = new EquipmentController(availabilityService);

const returnProcessingService = new ReturnProcessingService(equipmentRepository);
const returnController = new ReturnController(returnProcessingService);

/**
 * Client-facing API SDK
 * Memfasilitasi komunikasi komponen UI ke Controller tanpa spaghetti code
 */
export const equipmentApi = {
  /**
   * Endpoint GET /api/v1/equipment/availability (US1)
   * @param {string} startDate
   * @param {string} endDate
   */
  async checkAvailability(startDate, endDate) {
    return await equipmentController.getAvailability({ startDate, endDate });
  },

  /**
   * Endpoint PATCH /api/v1/transactions/:id/return (US5)
   * @param {Object} payload
   */
  async processReturn(payload) {
    return await returnController.handleReturn(payload);
  },

  /**
   * Endpoint POST /api/v1/transactions/:id/resolve (US5)
   * @param {Object} payload
   */
  async resolveIncompleteReturn(payload) {
    return await returnController.handleResolveIncomplete(payload);
  },

  /**
   * Mengambil data mentah repository
   */
  getRepository() {
    return equipmentRepository;
  },
};
