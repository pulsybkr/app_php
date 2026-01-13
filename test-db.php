<?php
/**
 * Page de test de connexion à la base de données
 * Accès : http://localhost:8082/test-db.php
 */

echo "<h1>🔍 Test de connexion à la base de données</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .success { color: green; background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .error { color: red; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .info { color: blue; background: #d1ecf1; padding: 10px; border-radius: 5px; margin: 10px 0; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; background: white; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background: #007bff; color: white; }
</style>";

echo "<div class='info'><strong>Environnement détecté :</strong> ";
$is_docker = getenv('DOCKER_ENV') !== false || file_exists('/.dockerenv');
echo $is_docker ? "🐳 Docker" : "💻 Local";
echo "</div>";

// Test de connexion
try {
    require_once 'connnect/acces.php';
    
    echo "<div class='success'>✅ <strong>Connexion réussie à la base de données !</strong></div>";
    
    // Informations sur la base de données
    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    echo "<div class='info'><strong>Version MySQL :</strong> $version</div>";
    
    // Liste des tables
    echo "<h2>📋 Tables dans la base de données</h2>";
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    if (count($tables) > 0) {
        echo "<table>";
        echo "<tr><th>Nom de la table</th><th>Nombre de lignes</th></tr>";
        
        foreach ($tables as $table) {
            $count = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
            echo "<tr><td>$table</td><td>$count</td></tr>";
        }
        
        echo "</table>";
    } else {
        echo "<div class='error'>⚠️ Aucune table trouvée dans la base de données</div>";
    }
    
    // Test des utilisateurs
    echo "<h2>👥 Utilisateurs de test</h2>";
    $users = $pdo->query("SELECT id, username, email, created_at FROM users LIMIT 5")->fetchAll();
    
    if (count($users) > 0) {
        echo "<table>";
        echo "<tr><th>ID</th><th>Username</th><th>Email</th><th>Créé le</th></tr>";
        
        foreach ($users as $user) {
            echo "<tr>";
            echo "<td>{$user['id']}</td>";
            echo "<td>{$user['username']}</td>";
            echo "<td>{$user['email']}</td>";
            echo "<td>{$user['created_at']}</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<div class='error'>⚠️ Aucun utilisateur trouvé</div>";
    }
    
    // Liens utiles
    echo "<h2>🔗 Liens utiles</h2>";
    echo "<ul>";
    echo "<li><a href='log.php'>Page de connexion</a></li>";
    echo "<li><a href='log.php?dev=1'>Connexion rapide (mode dev)</a></li>";
    echo "<li><a href='http://localhost:8081' target='_blank'>phpMyAdmin</a></li>";
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<strong>❌ Erreur de connexion :</strong><br>";
    echo $e->getMessage();
    echo "</div>";
    
    echo "<div class='info'>";
    echo "<strong>💡 Solutions possibles :</strong><br>";
    echo "<ol>";
    echo "<li>Vérifiez que Docker est lancé : <code>docker-compose ps</code></li>";
    echo "<li>Vérifiez que MySQL est démarré : <code>docker-compose logs mysql</code></li>";
    echo "<li>Redémarrez les services : <code>docker-compose restart</code></li>";
    echo "<li>Vérifiez le fichier <code>connnect/acces.php</code></li>";
    echo "</ol>";
    echo "</div>";
}
?>
