<?php
require_once 'session_start.php';
// Exprimé en secondes
 header('Refresh: 480'); 
// Redirection si non connecté
if (!isset($_SESSION['user_id'])) {
    header("Location: log.php");
    exit;
}

// MODE DÉVELOPPEMENT : Vérifier si MySQL est disponible
$db_available = false;
$user = null;
$notification = null;
$has_new_notification = false;
$notification_data = null;

try {
    require_once 'connnect/acces.php';
    $db_available = true;
    
    // Récupérer les informations de l'utilisateur
    $user_id = $_SESSION['user_id'];
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Vérifier si un message existe pour ce receiver_id pour les notifs
    $stmt = $pdo->prepare("SELECT * FROM notification_message WHERE receiver_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$user_id]);
    $notification = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($notification) {
        $has_new_notification = true;
        $notification_data = $notification;
    }
} catch (Exception $e) {
    // Base de données non disponible - utiliser des données de test
    $db_available = false;
    $user = [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username'] ?? 'Utilisateur Test',
        'email' => $_SESSION['email'] ?? 'test@siteweb.com',
    ];
    
    // Notification de test
    $has_new_notification = false; // Changez à true pour tester les notifications
    $notification_data = [
        'sender_id' => 1,
        'receiver_id' => 1,
        'message' => 'Message de test - Bienvenue !',
        'created_at' => date('Y-m-d H:i:s')
    ];
}

// Traitement de la déconnexion
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: log.php");
    exit;
}

 
?>

<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- PWA Configuration -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="siteweb">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    

    <title><?php echo $t['title']; ?></title>
 
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icon-192.png">
    <link rel="icon" type="image/png" href="/icon-192.png">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- PWA & Notification Scripts -->
    <script src="/js/pwa-install-banner.js" defer></script>
    <script src="/js/push-notifications.js" defer></script>
    
    <style>
        :root {
            --primary-color: #E31C79;
            --secondary-color: #0055A4;
            --accent-color: #FECB00;
            --light-color: #F8F9FA;
            --dark-color: #343A40;
            --success-color: #2ECC71;
            --error-color: #E74C3C;
            --info-color: #3498DB;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: var(--light-color);
            color: var(--dark-color);
            line-height: 1.6;
        }
        
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header */
        header {
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
            color: white;
            padding: 20px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        
        .logo a {
            color: white;
            text-decoration: none;
            display: flex;
            align-items: center;
        }
        
        .logo span:first-child {
            color: var(--accent-color);
        }
        
        nav ul {
            display: flex;
            list-style: none;
        }
        
        nav ul li {
            margin-left: 20px;
        }
        
        nav ul li a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            border-radius: 4px;
            transition: background-color 0.3s;
            display: flex;
            align-items: center;
        }
        
        nav ul li a:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .notification-badge {
            background-color: var(--accent-color);
            color: var(--dark-color);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: bold;
            margin-left: 5px;
        }
        
        .language-selector {
            display: flex;
            align-items: center;
        }
        
        .language-selector span {
            margin-right: 10px;
            font-size: 14px;
        }
        
        .language-selector a {
            margin-left: 5px;
            text-decoration: none;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            background-color: rgba(255, 255, 255, 0.2);
            font-size: 14px;
            transition: all 0.3s;
        }
        
        .language-selector a.active {
            background-color: var(--accent-color);
            color: var(--dark-color);
        }
        
        .language-selector a:hover:not(.active) {
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        /* Main Content */
        .main-content {
            padding: 40px 0;
        }
        
        /* Profile Stats */
        .profile-stats {
            display: flex;
            justify-content: center;
            margin-bottom: 2px;
            gap: 2px;
        }

        .stat-item {
            text-align: center;
        }

        .stat-item a {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: white;
            transition: transform 0.3s;
        }

        .stat-item a:hover {
            transform: translateY(-3px);
        }

        .stat-item i {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .stat-count {
            background-color: var(--accent-color);
            color: var(--dark-color);
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
        }
        
        .submit-button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 30px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .submit-button:hover {
            background-color: #c10a62;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        /* Footer */
        footer {
            background-color: var(--dark-color);
            color: white;
            padding: 40px 0;
            text-align: center;
            margin-top: 40px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                text-align: center;
                gap: 15px;
            }
            
            nav ul {
                margin-top: 15px;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
            }
            
            nav ul li {
                margin: 0;
            }
            
            .profile-stats {
                gap: 15px;
            }
            
            .stat-item i {
                font-size: 20px;
            }
        }
    </style>
     <style>
    
    /* Styles pour les statistiques verticales */
.stat-item-vertical {
    width: 100%;
    max-width: 300px;
}

.stat-item-vertical a {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
    padding: 12px 20px;
    border-radius: 10px;
    transition: all 0.3s ease;
    gap: 15px;
}

.stat-item-vertical a:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateX(5px);
}

.stat-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    font-size: 22px;
}

