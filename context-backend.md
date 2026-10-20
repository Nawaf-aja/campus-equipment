# Back-End Project Context & Guidelines

## 1. Overview & System Domain
* **Project Name**: Campus Equipment Access & Borrowing API
* **Role**: Menyediakan RESTful API / GraphQL service untuk menangani otentikasi, verifikasi kelayakan mahasiswa, alur transaksi peminjaman, serta status inventaris fisik.

## 2. Tech Stack
* **Runtime / Language**: Node.js (Express / NestJS) atau Python (FastAPI / Django)
* **Database**: PostgreSQL / MySQL (Relational DB wajib untuk data inventaris dan transaksi)
* **ORM**: Prisma / TypeORM / SQLAlchemy
* **Authentication**: JWT / OAuth2 (Integrasi akun kampus)

## 3. Core Business Rules & Constraints
* **Eligibility Guard**: Sistem harus menolak pengajuan jika mahasiswa belum melewati pelatihan (*training status*) atau memiliki tanggungan *incomplete return*.
* **Unit Level Traceability**: Setiap item yang dipinjam harus terikat pada `inventory_unit_id` spesifik, bukan sekadar kategori produk.
* **Status Lock**: Peralatan berstatus `MAINTENANCE` atau `BORROWED` pada rentang tanggal tertentu tidak boleh dipilih dalam transaksi baru.
* **Pickup Code Generator**: Menghasilkan kode unik alfanumerik saat pengajuan disetujui untuk dicocokkan staf saat penyerahan fisik.

## 4. Data Models / Schemas Outline
* **Users**: `id`, `name`, `role` (STUDENT / STAFF), `eligibility_status`, `training_completed` (boolean)
* **Equipment Categories**: `id`, `name`, `description`, `requires_training` (boolean)
* **Inventory Units**: `id`, `category_id`, `serial_number`, `physical_condition`, `status` (AVAILABLE / MAINTENANCE / OUT_OF_SERVICE)
* **Borrow Transactions**: `id`, `student_id`, `unit_id`, `pickup_code`, `start_date`, `end_date`, `status` (PENDING / APPROVED / BORROWED / RETURNED / INCOMPLETE_RETURN / LATE)
* **Checklist Logs**: `id`, `transaction_type` (HANDOVER / RETURN), `accessories_checked` (json/array), `notes`

## 5. Architecture & Folder Structure
src/
├── controllers/ / routes/  # HTTP request handlers & Route definitions
├── services/               # Business logic, validation rules, transactional logic
├── models/ / entities/     # Database schemas / ORM models
├── middlewares/            # Auth guard, eligibility check middleware, error handling
├── utils/                  # Helper Functions (Pickup code generator, date diff)
└── config/                 # Environment variables & DB connection setup

## 6. API & Coding Conventions
* **REST Standards**:
  * `GET /api/v1/equipment/availability` (Cek ketersediaan real-time)
  * `POST /api/v1/requests` (Buat pengajuan baru)
  * `POST /api/v1/handover/verify-code` (Validasi pickup code oleh staf)
  * `PATCH /api/v1/transactions/:id/return` (Proses return & checklist)
* **Error Handling**: Gunakan format respons error terstruktur:
  ```json
  {
    "success": false,
    "error": "INELIGIBLE_USER",
    "message": "Mahasiswa belum menyelesaikan training wajib untuk alat ini."
  }

  ---

<FollowUp>
  <Elicitation description="Sesuaikan dokumen konteks di atas dengan tech stack spesifik yang Anda gunakan (misal: Python FastAPI, Next.js App Router, dll)." value="Sesuaikan Tech Stack spesifik"/>
  <Elicitation description="Buat file `system-prompt.md` atau `instructions.md` untuk mengkonfigurasi AI Coding Assistant (seperti Cursor / Windsurf)." value="Buatkan prompt untuk AI Coding Assistant"/>
</FollowUp>