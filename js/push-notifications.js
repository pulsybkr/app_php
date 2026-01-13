/**
 * Push Notification System
 * Système de polling de la base de données pour détecter les nouveaux messages
 * et déclencher des notifications push même en arrière-plan
 */

(function () {
    'use strict';

    const POLL_INTERVAL = 10000; // 10 secondes
    let pollingTimer = null;
    let lastNotificationId = null;
    let isPolling = false;

    // Récupérer l'ID de la dernière notification vérifiée
    function getLastNotificationId() {
        const stored = localStorage.getItem('last_notification_id');
        return stored ? parseInt(stored) : 0;
    }

    // Sauvegarder l'ID de la dernière notification
    function saveLastNotificationId(id) {
        localStorage.setItem('last_notification_id', id.toString());
        lastNotificationId = id;
    }

    // Vérifier les nouvelles notifications via AJAX
    async function checkForNewNotifications() {
        if (isPolling) {
            console.log('⏳ Polling déjà en cours, skip...');
            return;
        }

        isPolling = true;

        try {
            const response = await fetch('/api_check_notifications.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    last_id: lastNotificationId || getLastNotificationId()
                }),
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.has_new) {
                console.log('🔔 Nouvelle notification détectée!', data);

                // Sauvegarder le nouvel ID
                if (data.notification && data.notification.id) {
                    saveLastNotificationId(data.notification.id);
                }

                // Déclencher la notification
                await triggerNotification(data.notification);
            } else {
                console.log('📭 Pas de nouvelle notification');
            }

        } catch (error) {
            console.error('❌ Erreur lors de la vérification des notifications:', error);
        } finally {
            isPolling = false;
        }
    }

    // Déclencher une notification push
    async function triggerNotification(notificationData) {
        // Vérifier si les notifications sont supportées
        if (!('Notification' in window)) {
            console.warn('⚠️ Notifications non supportées par ce navigateur');
            return;
        }

        // Vérifier la permission
        if (Notification.permission === 'denied') {
            console.warn('🚫 Notifications bloquées par l\'utilisateur');
            return;
        }

        // Demander la permission si nécessaire
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('⚠️ Permission de notification refusée');
                return;
            }
        }

        // Déterminer si on est sur Android
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (isAndroid && 'serviceWorker' in navigator) {
            // Utiliser le service worker pour Android
            await sendNotificationViaServiceWorker(notificationData);
        } else {
            // Notification directe pour desktop/iOS
            await sendDirectNotification(notificationData);
        }
    }

    // Envoyer une notification via le service worker (Android)
    async function sendNotificationViaServiceWorker(notificationData) {
        try {
            const registration = await navigator.serviceWorker.ready;

            const options = {
                body: notificationData.message || 'Vous avez un nouveau message sur siteweb.com',
                icon: '/icon-192.png',
                badge: '/icon-72.png',
                image: '/icon-512.png',
                vibrate: [100, 50, 100],
                tag: 'siteweb-notification-' + notificationData.id,
                renotify: true,
                requireInteraction: false,
                silent: false,
                data: {
                    url: '/APImessages.php',
                    notification_id: notificationData.id,
                    sender_id: notificationData.sender_id,
                    timestamp: Date.now()
                },
                actions: [
                    {
                        action: 'open',
                        title: '📨 Ouvrir',
                        icon: '/icon-72.png'
                    },
                    {
                        action: 'close',
                        title: '✕ Fermer',
                        icon: '/icon-72.png'
                    }
                ]
            };

            await registration.showNotification('📱 siteweb.com', options);

            // Jouer le son
            playNotificationSound();

            console.log('✅ Notification Android envoyée via Service Worker');

        } catch (error) {
            console.error('❌ Erreur Service Worker:', error);
            // Fallback vers notification directe
            await sendDirectNotification(notificationData);
        }
    }

    // Envoyer une notification directe (Desktop/iOS)
    async function sendDirectNotification(notificationData) {
        try {
            const notification = new Notification('💌 siteweb.com', {
                body: notificationData.message || 'Vous avez un nouveau message !',
                icon: '/icon-192.png',
                badge: '/icon-72.png',
                tag: 'siteweb-notification-' + notificationData.id,
                requireInteraction: false,
                silent: false,
                data: {
                    url: '/APImessages.php'
                }
            });

            // Jouer le son
            playNotificationSound();

            // Gérer le clic sur la notification
            notification.onclick = function (event) {
                event.preventDefault();
                window.location.href = '/APImessages.php';
                notification.close();
            };

            // Auto-fermer après 5 secondes
            setTimeout(() => notification.close(), 5000);

            console.log('✅ Notification directe envoyée');

        } catch (error) {
            console.error('❌ Erreur notification directe:', error);
        }
    }

    // Jouer le son de notification
    function playNotificationSound() {
        try {
            // Son simple en base64 (beep court)
            const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
            audio.volume = 0.3;
            audio.play().catch(e => {
                console.log('🔇 Son non joué (interaction utilisateur requise)');
            });
        } catch (e) {
            console.log('🔇 Erreur lecture son:', e);
        }
    }

    // Démarrer le polling
    function startPolling() {
        console.log('🚀 Démarrage du polling des notifications...');

        // Initialiser l'ID de la dernière notification
        lastNotificationId = getLastNotificationId();

        // Première vérification immédiate
        checkForNewNotifications();

        // Puis vérification périodique
        pollingTimer = setInterval(() => {
            console.log('📨 Vérification des nouvelles notifications...');
            checkForNewNotifications();
        }, POLL_INTERVAL);
    }

    // Arrêter le polling
    function stopPolling() {
        if (pollingTimer) {
            clearInterval(pollingTimer);
            pollingTimer = null;
            console.log('⏸️ Polling arrêté');
        }
    }

    // Enregistrer le service worker
    async function registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('⚠️ Service Worker non supporté');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/notification-sw.js', {
                scope: '/'
            });

            console.log('✅ Service Worker enregistré:', registration.scope);

            // Attendre que le SW soit actif
            if (registration.installing) {
                console.log('⏳ Service Worker en cours d\'installation...');
            } else if (registration.waiting) {
                console.log('⏳ Service Worker en attente...');
            } else if (registration.active) {
                console.log('✅ Service Worker actif');
            }

        } catch (error) {
            console.error('❌ Erreur enregistrement Service Worker:', error);
        }
    }

    // Gérer la visibilité de la page
    function handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ Page cachée - polling continue en arrière-plan');
        } else {
            console.log('👁️ Page visible - vérification immédiate');
            checkForNewNotifications();
        }
    }

    // Initialisation
    async function init() {
        console.log('🎯 Initialisation du système de notifications push');

        // Enregistrer le service worker
        await registerServiceWorker();

        // Démarrer le polling
        startPolling();

        // Écouter les changements de visibilité
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Arrêter le polling quand la page est déchargée
        window.addEventListener('beforeunload', stopPolling);

        // Exposer les fonctions globalement pour debug
        window.pushNotifications = {
            start: startPolling,
            stop: stopPolling,
            check: checkForNewNotifications,
            getLastId: getLastNotificationId
        };
    }

    // Démarrer quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
