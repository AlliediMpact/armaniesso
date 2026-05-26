import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export function useOrderRealtime(orderId: string, pollInterval = 10000) {
  const { user } = useAuth();
  const [order, setOrder] = useState<any | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    mounted.current = true;
    async function fetchOnce() {
      setFetching(true);
      try {
        const token = user ? await user.getIdToken().catch(() => '') : '';
        const res = await fetch(`/api/account/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed loading order');
        if (!mounted.current) return;
        setOrder(data.order || null);
        setError(null);
      } catch (err: any) {
        if (!mounted.current) return;
        setError(err?.message || String(err));
      } finally {
        if (!mounted.current) return;
        setFetching(false);
      }
    }

    // Initial fetch
    fetchOnce();

    // Poll loop
    function schedule() {
      timerRef.current = setTimeout(async () => {
        await fetchOnce();
        schedule();
      }, pollInterval);
    }

    schedule();

    return () => {
      mounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId, user, pollInterval]);

  return { order, fetching, error } as const;
}

export default useOrderRealtime;
