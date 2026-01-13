# Guide de Test Rapide - Notifications Push

## 🚀 Démarrage Rapide

### 1. Démarrer Docker
```bash
docker-compose up -d
```

### 2. Accéder à l'Application
- Application: http://localhost
- phpMyAdmin: http://localhost:8080

### 3. Se Connecter
- Utilisateur: `test`
- Email: `test@siteweb.com`
- Password: (le mot de passe configuré)

### 4. Tester la Bannière d'Installation

**Sur Desktop:**
1. Ouvrir Chrome
2. Aller sur http://localhost
3. Attendre 2 secondes
4. La bannière devrait apparaître

**Pour forcer l'affichage:**
```javascript
// Dans la console (F12)
localStorage.removeItem('pwa_installed');
localStorage.removeItem('pwa_banner_dismissed');
location.reload();
```

### 5. Tester les Notifications

**Étape 1: Autoriser les notifications**
1. Cliquer sur le bouton "Alerte sonore OFF"
2. Autoriser les notifications dans le popup

**Étape 2: Ouvrir la console**
- Appuyer sur F12
- Aller dans l'onglet "Console"
- Vous devriez voir: "🚀 Démarrage du polling..."

**Étape 3: Insérer une notification de test**
1. Ouvrir phpMyAdmin (http://localhost:8080)
2. Sélectionner la base de données `siteweb_db`
3. Aller dans l'onglet SQL
4. Coller ce code:
```sql
INSERT INTO notification_message (sender_id, receiver_id, message) 
VALUES (2, 1, 'Test notification en temps réel');
```
5. Cliquer sur "Exécuter"

**Étape 4: Vérifier la notification**
- Dans les 10 secondes, vous devriez voir:
  - Console: "🔔 Nouvelle notification détectée!"
  - Une notification système
  - Un son

## 🔍 Vérifications Console

### Console Normale (Pas de Notification)
```
🎯 Initialisation du système de notifications push
✅ Service Worker enregistré: /
🚀 Démarrage du polling des notifications...
📨 Vérification des nouvelles notifications...
📭 Pas de nouvelle notification
```

### Console avec Notification
```
📨 Vérification des nouvelles notifications...
🔔 Nouvelle notification détectée! {notification: {...}}
✅ Notification Android envoyée via Service Worker
```

## 🐛 Problèmes Courants

### "Notifications bloquées"
```javascript
// Vérifier la permission
Notification.permission  // Doit être "granted"

// Si "denied", aller dans les paramètres du navigateur
// Chrome: Paramètres > Confidentialité > Paramètres du site > Notifications
```

### "Service Worker non enregistré"
1. F12 > Application > Service Workers
2. Vérifier que `notification-sw.js` est actif
3. Si absent, recharger la page

### "Polling ne démarre pas"
```javascript
// Vérifier que le script est chargé
window.pushNotifications  // Doit exister

// Démarrer manuellement
window.pushNotifications.start()

// Vérifier manuellement
window.pushNotifications.check()
```

## 📊 Commandes Utiles

### Vérifier localStorage
```javascript
// Voir le dernier ID de notification
localStorage.getItem('last_notification_id')

// Réinitialiser
localStorage.clear()
```

### Tester l'API directement
```javascript
fetch('/api_check_notifications.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({last_id: 0})
})
.then(r => r.json())
.then(console.log)
```

### Vérifier la base de données
```sql
-- Voir toutes les notifications
SELECT * FROM notification_message ORDER BY created_at DESC;

-- Compter les notifications non lues
SELECT COUNT(*) FROM notification_message WHERE is_read = FALSE;
```

## ✅ Checklist de Test

- [ ] Bannière d'installation apparaît
- [ ] Bannière disparaît après installation
- [ ] Notifications autorisées
- [ ] Console montre le polling (toutes les 10s)
- [ ] Notification apparaît après insertion SQL
- [ ] Son joué
- [ ] Clic sur notification redirige vers `/APImessages.php`
- [ ] Service Worker actif dans DevTools
- [ ] Notification fonctionne en arrière-plan

## 🎉 Test Réussi Si...

1. ✅ La bannière d'installation s'affiche correctement
2. ✅ Les notifications apparaissent dans les 10 secondes après insertion SQL
3. ✅ Le son est joué
4. ✅ Le clic redirige vers la page des messages
5. ✅ Les notifications fonctionnent même en arrière-plan
