import { EquipmentRepository } from '../repositories/EquipmentRepository.js';
import { EquipmentAvailabilityService } from '../services/EquipmentAvailabilityService.js';
import { EquipmentController } from '../controllers/EquipmentController.js';

// Dependency Injection: Repository -> Service -> Controller
const equipmentRepository = new EquipmentRepository();
const availabilityService = new EquipmentAvailabilityService(equipmentRepository);
const equipmentController = new EquipmentController(availabilityService);

/**
 * Client-facing API SDK
 * Memfasilitasi komunikasi komponen UI ke Controller tanpa spaghetti code
 */
export const equipmentApi = {
  /**
   * Endpoint GET /api/v1/equipment/availability
   * @param {string} startDate
   * @param {string} endDate
   */
  async checkAvailability(startDate, endDate) {
    return await equipmentController.getAvailability({ startDate, endDate });
  },

  /**
   * Mengambil data mentah repository
   */
  getRepository() {
    return equipmentRepository;
  },
};
