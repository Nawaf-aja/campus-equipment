import { useState } from 'react';

export default function ResetControl({ onReset }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isConfirming) {
    return (
      <button
        className="secondary-button"
        type="button"
        onClick={() => setIsConfirming(true)}
      >
        Reset Demo Data
      </button>
    );
  }

  function confirmReset() {
    onReset();
    setIsConfirming(false);
  }

  return (
    <div className="reset-control" role="group" aria-label="Confirm reset demo data">
      <span>Reset demo data?</span>
      <button className="secondary-button" type="button" onClick={() => setIsConfirming(false)}>
        Cancel
      </button>
      <button className="primary-button" type="button" onClick={confirmReset}>
        Confirm Reset
      </button>
    </div>
  );
}
