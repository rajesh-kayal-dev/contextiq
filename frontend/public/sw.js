// ContextIQ Root Service Worker for Web PWA Installability & Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-only fetch handler to satisfy PWA criteria without caching API, Auth, WS, or Uploads
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests naturally via network
  return;
});

// --- Push Notification Handlers ---

function parseEventData(event) {
  try {
    return event.data.json();
  } catch (e) {
    console.error('Failed to parse event data - is payload valid? .text():\n', event.data.text());
    return null;
  }
}

self.addEventListener('push', function (event) {
  const payload = parseEventData(event);
  if (!payload) return;

  self.registration.showNotification(payload.title || 'ContextIQ', {
    ...payload,
    icon: '/favicon.png',
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const { onClickUrl = null } = event.notification.data || {};
  if (!onClickUrl) return;
  event.waitUntil(clients.openWindow(onClickUrl));
});
