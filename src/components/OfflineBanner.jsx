/**
 * Shows a persistent "Offline" pill and a "Syncing…" / "Synced!" toast.
 */
import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { onSyncStatusChange, syncNow } from '@/lib/syncManager';
import { getPendingCount } from '@/lib/offlineDB';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState(null); // null | 'syncing' | 'done'
  const [pending, setPending] = useState(0);

  // Track online/offline
  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down); };
  }, []);

  // Poll pending count while offline
  useEffect(() => {
    const refresh = async () => setPending(await getPendingCount());
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  // Listen for sync events
  useEffect(() => {
    const unsub = onSyncStatusChange((status) => {
      if (status.syncing) {
        setSyncState('syncing');
      } else if (typeof status.synced === 'number') {
        setSyncState('done');
        setPending(0);
        setTimeout(() => setSyncState(null), 3000);
      }
    });
    return unsub;
  }, []);

  const handleManualSync = () => {
    if (isOnline) syncNow();
  };

  return (
    <AnimatePresence>
      {(!isOnline || syncState || pending > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-sm
            bg-slate-800 text-white"
        >
          {syncState === 'syncing' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0 text-teal-300" />
              <span>Syncing offline entries…</span>
            </>
          ) : syncState === 'done' ? (
            <>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-400" />
              <span>All entries synced! ✅</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span className="flex-1">
                You're offline.{pending > 0 ? ` ${pending} entr${pending === 1 ? 'y' : 'ies'} saved locally.` : ' Entries will be saved locally.'}
              </span>
              {pending > 0 && isOnline && (
                <button
                  onClick={handleManualSync}
                  className="text-teal-300 underline text-xs whitespace-nowrap"
                >
                  Sync now
                </button>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}