.stat-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;
}

.stat-count {
    background-color: var(--accent-color);
    color: var(--dark-color);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 14px;
    opacity: 0.9;
    font-weight: 500;
}

/* Pour les matches avec deux icônes */
.stat-item-vertical .stat-icon-container i {
    position: relative;
}

.stat-item-vertical .stat-icon-container i:first-child {
    z-index: 2;
}

.stat-item-vertical .stat-icon-container i:last-child {
    z-index: 1;
}
</style>
    

</head>
<body>
  

<div class="main-content">
<div class="container">
        <!-- Bouton active notification avec meilleur feedback -->
<div id="notificationControl" >
    <button onclick="toggleNotificationState()"
            id="notificationToggleBtn"
            style="background: #E31C79;
                   color: white;
                   border: none;
                   padding: 12px 20px;
                   border-radius: 50px;
                   font-size: 14px;
                   font-weight: bold;
                   cursor: pointer;
                   box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                   display: flex;
                   align-items: center;
                   gap: 8px;
                   transition: all 0.3s;">
        <span id="btnIcon">🔕</span>
        <span id="btnText">Notifications OFF</span>
    </button>
    <div id="notificationStatus" style="font-size: 11px; color: #666; margin-top: 5px; text-align: center;"></div>
</div>
</div>
    </div>

    <footer>
        <div class="container">
            <p><?php echo $t['footer']; ?></p>
        </div>
    </footer>
    

  <!-- Bouton "active les notification" --> 
<script>
let notificationState = 'off'; // 'off', 'asking', 'on', 'blocked', 'ios-web', 'not-supported'

// Détecter iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

// Initialiser
initNotifications();

function initNotifications() {
    // iOS dans navigateur web (pas installé comme PWA)
    if (isIOS && !isStandalone) {
        updateUI('ios-web');
        return;
    }
    
    // Vérifier si API Notification existe
    if (!("Notification" in window)) {
        // Sur iOS PWA installée, les notifications peuvent fonctionner via Service Worker
        if (isIOS && isStandalone && 'serviceWorker' in navigator) {
            notificationState = 'off';
            updateUI('off');
            return;
        }
        updateUI('not-supported');
        return;
    }
    
    switch(Notification.permission) {
        case 'granted':
            notificationState = 'on';
            break;
        case 'denied':
            notificationState = 'blocked';
            break;
        case 'default':
            notificationState = 'off';
            break;
    }
    
    updateUI(notificationState);
}

async function toggleNotificationState() {
    // iOS dans navigateur - rediriger vers installation PWA
    if (isIOS && !isStandalone) {
        showIOSInstallPrompt();
        return;
    }
    
    if (!("Notification" in window)) return;
    
    if (notificationState === 'off') {
        // Activer
        notificationState = 'asking';
        updateUI('asking');
        
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            notificationState = 'on';
            updateUI('on');
            showNotification('✅ Activé', 'Notifications activées avec succès');
        } else if (permission === 'denied') {
            notificationState = 'blocked';
            updateUI('blocked');
        } else {
            notificationState = 'off';
            updateUI('off');
        }
        
    } else if (notificationState === 'on') {
        // Désactiver - donner instructions
        notificationState = 'off';
        updateUI('off');
        showDisableInfo();
        
    } else if (notificationState === 'blocked') {
        // Débloquer
        showUnblockInfo();
    }
}

