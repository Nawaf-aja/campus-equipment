import { Equipment } from '../models/Equipment.js';
import { createSeedData } from '../data/seed.js';
import { loadState, saveState, resetState } from '../utils/storage.js';

export class EquipmentRepository {
  /**
   * @param {string} storageKey
   */
  constructor(storageKey = 'sdlc:case-d:us5') {
    this.storageKey = storageKey;
  }

  /**
   * Mengambil semua data alat dan permohonan dari database/storage
   */
  findAll() {
    const raw = loadState(this.storageKey, createSeedData);
    const equipment = (raw.equipment || []).map((e) => new Equipment(e));
    const requests = raw.requests || [];
    const student = raw.student || { id: 'MHS-2024-018', name: 'Alex Morgan', trainingCompleted: true };
    return { equipment, requests, student, warning: raw.warning };
  }

  /**
   * Mencari alat berdasarkan ID
   * @param {string} id
   * @returns {Equipment|null}
   */
  findById(id) {
    const { equipment } = this.findAll();
    return equipment.find((item) => item.id === id) ?? null;
  }

  /**
   * Menyimpan perubahan ke database/storage
   * @param {Object} data
   */
  save(data) {
    return saveState(this.storageKey, data);
  }

  /**
   * Reset database ke kondisi awal
   */
  reset() {
    const result = resetState(this.storageKey, createSeedData);
    return {
      equipment: result.equipment.map((e) => new Equipment(e)),
      requests: result.requests,
      student: result.student,
      warning: result.warning,
    };
  }
}
