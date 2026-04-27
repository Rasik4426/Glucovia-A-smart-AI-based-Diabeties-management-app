// @ts-nocheck
/**
 * Offline IndexedDB store for glucose and insulin logs.
 * Entries are stored with a `synced: false` flag and pushed
 * to the server once connectivity is restored.
 */

const DB_NAME = 'glucovia_offline';
const DB_VERSION = 1;
const STORES = { glucose: 'glucose_pending', insulin: 'insulin_pending' };

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      Object.values(STORES).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'localId', autoIncrement: true });
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addPending(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).add({ ...data, synced: false, savedAt: Date.now() });
    req.onsuccess = () => resolve(req.result); // returns localId
    req.onerror = () => reject(req.error);
  });
}

async function getAllPending(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result.filter(r => !r.synced));
    req.onerror = () => reject(req.error);
  });
}

async function markSynced(storeName, localId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const getReq = store.get(localId);
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.synced = true;
        store.put(record);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

async function deleteSynced(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (cursor.value.synced) cursor.delete();
        cursor.continue();
      } else {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
}

// ── Public API ─────────────────────────────────────────────────────

export async function saveGlucosePending(data) {
  return addPending(STORES.glucose, data);
}

export async function saveInsulinPending(data) {
  return addPending(STORES.insulin, data);
}

export async function getPendingGlucose() {
  return getAllPending(STORES.glucose);
}

export async function getPendingInsulin() {
  return getAllPending(STORES.insulin);
}

export async function markGlucoseSynced(localId) {
  return markSynced(STORES.glucose, localId);
}

export async function markInsulinSynced(localId) {
  return markSynced(STORES.insulin, localId);
}

export async function cleanupSynced() {
  await deleteSynced(STORES.glucose);
  await deleteSynced(STORES.insulin);
}

export async function getPendingCount() {
  const [g, i] = await Promise.all([getPendingGlucose(), getPendingInsulin()]);
  return g.length + i.length;
}