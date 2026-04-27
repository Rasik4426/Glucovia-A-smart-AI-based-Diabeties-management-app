/**
 * Push Notification helpers for Glucovia.
 * Uses the browser's Notification API + Service Worker for background delivery.
 */

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.register('/sw.js');
  return reg;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

/**
 * Show a local notification immediately (works even without push server).
 * Falls back gracefully if SW or Notification API isn't available.
 */
export async function showLocalNotification(title, body, options = {}) {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') return;

  // Try Service Worker notification first (works in background)
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: options.requireInteraction || false,
      vibrate: options.vibrate || [200, 100, 200],
      tag: options.tag || 'glucovia',
      data: { url: options.url || '/' },
    });
    return;
  }

  // Fallback to basic Notification
  new Notification(title, { body, icon: '/favicon.ico' });
}

export function vibrateDevice(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern || [200, 100, 200, 100, 200]);
  }
}

/** Critical SOS vibrate pattern */
export function vibrateSOSPattern() {
  navigator.vibrate?.([200, 100, 200, 100, 200, 300, 600, 300, 600, 300, 200, 100, 200, 100, 200]);
}