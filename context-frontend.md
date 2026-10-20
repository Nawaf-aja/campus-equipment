# Front-End Project Context & Guidelines

## 1. Overview & Business Domain
* **Project Name**: Campus Equipment Access & Borrowing System
* **Target Users**: Student Borrower & Lab/Equipment Staff
* **Core Purpose**: Memungkinkan mahasiswa melihat ketersediaan alat, mengajukan peminjaman, dan membantu staf memverifikasi kelayakan serta mencatat serah terima barang fisik/aksesoris.

## 2. Tech Stack & Tools
* **Framework**: React.js / Next.js
* **Styling**: Tailwind CSS (Desain bersih, responsif, komponen berbasis kartu/modern)
* **State Management**: React Context / Redux / Zustand
* **Icons & UI Components**: Lucide React / Shadcn UI

## 3. Core Functional Requirements (From SDLC P10)
* **US1 (View Availability)**: Katalog dan ketersediaan alat real-time berdasarkan tanggal tanpa tanya staf.
* **US2 (Eligibility Check)**: Indikator/label kelayakan otomatis sebelum pengajuan disetujui.
* **US3 (Record Physical ID)**: Input/pilihan nomor seri / ID inventaris fisik spesifik saat penyerahan.
* **US4 (Handover & Return Checklist)**: Checklist digital untuk pemeriksaan kondisi fisik dan kelengkapan aksesoris.
* **US5 (Incomplete Return)**: Status transaksi "Incomplete Return" jika ada aksesoris kurang.
* **US6 (Late Return Indicator)**: Peringatan visual untuk keterlambatan pengembalian.
* **US7 (Pickup Code Validation)**: Tampilan dan input kode verifikasi unik saat serah-terima fisik.

## 4. Architecture & Directory Structure
src/
├── components/          # Reusable UI components (Buttons, Inputs, Cards)
│   ├── EquipmentCard.jsx
│   ├── StatusBadge.jsx
│   └── ChecklistForm.jsx
├── views/ / pages/      # Views / Pages (Dashboard Staf, Katalog Mahasiswa)
├── hooks/               # Custom React Hooks
├── services/            # API Client / Axios / Fetch wrappers
├── utils/               # Helper functions (Formatting tanggal, validator)
└── types/ / data/       # Mock data & Type definitions

## 5. Coding Standards & Conventions
* **Component Style**: Functional Components dengan Arrow Functions.
* **Naming Conventions**: 
  * Component files: `PascalCase.jsx` (misal: `EquipmentCard.jsx`)
  * Helpers/Utils: `camelCase.js` (misal: `equipmentUtils.js`)
* **UI/UX Principles**: 
  * Tampilkan indikator loading dan penanganan error secara eksplisit pada setiap panggilan API.
  * Gunakan warna status badge yang konsisten (Hijau = Available, Merah = Incomplete/Late, Kuning = Maintenance/Pending).
* **Validation**: Lakukan validasi form di sisi client sebelum mengirim data ke API.