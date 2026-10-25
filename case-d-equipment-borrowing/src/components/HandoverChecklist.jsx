import { useState } from 'react';

const PHYSICAL_CHECKS = [
  { id: 'body', label: 'Bodi/perangkat utuh, tanpa kerusakan fisik' },
  { id: 'function', label: 'Fungsi utama perangkat berjalan normal' },
  { id: 'cleanliness', label: 'Perangkat bersih dan siap digunakan' },
];

export default function HandoverChecklist({ request, accessories, onSave }) {
  const savedChecklist = request.handoverChecklist;
  const [condition, setCondition] = useState(savedChecklist?.condition ?? {});
  const [accessoryStatus, setAccessoryStatus] = useState(savedChecklist?.accessories ?? {});
  const [notes, setNotes] = useState(savedChecklist?.notes ?? '');
  const [error, setError] = useState('');

  const checklistComplete = PHYSICAL_CHECKS.every((check) => (
    ['GOOD', 'NEEDS_ATTENTION'].includes(condition[check.id])
  )) && accessories.every((accessory) => (
    ['PRESENT', 'MISSING'].includes(accessoryStatus[accessory])
  ));

  function handleSubmit(event) {
    event.preventDefault();
    if (!checklistComplete) {
      setError('Lengkapi semua pemeriksaan kondisi fisik dan aksesoris.');
      return;
    }

    onSave(request.id, {
      condition,
      accessories: accessoryStatus,
      notes: notes.trim(),
      completedAt: new Date().toISOString(),
    });
    setError('');
  }

  if (savedChecklist) {
    return (
      <details className="handover-checklist-summary">
        <summary>Checklist selesai · {new Date(savedChecklist.completedAt).toLocaleString('id-ID')}</summary>
        <div className="checklist-summary-content">
          <strong>Kondisi fisik</strong>
          {PHYSICAL_CHECKS.map((check) => (
            <p key={check.id}>
              {check.label}: {savedChecklist.condition[check.id] === 'GOOD' ? 'Baik' : 'Perlu perhatian'}
            </p>
          ))}
          <strong>Kelengkapan aksesoris</strong>
          {accessories.map((accessory) => (
            <p key={accessory}>
              {accessory}: {savedChecklist.accessories[accessory] === 'PRESENT' ? 'Ada' : 'Tidak ada'}
            </p>
          ))}
          {savedChecklist.notes && <p><strong>Catatan:</strong> {savedChecklist.notes}</p>}
        </div>
      </details>
    );
  }

  return (
    <form className="handover-checklist-form" onSubmit={handleSubmit}>
      <fieldset className="checklist-group">
        <legend>Kondisi fisik</legend>
        {PHYSICAL_CHECKS.map((check) => (
          <div className="checklist-item" key={check.id}>
            <span>{check.label}</span>
            <div className="checklist-choices">
              {[
                { value: 'GOOD', label: 'Baik' },
                { value: 'NEEDS_ATTENTION', label: 'Perlu perhatian' },
              ].map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={`${request.id}-${check.id}`}
                    value={option.value}
                    checked={condition[check.id] === option.value}
                    onChange={() => setCondition((current) => ({
                      ...current,
                      [check.id]: option.value,
                    }))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <fieldset className="checklist-group">
        <legend>Kelengkapan aksesoris</legend>
        {accessories.map((accessory, index) => (
          <div className="checklist-item" key={`${accessory}-${index}`}>
            <span>{accessory}</span>
            <div className="checklist-choices">
              {[
                { value: 'PRESENT', label: 'Ada' },
                { value: 'MISSING', label: 'Tidak ada' },
              ].map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name={`${request.id}-accessory-${index}`}
                    value={option.value}
                    checked={accessoryStatus[accessory] === option.value}
                    onChange={() => setAccessoryStatus((current) => ({
                      ...current,
                      [accessory]: option.value,
                    }))}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <label className="checklist-notes-label" htmlFor={`${request.id}-checklist-notes`}>
        Catatan kondisi (opsional)
      </label>
      <textarea
        id={`${request.id}-checklist-notes`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows="2"
        placeholder="Catat kerusakan atau informasi tambahan."
      />
      {error && <p className="checklist-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={!checklistComplete}>
        Simpan Checklist
      </button>
    </form>
  );
}
