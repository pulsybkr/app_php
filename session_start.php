<?php
// Démarrage de la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configuration de la langue par défaut
if (!isset($_SESSION['lang'])) {
    $_SESSION['lang'] = 'fr'; // Français par défaut
}

$lang = $_SESSION['lang'];

// Traductions
$translations = [
    'fr' => [
        'title' => 'siteweb.com - Rencontre',
        'footer' => '© 2026 siteweb.com - Tous droits réservés',
        'messages' => 'Messages',
        'search' => 'Recherche',
        'profile' => 'Profil',
        'logout' => 'Déconnexion',
        'notifications' => 'Notifications',
    ],
    'pt' => [
        'title' => 'siteweb.com - Encontros',
        'footer' => '© 2026 siteweb.com - Todos os direitos reservados',
        'messages' => 'Mensagens',
        'search' => 'Pesquisa',
        'profile' => 'Perfil',
        'logout' => 'Sair',
        'notifications' => 'Notificações',
    ]
];

$t = $translations[$lang] ?? $translations['fr'];
