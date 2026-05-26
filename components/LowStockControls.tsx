'use client';

import { useState } from 'react';

export default function LowStockControls() {
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');

  const triggerNotify = async () => {
    try {
      setRunning(true);
      setMessage('');
      const token = localStorage.getItem('auth_token') || '';
      const res = await fetch('/api/admin/inventory/notify-low-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ threshold: 10 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setMessage(`Notifications sent for ${data.count} product(s)`);
    } catch (err: any) {
      setMessage(`Error: ${err?.message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mt-4">
      <button onClick={triggerNotify} disabled={running} className="px-4 py-2 bg-orange text-dark font-semibold rounded">
        {running ? 'Sending...' : 'Send Low-Stock Emails Now'}
      </button>
      {message && <div className="mt-2 text-sm text-gray-300">{message}</div>}
    </div>
  );
}
