// @ts-nocheck
/**
 * Background sync manager.
 * Call startSyncListener() once (e.g. in App.jsx) to watch for
 * connectivity restoration and flush pending IndexedDB entries.
 */

import { base44 } from '@/api/base44Client';
import {
  getPendingGlucose,
  getPendingInsulin,
  markGlucoseSynced,
  markInsulinSynced,
  cleanupSynced,
  getPendingCount,
} from './offlineDB';

let syncListeners = [];

export function onSyncStatusChange(fn) {
  syncListeners.push(fn);
  return () => { syncListeners = syncListeners.filter(l => l !== fn); };
}

function notifyListeners(status) {
  syncListeners.forEach(fn => fn(status));
}

export async function syncNow() {
  const pending = await getPendingCount();
  if (pending === 0) return { synced: 0, failed: 0 };

  notifyListeners({ syncing: true, pending });

  let synced = 0;
  let failed = 0;

  // ── Glucose ────────────────────────────────────────────────────
  const glucoseEntries = await getPendingGlucose();
  for (const entry of glucoseEntries) {
    const { localId, synced: _s, savedAt, ...payload } = entry;
    const result = await base44.entities.GlucoseLog.create(payload);
    if (result?.id) {
      await markGlucoseSynced(localId);
      synced++;
    } else {
      failed++;
    }
  }

  // ── Insulin ────────────────────────────────────────────────────
  const insulinEntries = await getPendingInsulin();
  for (const entry of insulinEntries) {
    const { localId, synced: _s, savedAt, ...payload } = entry;
    const result = await base44.entities.InsulinLog.create(payload);
    if (result?.id) {
      await markInsulinSynced(localId);
      synced++;
    } else {
      failed++;
    }
  }

  await cleanupSynced();
  notifyListeners({ syncing: false, synced, failed });
  return { synced, failed };
}

let _started = false;

export function startSyncListener() {
  if (_started) return;
  _started = true;

  // Try immediately in case we're already online with stale data
  if (navigator.onLine) {
    getPendingCount().then(n => { if (n > 0) syncNow(); });
  }

  window.addEventListener('online', () => {
    syncNow();
  });
}