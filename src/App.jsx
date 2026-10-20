import { useEffect, useState } from 'react';
import EquipmentDetails from './components/EquipmentDetails.jsx';
import EquipmentList from './components/EquipmentList.jsx';
import RequestList from './components/RequestList.jsx';
import ResetControl from './components/ResetControl.jsx';
import StaffWorkspace from './components/StaffWorkspace.jsx';
import { createSeedData } from './data/seed.js';
import {
  createChecklistLog,
  createDemoRequest,
  createPickupCode,
  getAssignableUnits,
  getAvailableUnits,
  getEligibility,
  isDateRangeValid,
  isOverdue,
} from './utils/equipmentUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-d:v1';

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function withUpdatedRequest(data, requestId, updateRequest, updateEquipment) {
  return {
    ...data,
    requests: data.requests.map((request) =>
      request.id === requestId ? updateRequest(request) : request
    ),
    ...(updateEquipment ? { equipment: updateEquipment(data.equipment) } : {}),
  };
}

export default function App() {
  const [initialLoad] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [data, setData] = useState(initialLoad.state);
  const [selectedId, setSelectedId] = useState(() => initialLoad.state.equipment[0]?.id ?? null);
  const [view, setView] = useState('student');
  const [dateRange, setDateRange] = useState({
    startDate: localDate(1),
    endDate: localDate(3),
  });
  const [notice, setNotice] = useState('');
  const [storageWarning, setStorageWarning] = useState(initialLoad.warning);

  useEffect(() => {
    setStorageWarning(saveState(STORAGE_KEY, data));
  }, [data]);

  const selectedEquipment =
    data.equipment.find((item) => item.id === selectedId) ?? null;
  const availableCount = data.equipment.filter((item) =>
    getAvailableUnits(item, data.requests, dateRange.startDate, dateRange.endDate) > 0
  ).length;
  const studentRequests = data.requests.filter((request) => request.studentId === data.student.id);
  const pendingCount = data.requests.filter((request) => request.status === 'PENDING').length;
  const incompleteCount = data.requests.filter((request) =>
    request.status === 'INCOMPLETE_RETURN'
  ).length;

  function handleDateChange(field, value) {
    setDateRange((current) => {
      const updated = { ...current, [field]: value };
      if (field === 'startDate' && updated.endDate < value) updated.endDate = value;
      return updated;
    });
    setNotice('');
  }

  function handleCreateRequest(equipmentId) {
    const equipmentItem = data.equipment.find((item) => item.id === equipmentId);
    const eligibility = getEligibility(equipmentItem, data.student, data.requests);
    if (!eligibility.eligible) {
      setNotice(eligibility.reason);
      return;
    }
    if (!isDateRangeValid(dateRange.startDate, dateRange.endDate) || dateRange.startDate < localDate()) {
      setNotice('Choose a valid borrowing date range starting today or later.');
      return;
    }
    if (getAvailableUnits(equipmentItem, data.requests, dateRange.startDate, dateRange.endDate) < 1) {
      setNotice('No physical units are available for the selected dates.');
      return;
    }

    setData((current) => ({
      ...current,
      requests: [
        ...current.requests,
        createDemoRequest(
          current.requests,
          equipmentId,
          current.student.id,
          dateRange.startDate,
          dateRange.endDate,
        ),
      ],
    }));
    setNotice('Request submitted. Equipment staff will review it and generate a pickup code.');
  }

  function handleApprove(requestId) {
    const request = data.requests.find((item) => item.id === requestId);
    const equipmentItem = data.equipment.find((item) => item.id === request?.equipmentId);
    if (!request || request.status !== 'PENDING') return;
    const eligibility = getEligibility(equipmentItem, data.student, data.requests);
    if (!eligibility.eligible) {
      setNotice(`Cannot approve ${requestId}: ${eligibility.reason}`);
      return;
    }
    if (getAvailableUnits(equipmentItem, data.requests, request.startDate, request.endDate, request.id) < 1) {
      setNotice(`Cannot approve ${requestId}: no units are available for those dates.`);
      return;
    }

    setData((current) => withUpdatedRequest(current, requestId, (item) => ({
      ...item,
      status: 'APPROVED',
      pickupCode: createPickupCode(current.requests),
    })));
    setNotice(`${requestId} approved. A unique pickup code has been generated.`);
  }

  function handleHandover(requestId, details) {
    const request = data.requests.find((item) => item.id === requestId);
    const equipmentItem = data.equipment.find((item) => item.id === request?.equipmentId);
    if (!request || request.status !== 'APPROVED') return 'This request is no longer awaiting handover.';
    if (details.code !== request.pickupCode) return 'Pickup code does not match this request.';
    const assignableUnits = getAssignableUnits(equipmentItem, data.requests, request);
    if (!assignableUnits.some((unit) => unit.id === details.unitId)) {
      return 'That physical unit is not available for the requested date range. Refresh and select another unit.';
    }

    const log = createChecklistLog(
      'HANDOVER',
      requestId,
      details.checkedAccessories,
      details.notes,
      details.condition,
    );
    setData((current) => withUpdatedRequest(current, requestId, (item) => ({
      ...item,
      status: 'BORROWED',
      inventoryUnitId: details.unitId,
      logs: [...item.logs, log],
    })));
    setNotice(`${requestId} handed over. Physical inventory ID and checklist were recorded.`);
    return '';
  }

  function handleReturn(requestId, details) {
    const request = data.requests.find((item) => item.id === requestId);
    const equipmentItem = data.equipment.find((item) => item.id === request?.equipmentId);
    if (!request || request.status !== 'BORROWED') return 'This request is no longer awaiting return.';

    const overdue = isOverdue(request);
    const missingAccessories = equipmentItem.accessories.some(
      (accessory) => !details.checkedAccessories.includes(accessory),
    );
    const status = missingAccessories ? 'INCOMPLETE_RETURN' : overdue ? 'LATE' : 'RETURNED';
    const log = createChecklistLog(
      'RETURN',
      requestId,
      details.checkedAccessories,
      details.notes,
      details.condition,
    );
    setData((current) => withUpdatedRequest(
      current,
      requestId,
      (item) => ({
        ...item,
        status,
        late: overdue,
        logs: [...item.logs, log],
      }),
      (items) => items.map((item) => item.id !== request.equipmentId
        ? item
        : {
          ...item,
          units: item.units.map((unit) => unit.id !== request.inventoryUnitId
            ? unit
            : {
              ...unit,
              status: missingAccessories
                ? 'MAINTENANCE'
                : details.condition === 'Damaged' ? 'OUT_OF_SERVICE' : 'AVAILABLE',
              condition: details.condition,
            }),
        }),
    ));
    setNotice(missingAccessories
      ? `${requestId} recorded as Incomplete Return. Eligibility remains blocked until staff resolves it.`
      : overdue
        ? `${requestId} returned and recorded as Late.`
        : `${requestId} returned successfully.`);
    return '';
  }

  function handleResolveIncomplete(requestId) {
    const request = data.requests.find((item) => item.id === requestId);
    if (!request || request.status !== 'INCOMPLETE_RETURN') return;
    const latestReturn = [...request.logs].reverse().find((log) => log.kind === 'RETURN');
    setData((current) => withUpdatedRequest(
      current,
      requestId,
      (item) => ({ ...item, status: item.late ? 'LATE' : 'RETURNED' }),
      (items) => items.map((item) => item.id !== request.equipmentId
        ? item
        : {
          ...item,
          units: item.units.map((unit) => unit.id !== request.inventoryUnitId
            ? unit
            : {
              ...unit,
              status: latestReturn?.condition === 'Damaged' ? 'OUT_OF_SERVICE' : 'AVAILABLE',
            }),
        }),
    ));
    setNotice(`${requestId} return issue resolved. Student eligibility has been restored.`);
  }

  function handleReset() {
    const result = resetState(STORAGE_KEY, createSeedData);
    setData(result.state);
    setSelectedId(result.state.equipment[0]?.id ?? null);
    setStorageWarning(result.warning);
    setView('student');
    setNotice('Demo data reset to the original sample records.');
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Campus equipment services</p>
          <h1>Equipment Access &amp; Borrowing</h1>
          <p className="subtitle">
            Check availability, request equipment, and manage physical handover and returns.
          </p>
        </div>
        <div className="header-actions">
          <div className="role-switch" role="tablist" aria-label="Demo workspace">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'student'}
              className={view === 'student' ? 'active' : ''}
              onClick={() => { setView('student'); setNotice(''); }}
            >
              Student
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'staff'}
              className={view === 'staff' ? 'active' : ''}
              onClick={() => { setView('staff'); setNotice(''); }}
            >
              Staff
              {pendingCount > 0 && <span className="tab-count">{pendingCount}</span>}
            </button>
          </div>
          <ResetControl onReset={handleReset} />
        </div>
      </header>

      <p className="browser-note">
        Local demo · Signed in as {data.student.name} ({data.student.id}) · Changes stay in this browser
      </p>
      {storageWarning && <p className="notice error-notice" role="alert">{storageWarning}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}

      <section className="overview-grid" aria-label="Overview">
        <article className="summary-card">
          <p className="summary-label">Equipment categories</p>
          <p className="summary-value">{data.equipment.length}</p>
          <span className="summary-footnote">Catalog items</span>
        </article>
        <article className="summary-card">
          <p className="summary-label">Available for selected dates</p>
          <p className="summary-value">{availableCount}</p>
          <span className="summary-footnote">Out of {data.equipment.length} catalog items</span>
        </article>
        <article className="summary-card">
          <p className="summary-label">{view === 'staff' ? 'Pending approvals' : 'My active requests'}</p>
          <p className="summary-value">{view === 'staff' ? pendingCount : studentRequests.filter((request) =>
            ['PENDING', 'APPROVED', 'BORROWED', 'INCOMPLETE_RETURN'].includes(request.status)
          ).length}</p>
          <span className="summary-footnote">{incompleteCount} incomplete return{incompleteCount === 1 ? '' : 's'}</span>
        </article>
      </section>

      {view === 'student' ? (
        <>
          <section className="content-grid">
            <section className="panel" aria-labelledby="equipment-list-heading">
              <div className="panel-heading">
                <div>
                  <h2 id="equipment-list-heading">Equipment catalog</h2>
                  <p className="muted section-subtitle">Select an item to check its status and request dates.</p>
                </div>
              </div>
              <EquipmentList
                equipment={data.equipment}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </section>
            <aside className="panel" aria-label="Selected equipment details">
              <EquipmentDetails
                equipmentItem={selectedEquipment}
                student={data.student}
                requests={data.requests}
                availableUnits={getAvailableUnits(
                  selectedEquipment,
                  data.requests,
                  dateRange.startDate,
                  dateRange.endDate,
                )}
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateChange={handleDateChange}
                onCreateRequest={handleCreateRequest}
              />
            </aside>
          </section>

          <section className="panel secondary-section" aria-labelledby="request-list-heading">
            <div className="panel-heading">
              <div>
                <h2 id="request-list-heading">My requests</h2>
                <p className="muted section-subtitle">Pickup codes are shown after staff approval.</p>
              </div>
              <span className="meta">{studentRequests.length} total</span>
            </div>
            <RequestList requests={studentRequests} equipment={data.equipment} />
          </section>
        </>
      ) : (
        <section className="panel staff-panel" aria-labelledby="staff-heading">
          <div className="panel-heading">
            <div>
              <h2 id="staff-heading">Staff transaction desk</h2>
              <p className="muted section-subtitle">
                Approve requests, verify pickup codes, record unit IDs, and complete return checklists.
              </p>
            </div>
            <span className="meta">{data.requests.filter((request) =>
              ['PENDING', 'APPROVED', 'BORROWED', 'INCOMPLETE_RETURN'].includes(request.status)
            ).length} open</span>
          </div>
          <StaffWorkspace
            requests={data.requests}
            equipment={data.equipment}
            onApprove={handleApprove}
            onHandover={handleHandover}
            onReturn={handleReturn}
            onResolveIncomplete={handleResolveIncomplete}
          />
        </section>
      )}

      <footer className="app-footer">
        This prototype uses browser storage only. It does not connect to campus accounts or a shared inventory database.
      </footer>
    </main>
  );
}
