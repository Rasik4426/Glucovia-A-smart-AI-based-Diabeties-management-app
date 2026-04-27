// Glucovia Service Worker — handles push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '🩸 Glucovia Alert';
  const options = {
    body: data.body || 'A health alert requires your attention.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.tag || 'glucovia-alert',
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate || [200, 100, 200],
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