function updateUI(state) {
    const btn = document.getElementById('notificationToggleBtn');
    const icon = document.getElementById('btnIcon');
    const text = document.getElementById('btnText');
    const status = document.getElementById('notificationStatus');
    
    switch(state) {
        case 'on':
            btn.style.background = '#4CAF50';
            icon.textContent = '🔔';
            text.textContent = '<?php echo ($lang == 'fr') ? 'Alerte sonore ON' : 'Alerta de sonoro ON'; ?>';
            status.textContent = '✓ <?php echo ($lang == 'fr') ? 'Activée' : 'Habilitado'; ?>';
            status.style.color = '#4CAF50';
            btn.disabled = false;
            break;
            
        case 'off':
            btn.style.background = '#E31C79';
            icon.textContent = '🔕';
            text.textContent = '<?php echo ($lang == 'fr') ? 'Alerte sonore OFF' : 'Alerta sonoro OFF'; ?>';
            status.textContent = '<?php echo ($lang == 'fr') ? 'Cliquez pour activer' : 'Clique para ativar'; ?>';
            status.style.color = '#666';
            btn.disabled = false;
            break;
            
        case 'blocked':
            btn.style.background = '#f44336';
            icon.textContent = '🚫';
            text.textContent = 'Bloqué';
            status.textContent = 'Autorisez dans les paramètres';
            status.style.color = '#f44336';
            btn.disabled = false;
            break;
            
        case 'asking':
            btn.style.background = '#FF9800';
            icon.textContent = '⏳';
            text.textContent = 'Demande en cours...';
            status.textContent = 'Répondez à la popup';
            status.style.color = '#FF9800';
            btn.disabled = true;
            break;
            
        case 'ios-web':
            // iOS dans Safari/navigateur - inciter à installer la PWA
            btn.style.background = 'linear-gradient(135deg, #0055A4, #E31C79)';
            icon.textContent = '📱';
            text.textContent = '<?php echo ($lang == 'fr') ? 'Installer l\'app' : 'Instalar app'; ?>';
            status.textContent = '<?php echo ($lang == 'fr') ? 'Requis pour les notifications' : 'Necessário para notificações'; ?>';
            status.style.color = '#0055A4';
            btn.disabled = false;
            break;
            
        case 'not-supported':
            btn.style.background = '#9E9E9E';
            icon.textContent = '📵';
            text.textContent = '<?php echo ($lang == 'fr') ? 'Non disponible' : 'Indisponível'; ?>';
            status.textContent = '<?php echo ($lang == 'fr') ? 'Installez l\'app pour les alertes' : 'Instale o app para alertas'; ?>';
            status.style.color = '#9E9E9E';
            btn.disabled = false;
            break;
    }
}

function showIOSInstallPrompt() {
    // Déclencher l'overlay d'installation PWA si disponible
    const event = new CustomEvent('showPWAInstall');
    window.dispatchEvent(event);
    
    // Fallback si pas d'overlay
    setTimeout(() => {
        const lang = document.documentElement.lang || 'fr';
        const message = lang === 'pt'
            ? 'Para receber notificações no iOS:\n\n1. Toque em Partilhar (📤)\n2. Selecione "Adicionar ao Ecrã Inicial"\n3. Abra a app instalada\n\nAs notificações só funcionam na app instalada.'
            : 'Pour recevoir les notifications sur iOS:\n\n1. Appuyez sur Partager (📤)\n2. Sélectionnez "Sur l\'écran d\'accueil"\n3. Ouvrez l\'app installée\n\nLes notifications ne fonctionnent que dans l\'app installée.';
        alert(message);
    }, 100);
}

function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        const notif = new Notification(title, {
            body: body,
            icon: '/icon-192.png'
        });
        
        setTimeout(() => notif.close(), 3000);
    }
}

function showDisableInfo() {
    alert(`Pour désactiver complètement:
    
1. Paramètres navigateur
2. Paramètres du site
3. Notifications
4. Bloquer ce site

OU copiez-collez:
chrome://settings/content/notifications`);
}

function showUnblockInfo() {
    alert(`Notifications bloquées !

Pour débloquer:
1. Cliquez sur 🔒 (à gauche de l'URL)
2. Choisissez "Notifications"
3. Autorisez

OU:
chrome://settings/content/notifications`);
}

