-- Script de test pour les notifications push
-- Utilisez ce script dans phpMyAdmin pour tester les notifications

-- 1. Vérifier les utilisateurs existants
SELECT id, username, email FROM users;

-- 2. Insérer une notification de test
-- Remplacez receiver_id par l'ID de l'utilisateur connecté
INSERT INTO notification_message (sender_id, receiver_id, message, is_read) 
VALUES (
    1,                                          -- sender_id (peut être n'importe quel utilisateur)
    1,                                          -- receiver_id (IMPORTANT: mettre l'ID de l'utilisateur connecté)
    'Test notification - Nouveau message !',   -- message
    FALSE                                       -- is_read
);

-- 3. Vérifier que la notification a été créée
SELECT * FROM notification_message ORDER BY created_at DESC LIMIT 5;

-- 4. Vérifier les notifications non lues pour un utilisateur
-- Remplacez ? par l'ID de l'utilisateur
SELECT * FROM notification_message 
WHERE receiver_id = 1 
AND is_read = FALSE 
ORDER BY created_at DESC;

-- 5. Marquer une notification comme lue (optionnel)
-- UPDATE notification_message SET is_read = TRUE WHERE id = ?;

-- 6. Supprimer toutes les notifications de test (nettoyage)
-- DELETE FROM notification_message WHERE message LIKE '%Test%';

-- 7. Réinitialiser l'auto-increment (optionnel)
-- ALTER TABLE notification_message AUTO_INCREMENT = 1;
