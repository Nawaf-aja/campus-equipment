# Campus Equipment Access & Borrowing

## Purpose

This React application demonstrates the campus equipment borrowing workflow for students and equipment staff. It includes an equipment catalog, date-based availability, eligibility checks, pickup-code verification, physical-unit assignment, and handover and return checklists.

## Requirements

- A current Node.js LTS release
- npm

## Quick Start

```bash
npm install
npm run dev
```

Open the local address shown by Vite. Run `npm run build` to create a production build in `dist/`.

## What Works

- Browse six seeded equipment categories and check physical-unit availability for selected dates.
- Check training and incomplete-return eligibility before a request can be submitted.
- Submit borrowing requests and review them in the student workspace.
- Switch to the staff workspace to approve requests and generate unique pickup codes.
- Verify pickup codes, select a specific physical inventory unit, and record handover checklists.
- Record return checklists, flag missing accessories as `INCOMPLETE_RETURN`, and highlight overdue returns.
- Resolve incomplete returns from the staff workspace.
- Reset all browser demo changes to the original seed data.

## Data & Reset

Static starter records come from `src/data/seed.js`. Changes are saved as JSON under `sdlc:case-d:v1` in this browser's `localStorage`. They are not shared with another browser or device and are not written back to Git. Storage failures are shown in the interface. Use **Reset Demo Data** to restore a fresh copy of the seed data.

## Project Structure

- `src/App.jsx` owns the local demo state and connects student and staff workflows.
- `src/components/` contains the catalog, request list, staff transaction desk, and reusable status controls.
- `src/data/seed.js` contains sample records with dates relative to the current day.
- `src/utils/equipmentUtils.js` contains date availability, eligibility, inventory, and pickup-code helpers.
- `src/utils/storage.js` loads, saves, and resets browser demo data and reports storage errors.
- `src/styles.css` contains the responsive page styles.

## Collaboration Notes

Work from your group's own Sprint Backlog. Use a branch, make focused commits, open a pull request, and ask a peer to review it before merge. Keep the code change and review evidence connected to the backlog item selected by your group.

## Limitations

This is a client-side demonstration only. Staff/student roles are a UI switch, not authentication or authorization. It has no backend, campus identity integration, shared database, or cross-device synchronization; availability and pickup-code validation are local demo logic and are not safe for operational use. Browser data is for local practice and should not be used for sensitive information.