// Vérifier les changements
setInterval(() => {
    // Ne pas vérifier sur iOS web
    if (isIOS && !isStandalone) return;
    if (!("Notification" in window)) return;
    
    const currentPermission = Notification.permission;
    let newState = notificationState;
    
    if (currentPermission === 'granted' && notificationState !== 'on') {
        newState = 'on';
    } else if (currentPermission === 'denied' && notificationState !== 'blocked') {
        newState = 'blocked';
    } else if (currentPermission === 'default' && notificationState !== 'off') {
        newState = 'off';
    }
    
    if (newState !== notificationState) {
        notificationState = newState;
        updateUI(newState);
    }
}, 2000);
</script>
 




 <!-- Script pour vérifier la table notification_message et déclencher la notification -->
<script>
// Vérifier au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // PHP envoie cette variable
    const hasNewNotification = <?php echo $has_new_notification ? 'true' : 'false'; ?>;
    
    if (hasNewNotification) {
        console.log('📨 Notification détectée dans la table notification_message');
        
        // Attendre que la page soit complètement chargée
        setTimeout(() => {
            // Déclencher la notification exactement comme le bouton test
            sendNotificationWithLogo();
            
            // Optionnel : afficher un message dans la console
            const notificationData = <?php echo json_encode($notification_data); ?>;
            if (notificationData) {
                console.log('Contenu de la notification:', notificationData);
            }
        }, 1000);
    }
});

// Fonction exactement comme celle du bouton test
async function sendNotificationWithLogo() {
    console.log('🎨 Envoi notification avec logo...');
    
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    const logoUrls = {
        icon192: '/icon-192.png',
        icon512: '/icon-512.png',
        icon72: '/icon-72.png',
        logo: '/logo.png',
        favicon: '/favicon.ico'
    };
    
    let logoToUse = logoUrls.icon192;
    
    if (isAndroid) {
        await sendAndroidNotificationWithLogo(logoUrls);
    } else {
        await sendDesktopNotificationWithLogo(logoUrls);
    }
}

async function sendDesktopNotificationWithLogo(logoUrls) {
    if (!("Notification" in window)) {
        return;
    }
    
    if (Notification.permission === "denied") {
        return;
    }
    
    if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;
    }
    
    try {
        const notification = new Notification("💌 siteweb.com", {
            body: "Vous avez un nouveau message !",
            icon: logoUrls.icon192,
            badge: logoUrls.icon72,
            image: logoUrls.icon512,
            tag: 'msg-' + Date.now(),
            requireInteraction: false,
            silent: false
        });
        
        playSound();
        
        notification.onclick = () => {
            window.location.href = "APImessages.php";
        };
        
        console.log("✅ Notification automatique envoyée");
        
    } catch (error) {
        console.error("Erreur:", error);
        new Notification("siteweb.com", {
            body: "Vous avez un nouveau message !"
        });
    }
}

async function sendAndroidNotificationWithLogo(logoUrls) {
    if (!('serviceWorker' in navigator)) {
        return;
    }
    
    try {
        const registration = await navigator.serviceWorker.register('/notification-sw.js');
        
        if (Notification.permission === "default") {
            await Notification.requestPermission();
        }
        
        if (Notification.permission !== "granted") {
            return;
        }
        
        const options = {
            body: "Vous avez un nouveau message sur siteweb.com",
            icon: logoUrls.icon192,
            badge: logoUrls.icon72,
            image: logoUrls.icon512,
            dir: 'ltr',
            lang: 'fr-FR',
            vibrate: [100, 50, 100],
            tag: 'siteweb-notification',
            renotify: true,
            requireInteraction: false,
            silent: false,
            data: {
                url: 'https://' + window.location.hostname + '/APImessages.php',
                timestamp: Date.now()
            },
            actions: [
                {
                    action: 'open',
                    title: '📨 Ouvrir',
                    icon: logoUrls.icon72
                },
                {
                    action: 'close',
                    title: '✕ Fermer',
                    icon: logoUrls.icon72
                }
            ]
        }
        
        registration.showNotification("📱 siteweb.com", options);
        
        playSound();
        console.log("✅ Notification Android automatique envoyée");
        
    } catch (error) {
        console.error("Erreur Android:", error);
    }
}

function playSound() {
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
        audio.volume = 0.3;
        audio.play();
    } catch (e) {
        // Ignorer si pas de son
    }
}
</script>
 
 
 


</body>
</html>