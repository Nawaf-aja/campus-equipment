export class ReturnProcessingService {
  /**
   * @param {EquipmentRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * US5: Memproses pengembalian alat oleh staf
   * Jika ada aksesoris kurang, tandai transaksi sebagai INCOMPLETE_RETURN
   * dan kunci unit fisik terkait ke MAINTENANCE.
   *
   * @param {Object} params
   * @param {string} params.requestId
   * @param {string[]} params.returnedAccessories
   * @param {string} [params.condition='Good']
   * @param {string} [params.notes='']
   * @returns {Object}
   */
  processReturn({ requestId, returnedAccessories = [], condition = 'Good', notes = '' }) {
    const data = this.repository.findAll();
    const request = data.requests.find((r) => r.id === requestId);

    if (!request) {
      throw new Error(`Permohonan ${requestId} tidak ditemukan.`);
    }

    if (request.status !== 'BORROWED') {
      throw new Error(`Permohonan ${requestId} tidak sedang dalam status dipinjam (Status saat ini: ${request.status}).`);
    }

    const equipmentItem = data.equipment.find((e) => e.id === request.equipmentId);
    if (!equipmentItem) {
      throw new Error(`Data alat untuk permohonan ${requestId} tidak ditemukan.`);
    }

    // US5: Deteksi otomatis komponen kurang
    const missingAccessories = equipmentItem.getMissingAccessories(returnedAccessories);
    const isIncomplete = missingAccessories.length > 0;
    const finalStatus = isIncomplete ? 'INCOMPLETE_RETURN' : 'RETURNED';

    // US5: Penguncian status unit fisik
    // Jika incomplete return, kunci unit fisik ke status MAINTENANCE
    const unitNewStatus = isIncomplete
      ? 'MAINTENANCE'
      : condition === 'Damaged' ? 'OUT_OF_SERVICE' : 'AVAILABLE';

    const unitNewCondition = isIncomplete
      ? `Aksesoris kurang: ${missingAccessories.join(', ')}`
      : condition;

    const returnLog = {
      id: `LOG-RET-${Date.now()}`,
      timestamp: new Date().toISOString(),
      returnedAccessories,
      missingAccessories,
      condition,
      notes,
      processedBy: 'Staff Lab',
    };

    // Update data permohonan
    const updatedRequests = data.requests.map((r) => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: finalStatus,
        returnLog,
        missingAccessories,
      };
    });

    // Update data unit inventaris
    const updatedEquipment = data.equipment.map((e) => {
      if (e.id !== request.equipmentId) return e;
      return {
        ...e,
        units: e.units.map((u) => {
          if (u.id !== request.inventoryUnitId) return u;
          return {
            ...u,
            status: unitNewStatus,
            condition: unitNewCondition,
          };
        }),
      };
    });

    this.repository.save({
      ...data,
      requests: updatedRequests,
      equipment: updatedEquipment,
    });

    return {
      success: true,
      requestId,
      status: finalStatus,
      isIncomplete,
      missingAccessories,
      unitId: request.inventoryUnitId,
      unitStatus: unitNewStatus,
      message: isIncomplete
        ? `Transaksi ${requestId} ditandai sebagai INCOMPLETE_RETURN karena aksesoris kurang (${missingAccessories.join(', ')}). Unit fisik dikunci ke MAINTENANCE dan hak peminjaman mahasiswa ditangguhkan.`
        : `Pengembalian ${requestId} berhasil dicatat lengkap. Unit ${request.inventoryUnitId} kembali berstatus AVAILABLE.`,
    };
  }

  /**
   * US5: Staf menyelesaikan transaksi incomplete return setelah mahasiswa mempertanggungjawabkan
   * barang yang hilang (mengembalikan / mengganti komponen).
   *
   * @param {Object} params
   * @param {string} params.requestId
   * @param {string} [params.staffNotes='']
   * @returns {Object}
   */
  resolveIncompleteReturn({ requestId, staffNotes = '' }) {
    const data = this.repository.findAll();
    const request = data.requests.find((r) => r.id === requestId);

    if (!request) {
      throw new Error(`Permohonan ${requestId} tidak ditemukan.`);
    }

    if (request.status !== 'INCOMPLETE_RETURN') {
      throw new Error(`Permohonan ${requestId} tidak berstatus INCOMPLETE_RETURN.`);
    }

    // Ubah status permohonan menjadi RETURNED
    const updatedRequests = data.requests.map((r) => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        status: 'RETURNED',
        resolutionLog: {
          timestamp: new Date().toISOString(),
          staffNotes: staffNotes || 'Aksesoris telah dilengkapi / dipertanggungjawabkan mahasiswa.',
          resolved: true,
        },
        missingAccessories: [],
      };
    });

    // Pulihkan status unit fisik kembali ke AVAILABLE
    const updatedEquipment = data.equipment.map((e) => {
      if (e.id !== request.equipmentId) return e;
      return {
        ...e,
        units: e.units.map((u) => {
          if (u.id !== request.inventoryUnitId) return u;
          return {
            ...u,
            status: 'AVAILABLE',
            condition: 'Good (Kelengkapan telah dipulihkan)',
          };
        }),
      };
    });

    this.repository.save({
      ...data,
      requests: updatedRequests,
      equipment: updatedEquipment,
    });

    return {
      success: true,
      requestId,
      status: 'RETURNED',
      message: `Tanggungan incomplete return untuk ${requestId} telah diselesaikan. Hak peminjaman mahasiswa telah dipulihkan.`,
    };
  }
}
