<?php
// Démarrer la session AVANT tout output HTML
session_start();

// Pour le développement : connexion automatique AVANT la connexion DB
if (isset($_GET['dev'])) {
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = 'Utilisateur Test';
    $_SESSION['email'] = 'test@siteweb.com';
    header("Location: profile_test_notif.php");
    exit;
}

if (isset($_POST['login'])) {
    // Mode développement : connexion sans vérification
    $_SESSION['user_id'] = 1;
    $_SESSION['username'] = $_POST['username'] ?? 'Utilisateur';
    $_SESSION['email'] = 'test@siteweb.com';
    header("Location: profile_test_notif.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - siteweb.com</title>
    <style>
        :root {
            --primary-color: #E31C79;
            --secondary-color: #0055A4;
            --accent-color: #FECB00;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 100%;
        }
        
        .logo {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 30px;
            color: var(--primary-color);
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        .btn-login {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .btn-login:hover {
            transform: translateY(-2px);
        }
        
        .error {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .info {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">💌 siteweb.com</div>
        
        <div class="info">
            ⚠️ <strong>Mode développement</strong><br>
            La base de données n'est pas encore configurée.
        </div>
        
        <form method="POST">
            <div class="form-group">
                <label>Nom d'utilisateur</label>
                <input type="text" name="username" value="test" required>
            </div>
            
            <div class="form-group">
                <label>Mot de passe</label>
                <input type="password" name="password" value="test" required>
            </div>
            
            <button type="submit" name="login" class="btn-login">
                Se connecter
            </button>
        </form>
        
        <div class="info" style="margin-top: 30px;">
            <a href="?dev=1" style="color: var(--primary-color); text-decoration: none;">
                🚀 Connexion rapide (dev)
            </a>
        </div>
    </div>
</body>
</html>
