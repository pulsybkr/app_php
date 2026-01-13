/**
 * PWA Installation Banner
 * Détecte si l'application est installée et affiche une bannière d'installation
 * avec des messages adaptés pour Android et iOS
 */

(function () {
    'use strict';

    let deferredPrompt = null;
    let installBanner = null;

    // Détecte si l'app est déjà installée
    function isAppInstalled() {
        // Vérifier si l'app est en mode standalone (déjà installée)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }

        // iOS Safari
        if (window.navigator.standalone === true) {
            return true;
        }

        // Vérifier localStorage (si l'utilisateur a déjà installé)
        if (localStorage.getItem('pwa_installed') === 'true') {
            return true;
        }

        return false;
    }

    // Détecte la plateforme
    function getPlatform() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;

        if (/android/i.test(userAgent)) {
            return 'android';
        }

        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return 'ios';
        }

        return 'desktop';
    }

    // Crée la bannière d'installation
    function createInstallBanner() {
        const platform = getPlatform();
        const lang = document.documentElement.lang || 'fr';

        // Messages selon la langue et la plateforme
        const messages = {
            fr: {
                android: '📱 Recevez directement les alertes sonores des messages que les membres vous envoient en installant gratuitement l\'application sur votre téléphone',
                ios: '📱 Recevez directement les alertes sonores des messages en ajoutant l\'application à votre écran d\'accueil',
                desktop: '📱 Installez l\'application pour recevoir des notifications de messages'
            },
            pt: {
                android: '📱 Receba alertas sonoros diretos para mensagens enviadas por membros instalando a aplicação gratuita no seu telemóvel',
                ios: '📱 Receba alertas sonoros de mensagens adicionando a aplicação ao seu ecrã inicial',
                desktop: '📱 Instale a aplicação para receber notificações de mensagens'
            }
        };

        const buttonText = {
            fr: {
                android: 'INSTALLER',
                ios: 'VOIR COMMENT',
                desktop: 'INSTALLER'
            },
            pt: {
                android: 'INSTALAR',
                ios: 'VER COMO',
                desktop: 'INSTALAR'
            }
        };

        const currentLang = lang === 'pt' ? 'pt' : 'fr';
        const message = messages[currentLang][platform];
        const btnText = buttonText[currentLang][platform];

        // Créer l'élément de bannière
        installBanner = document.createElement('div');
        installBanner.id = 'pwa-install-banner';
        installBanner.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #0055A4 0%, #E31C79 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                z-index: 9999;
                max-width: 90%;
                width: 400px;
                text-align: center;
                animation: slideIn 0.3s ease-out;
            ">
                <button id="pwa-close-banner" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    line-height: 1;
                ">×</button>
                
                <div style="margin-bottom: 15px; font-size: 16px; line-height: 1.5;">
                    ${message}
                </div>
                
                <button id="pwa-install-btn" style="
                    background: #FECB00;
                    color: #343A40;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 16px;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" 
                   onmouseout="this.style.transform='scale(1)'">
                    ${btnText}
                </button>
            </div>
        `;

        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(installBanner);

        // Event listeners
        document.getElementById('pwa-close-banner').addEventListener('click', closeBanner);
        document.getElementById('pwa-install-btn').addEventListener('click', handleInstallClick);
    }

    // Fermer la bannière
    function closeBanner() {
        if (installBanner) {
            installBanner.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (installBanner && installBanner.parentNode) {
                    installBanner.parentNode.removeChild(installBanner);
                }
                installBanner = null;
            }, 300);

            // Mémoriser que l'utilisateur a fermé la bannière
            localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
        }
    }

    // Gérer le clic sur le bouton d'installation
    async function handleInstallClick() {
        const platform = getPlatform();

        if (platform === 'ios') {
            showIOSInstructions();
        } else if (deferredPrompt) {
            // Android/Desktop avec support PWA
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ PWA installée');
                localStorage.setItem('pwa_installed', 'true');
                closeBanner();
            }

            deferredPrompt = null;
        } else {
            // Fallback si pas de prompt disponible
            showManualInstructions();
        }
    }

    // Instructions pour iOS
    function showIOSInstructions() {
        const lang = document.documentElement.lang || 'fr';
        const instructions = lang === 'pt'
            ? `Para instalar no iOS:\n\n1. Toque no botão Partilhar (📤)\n2. Selecione "Adicionar ao Ecrã Inicial"\n3. Toque em "Adicionar"\n\nDepois, abra a aplicação a partir do ecrã inicial para receber notificações.`
            : `Pour installer sur iOS:\n\n1. Appuyez sur le bouton Partager (📤)\n2. Sélectionnez "Sur l'écran d'accueil"\n3. Appuyez sur "Ajouter"\n\nEnsuite, ouvrez l'app depuis l'écran d'accueil pour recevoir les notifications.`;

        alert(instructions);
    }

    // Instructions manuelles
    function showManualInstructions() {
        const lang = document.documentElement.lang || 'fr';
        const instructions = lang === 'pt'
            ? `Para instalar:\n\n1. Clique no menu do navegador (⋮)\n2. Selecione "Instalar aplicação" ou "Adicionar ao ecrã inicial"\n3. Confirme a instalação`
            : `Pour installer:\n\n1. Cliquez sur le menu du navigateur (⋮)\n2. Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"\n3. Confirmez l'installation`;

        alert(instructions);
    }

    // Vérifier si on doit afficher la bannière
    function shouldShowBanner() {
        // Ne pas afficher si déjà installé
        if (isAppInstalled()) {
            console.log('📱 App déjà installée');
            return false;
        }

        // Ne pas afficher si fermée récemment (moins de 7 jours)
        const dismissed = localStorage.getItem('pwa_banner_dismissed');
        if (dismissed) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 7) {
                console.log('📱 Bannière fermée récemment');
                return false;
            }
        }

        return true;
    }

    // Initialisation
    function init() {
        // Écouter l'événement beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            if (shouldShowBanner()) {
                // Attendre un peu avant d'afficher la bannière
                setTimeout(() => {
                    createInstallBanner();
                }, 2000);
            }
        });

        // Pour iOS ou si pas de beforeinstallprompt
        window.addEventListener('load', () => {
            const platform = getPlatform();

            // Sur iOS, toujours proposer (pas d'événement beforeinstallprompt)
            if (platform === 'ios' && shouldShowBanner()) {
                setTimeout(() => {
                    createInstallBanner();
                }, 2000);
            }
        });

        // Détecter quand l'app est installée
        window.addEventListener('appinstalled', () => {
            console.log('🎉 PWA installée avec succès');
            localStorage.setItem('pwa_installed', 'true');
            closeBanner();
        });

        // Vérifier si déjà en mode standalone
        if (isAppInstalled()) {
            console.log('📱 Application en mode standalone');
        }
    }

    // Démarrer quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
