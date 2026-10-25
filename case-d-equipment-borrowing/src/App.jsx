import { useEffect, useState } from 'react';
import EquipmentDetails from './components/EquipmentDetails.jsx';
import EquipmentList from './components/EquipmentList.jsx';
import RequestList from './components/RequestList.jsx';
import ResetControl from './components/ResetControl.jsx';
import { createSeedData } from './data/seed.js';
import {
  canCreateDemoRequest,
  createDemoRequest,
} from './utils/equipmentUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-d:v1';

export default function App() {
  const [data, setData] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [selectedId, setSelectedId] = useState(() => data.equipment[0]?.id ?? null);

  useEffect(() => {
    saveState(STORAGE_KEY, data);
  }, [data]);

  const selectedEquipment =
    data.equipment.find((item) => item.id === selectedId) ?? null;
  const availableCount = data.equipment.filter(
    (item) => item.availableUnits > 0,
  ).length;

  function handleCreateRequest(equipmentId) {
    setData((current) => {
      const equipmentItem = current.equipment.find((item) => item.id === equipmentId);
      if (!canCreateDemoRequest(equipmentItem)) return current;

      return {
        ...current,
        requests: [
          ...current.requests,
          createDemoRequest(current.requests, equipmentId),
        ],
      };
    });
  }

  function handleReset() {
    const freshData = resetState(STORAGE_KEY, createSeedData);
    setData(freshData);
    setSelectedId(freshData.equipment[0]?.id ?? null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">SDLC Starter App</p>
          <h1>Campus Equipment Access &amp; Borrowing</h1>
          <p className="subtitle">
            Browse campus equipment and record local demo requests.
          </p>
        </div>
        <ResetControl onReset={handleReset} />
      </header>

      <p className="browser-note">Demo data is saved in this browser only.</p>

      <section className="overview-grid" aria-label="Overview">
        <article className="summary-card">
          <p className="summary-label">Equipment records</p>
          <p className="summary-value">{data.equipment.length}</p>
        </article>
        <article className="summary-card">
          <p className="summary-label">Records with available units</p>
          <p className="summary-value">{availableCount}</p>
        </article>
      </section>

      <section className="content-grid">
        <section className="panel" aria-labelledby="equipment-list-heading">
          <h2 id="equipment-list-heading">Equipment</h2>
          <EquipmentList
            equipment={data.equipment}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
        <aside className="panel" aria-label="Selected equipment details">
          <EquipmentDetails
            equipmentItem={selectedEquipment}
            onCreateRequest={handleCreateRequest}
          />
        </aside>
      </section>

      <section className="panel secondary-section" aria-labelledby="request-list-heading">
        <div className="panel-heading">
          <h2 id="request-list-heading">Demo Requests</h2>
          <span className="meta">{data.requests.length} total</span>
        </div>
        <RequestList requests={data.requests} equipment={data.equipment} />
      </section>
    </main>
  );
}
