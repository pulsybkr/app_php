<?php
/**
 * API Check Notifications
 * Endpoint AJAX pour vérifier les nouvelles notifications dans la table notification_message
 * Retourne les notifications pour le receiver_id correspondant au user_id connecté
 */

// Démarrer la session
session_start();

// Headers pour JSON
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'User not authenticated',
        'has_new' => false
    ]);
    exit;
}

$user_id = $_SESSION['user_id'];

// Récupérer le dernier ID vérifié depuis la requête
$input = json_decode(file_get_contents('php://input'), true);
$last_id = isset($input['last_id']) ? intval($input['last_id']) : 0;

try {
    // Connexion à la base de données
    require_once 'connnect/acces.php';
    
    // Requête optimisée pour récupérer les nouvelles notifications
    // On cherche les notifications où:
    // - receiver_id correspond au user_id connecté
    // - id est supérieur au dernier ID vérifié
    // - is_read = FALSE (non lues)
    $stmt = $pdo->prepare("
        SELECT 
            id,
            sender_id,
            receiver_id,
            message,
            is_read,
            created_at
        FROM notification_message 
        WHERE receiver_id = ? 
        AND id > ?
        AND is_read = FALSE
        ORDER BY created_at DESC 
        LIMIT 1
    ");
    
    $stmt->execute([$user_id, $last_id]);
    $notification = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($notification) {
        // Nouvelle notification trouvée
        
        // Optionnel: Récupérer les infos de l'expéditeur
        $sender_stmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
        $sender_stmt->execute([$notification['sender_id']]);
        $sender = $sender_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($sender) {
            $notification['sender_username'] = $sender['username'];
        }
        
        echo json_encode([
            'success' => true,
            'has_new' => true,
            'notification' => [
                'id' => intval($notification['id']),
                'sender_id' => intval($notification['sender_id']),
                'sender_username' => $notification['sender_username'] ?? 'Utilisateur',
                'receiver_id' => intval($notification['receiver_id']),
                'message' => $notification['message'],
                'is_read' => (bool)$notification['is_read'],
                'created_at' => $notification['created_at']
            ],
            'timestamp' => time()
        ]);
        
    } else {
        // Pas de nouvelle notification
        echo json_encode([
            'success' => true,
            'has_new' => false,
            'last_checked' => time()
        ]);
    }
    
} catch (PDOException $e) {
    // Erreur de base de données
    error_log("Database error in api_check_notifications.php: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'has_new' => false,
        'debug' => [
            'message' => $e->getMessage(),
            'user_id' => $user_id,
            'last_id' => $last_id
        ]
    ]);
    
} catch (Exception $e) {
    // Autre erreur
    error_log("Error in api_check_notifications.php: " . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'error' => 'Server error',
        'has_new' => false
    ]);
}
