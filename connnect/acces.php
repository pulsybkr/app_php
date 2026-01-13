<?php
// Configuration de la base de données
// Ce fichier fonctionne avec Docker Compose ET en mode local

// Détection de l'environnement
$is_docker = getenv('DOCKER_ENV') !== false || file_exists('/.dockerenv');

if ($is_docker) {
    // Configuration Docker
    $db_host = 'mysql';  // Nom du service dans docker-compose.yml
    $db_name = 'siteweb_db';
    $db_user = 'siteweb_user';
    $db_pass = 'siteweb_pass_123';
} else {
    // Configuration locale (XAMPP/WAMP/MAMP)
    $db_host = 'localhost';
    $db_name = 'siteweb_db';
    $db_user = 'root';
    $db_pass = '';  // Mot de passe vide par défaut pour XAMPP
}

try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    // En mode développement, afficher l'erreur
    die("Erreur de connexion à la base de données : " . $e->getMessage() . 
        "<br><br><strong>Vérifiez :</strong><br>" .
        "1. MySQL est démarré<br>" .
        "2. La base de données '$db_name' existe<br>" .
        "3. Les identifiants sont corrects<br>" .
        "4. Le fichier connnect/acces.php est bien configuré<br>" .
        "5. Environnement détecté : " . ($is_docker ? "Docker" : "Local"));
}
