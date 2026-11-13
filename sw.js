// Service Worker Oficial da Sorveteria Lolla
const CACHE_NAME = 'lolla-pwa-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Manipulação de Notificações Push para Entregadores e Dono
self.addEventListener('push', (event) => {
  let data = {
    title: '🍦 Sorveteria Lolla',
    body: 'Você tem uma nova atualização importante!',
    url: '/entregador'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/assets/marca/logo_lolla.png',
    badge: '/assets/marca/logo_lolla.png',
    vibrate: [200, 100, 200, 100, 400],
    data: {
      url: data.url || '/entregador',
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'abrir', title: 'Ver Detalhes' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/entregador';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
