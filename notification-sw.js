/**
 * Service Worker pour les Notifications Push
 * Gère les notifications en arrière-plan même quand l'application est fermée
 */

const CACHE_NAME = 'siteweb-notifications-v1';

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installation');

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                '/icon-72.png',
                '/icon-192.png',
                '/icon-512.png'
            ]);
        })
    );

    // Activer immédiatement
    self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker: Activation');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    // Prendre le contrôle immédiatement
    return self.clients.claim();
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    console.log('🖱️ Notification cliquée:', event.action);

    event.notification.close();

    // Gérer les actions
    if (event.action === 'close') {
        // Juste fermer la notification
        return;
    }

    // Action 'open' ou clic sur la notification
    const urlToOpen = event.notification.data?.url || '/APImessages.php';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Chercher si une fenêtre est déjà ouverte
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }

            // Sinon, ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Gestion de la fermeture des notifications
self.addEventListener('notificationclose', (event) => {
    console.log('❌ Notification fermée');
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
    console.log('📬 Message reçu:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const { title, options } = event.data;
        self.registration.showNotification(title, options);
    }
});

// Gestion des requêtes fetch (optionnel - pour le cache)
self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes API
    if (event.request.url.includes('api_check_notifications.php')) {
        return;
    }

    // Cache-first strategy pour les icônes
    if (event.request.url.includes('/icon-')) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});

// Gestion des notifications push (si on utilise un serveur push plus tard)
self.addEventListener('push', (event) => {
    console.log('📨 Push reçu');

    let notificationData = {
        title: 'siteweb.com',
        body: 'Vous avez un nouveau message',
        icon: '/icon-192.png',
        badge: '/icon-72.png'
    };

    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon || '/icon-192.png',
            badge: notificationData.badge || '/icon-72.png',
            vibrate: [100, 50, 100],
            data: {
                url: '/APImessages.php'
            }
        })
    );
});

console.log('🚀 Service Worker chargé et prêt');
