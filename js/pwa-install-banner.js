/**
 * PWA Installation Banner - Version Améliorée
 * Installation directe sur navigateurs compatibles + tutoriel visuel pour iOS
 * Compatible avec : Chrome, Edge, Safari, Firefox, Samsung Internet, Opera
 */

(function () {
    'use strict';

    let deferredPrompt = null;
    let installBanner = null;
    let iosOverlay = null;

    // ========================
    // DÉTECTION NAVIGATEUR
    // ========================

    function getBrowserInfo() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const uaLower = ua.toLowerCase();

        // Détection plateforme
        const isIOS = /ipad|iphone|ipod/.test(uaLower) && !window.MSStream;
        const isAndroid = /android/.test(uaLower);
        const isMobile = isIOS || isAndroid || /mobile/.test(uaLower);

        // Détection navigateur
        let browser = 'other';
        let supportsInstall = false;

        if (/edg/i.test(ua)) {
            browser = 'edge';
            supportsInstall = !isIOS; // Edge supporte PWA sauf sur iOS
        } else if (/chrome/i.test(ua) && !/edg/i.test(ua)) {
            browser = 'chrome';
            supportsInstall = !isIOS; // Chrome supporte PWA sauf sur iOS
        } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
            browser = 'safari';
            supportsInstall = false; // Safari ne supporte pas beforeinstallprompt
        } else if (/firefox/i.test(ua)) {
            browser = 'firefox';
            supportsInstall = false; // Firefox ne supporte pas PWA install
        } else if (/samsungbrowser/i.test(ua)) {
            browser = 'samsung';
            supportsInstall = true; // Samsung Internet supporte PWA
        } else if (/opera|opr/i.test(ua)) {
            browser = 'opera';
            supportsInstall = !isIOS;
        }

        return {
            browser,
            isIOS,
            isAndroid,
            isMobile,
            supportsInstall,
            platform: isIOS ? 'ios' : (isAndroid ? 'android' : 'desktop')
        };
    }

    // ========================
    // DÉTECTION INSTALLATION
    // ========================

    function isAppInstalled() {
        // Mode standalone (déjà installée)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return true;
        }
        // iOS Safari standalone
        if (window.navigator.standalone === true) {
            return true;
        }
        // Mémorisé dans localStorage
        if (localStorage.getItem('pwa_installed') === 'true') {
            return true;
        }
        return false;
    }

    function shouldShowBanner() {
        if (isAppInstalled()) {
            console.log('📱 App déjà installée');
            return false;
        }

        // Vérifier si fermée récemment (moins de 3 jours)
        const dismissed = localStorage.getItem('pwa_banner_dismissed');
        if (dismissed) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < 3) {
                console.log('📱 Bannière fermée récemment');
                return false;
            }
        }

        return true;
    }

    // ========================
    // TEXTES MULTILINGUES
    // ========================

    function getTexts() {
        const lang = document.documentElement.lang || 'fr';
        const isPortuguese = lang === 'pt';

        return {
            // Messages principaux
            message: isPortuguese
                ? '📱 Receba alertas sonoros diretos para mensagens instalando a aplicação gratuita'
                : '📱 Recevez directement les alertes sonores des messages en installant l\'application gratuitement',

            // Boutons
            install: isPortuguese ? 'INSTALLER' : 'INSTALLER',
            close: '×',
            understood: isPortuguese ? 'Compris !' : 'Compris !',

            // iOS étapes
            iosTitle: isPortuguese ? 'Instalar no iOS' : 'Installer sur iOS',
            iosStep1: isPortuguese ? 'Toque em' : 'Appuyez sur',
            iosStep2: isPortuguese ? 'Selecione' : 'Sélectionnez',
            iosStep3: isPortuguese ? 'Toque' : 'Appuyez',
            iosShareLabel: isPortuguese ? 'Partilhar' : 'Partager',
            iosAddLabel: isPortuguese ? 'Ecrã inicial' : 'Écran d\'accueil',
            iosConfirmLabel: isPortuguese ? 'Adicionar' : 'Ajouter',

            // Fallback navigateurs non supportés
            fallbackTitle: isPortuguese ? 'Adicionar ao ecrã inicial' : 'Ajouter à l\'écran d\'accueil',
            fallbackStep1: isPortuguese ? 'Abra o menu do navegador' : 'Ouvrez le menu du navigateur',
            fallbackStep2: isPortuguese ? 'Selecione "Adicionar ao ecrã inicial"' : 'Sélectionnez "Ajouter à l\'écran d\'accueil"',
        };
    }

    // ========================
    // STYLES CSS
    // ========================

    function injectStyles() {
        if (document.getElementById('pwa-install-styles')) return;

        const style = document.createElement('style');
        style.id = 'pwa-install-styles';
        style.textContent = `
            @keyframes pwa-slideIn {
                from { opacity: 0; transform: translate(-50%, -60%); }
                to { opacity: 1; transform: translate(-50%, -50%); }
            }
            @keyframes pwa-slideOut {
                from { opacity: 1; transform: translate(-50%, -50%); }
                to { opacity: 0; transform: translate(-50%, -60%); }
            }
            @keyframes pwa-fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes pwa-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .pwa-banner {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #0055A4 0%, #E31C79 100%);
                color: white;
                padding: 25px;
                border-radius: 20px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                z-index: 99999;
                max-width: 90%;
                width: 380px;
                text-align: center;
                animation: pwa-slideIn 0.4s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .pwa-banner.closing {
                animation: pwa-slideOut 0.3s ease-in forwards;
            }

            .pwa-close-btn {
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(255,255,255,0.25);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                line-height: 1;
                transition: background 0.2s;
            }

            .pwa-close-btn:hover {
                background: rgba(255,255,255,0.4);
            }

            .pwa-message {
                margin-bottom: 20px;
                font-size: 17px;
                line-height: 1.5;
                padding: 0 10px;
            }

            .pwa-install-btn {
                background: #FECB00;
                color: #343A40;
                border: none;
                padding: 14px 40px;
                border-radius: 30px;
                font-weight: bold;
                font-size: 18px;
                cursor: pointer;
                box-shadow: 0 5px 20px rgba(0,0,0,0.25);
                transition: all 0.3s;
            }

            .pwa-install-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            }

            .pwa-install-btn:active {
                transform: scale(0.98);
            }

            /* iOS Overlay Tutorial */
            .pwa-ios-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.85);
                z-index: 100000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: pwa-fadeIn 0.3s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .pwa-ios-card {
                background: white;
                border-radius: 20px;
                padding: 30px;
                max-width: 340px;
                width: 100%;
                text-align: center;
            }

            .pwa-ios-title {
                font-size: 22px;
                font-weight: bold;
                color: #333;
                margin-bottom: 25px;
            }

            .pwa-ios-steps {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .pwa-ios-step {
                display: flex;
                align-items: center;
                gap: 15px;
                text-align: left;
            }

            .pwa-ios-step-number {
                background: linear-gradient(135deg, #0055A4, #E31C79);
                color: white;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                flex-shrink: 0;
            }

            .pwa-ios-step-content {
                flex: 1;
            }

            .pwa-ios-step-text {
                font-size: 15px;
                color: #666;
                margin-bottom: 5px;
            }

            .pwa-ios-step-icon {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background: #f0f0f0;
                padding: 8px 14px;
                border-radius: 10px;
                font-size: 14px;
                color: #333;
            }

            .pwa-ios-step-icon svg {
                width: 20px;
                height: 20px;
            }

            .pwa-ios-done-btn {
                background: linear-gradient(135deg, #0055A4, #E31C79);
                color: white;
                border: none;
                padding: 14px 40px;
                border-radius: 30px;
                font-weight: bold;
                font-size: 16px;
                cursor: pointer;
                margin-top: 25px;
                transition: transform 0.2s;
            }

            .pwa-ios-done-btn:hover {
                transform: scale(1.05);
            }

            /* Share icon animation */
            .pwa-share-icon {
                animation: pwa-pulse 1.5s infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // ========================
    // ICÔNES SVG
    // ========================

    const icons = {
        // iOS Share icon (carré avec flèche vers le haut)
        share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>`,

        // Plus icon (pour "Ajouter à l'écran d'accueil")
        addHome: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>`,

        // Checkmark
        check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
        </svg>`,

        // Menu dots (pour fallback)
        menu: `<svg viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
        </svg>`
    };

    // ========================
    // BANNIÈRE PRINCIPALE
    // ========================

    function createInstallBanner() {
        const texts = getTexts();

        injectStyles();

        installBanner = document.createElement('div');
        installBanner.className = 'pwa-banner';
        installBanner.innerHTML = `
            <button class="pwa-close-btn" id="pwa-close">${texts.close}</button>
            <div class="pwa-message">${texts.message}</div>
            <button class="pwa-install-btn" id="pwa-install">${texts.install}</button>
        `;

        document.body.appendChild(installBanner);

        document.getElementById('pwa-close').addEventListener('click', closeBanner);
        document.getElementById('pwa-install').addEventListener('click', handleInstallClick);
    }

    function closeBanner() {
        if (installBanner) {
            installBanner.classList.add('closing');
            setTimeout(() => {
                if (installBanner && installBanner.parentNode) {
                    installBanner.parentNode.removeChild(installBanner);
                }
                installBanner = null;
            }, 300);
            localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
        }
    }

    // ========================
    // TUTORIEL VISUEL iOS
    // ========================

    function showIOSTutorial() {
        const texts = getTexts();

        injectStyles();

        iosOverlay = document.createElement('div');
        iosOverlay.className = 'pwa-ios-overlay';
        iosOverlay.innerHTML = `
            <div class="pwa-ios-card">
                <div class="pwa-ios-title">${texts.iosTitle}</div>
                <div class="pwa-ios-steps">
                    <div class="pwa-ios-step">
                        <div class="pwa-ios-step-number">1</div>
                        <div class="pwa-ios-step-content">
                            <div class="pwa-ios-step-text">${texts.iosStep1}</div>
                            <div class="pwa-ios-step-icon pwa-share-icon">
                                ${icons.share}
                                <span>${texts.iosShareLabel}</span>
                            </div>
                        </div>
                    </div>
                    <div class="pwa-ios-step">
                        <div class="pwa-ios-step-number">2</div>
                        <div class="pwa-ios-step-content">
                            <div class="pwa-ios-step-text">${texts.iosStep2}</div>
                            <div class="pwa-ios-step-icon">
                                ${icons.addHome}
                                <span>${texts.iosAddLabel}</span>
                            </div>
                        </div>
                    </div>
                    <div class="pwa-ios-step">
                        <div class="pwa-ios-step-number">3</div>
                        <div class="pwa-ios-step-content">
                            <div class="pwa-ios-step-text">${texts.iosStep3}</div>
                            <div class="pwa-ios-step-icon">
                                ${icons.check}
                                <span>${texts.iosConfirmLabel}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="pwa-ios-done-btn" id="pwa-ios-done">${texts.understood}</button>
            </div>
        `;

        document.body.appendChild(iosOverlay);
        closeBanner(); // Fermer la bannière

        document.getElementById('pwa-ios-done').addEventListener('click', () => {
            iosOverlay.style.opacity = '0';
            setTimeout(() => {
                if (iosOverlay && iosOverlay.parentNode) {
                    iosOverlay.parentNode.removeChild(iosOverlay);
                }
                iosOverlay = null;
            }, 300);
        });
    }

    // ========================
    // TUTORIEL VISUEL FALLBACK
    // ========================

    function showFallbackTutorial() {
        const texts = getTexts();

        injectStyles();

        iosOverlay = document.createElement('div');
        iosOverlay.className = 'pwa-ios-overlay';
        iosOverlay.innerHTML = `
            <div class="pwa-ios-card">
                <div class="pwa-ios-title">${texts.fallbackTitle}</div>
                <div class="pwa-ios-steps">
                    <div class="pwa-ios-step">
                        <div class="pwa-ios-step-number">1</div>
                        <div class="pwa-ios-step-content">
                            <div class="pwa-ios-step-text">${texts.fallbackStep1}</div>
                            <div class="pwa-ios-step-icon">
                                ${icons.menu}
                                <span>⋮</span>
                            </div>
                        </div>
                    </div>
                    <div class="pwa-ios-step">
                        <div class="pwa-ios-step-number">2</div>
                        <div class="pwa-ios-step-content">
                            <div class="pwa-ios-step-text">${texts.fallbackStep2}</div>
                            <div class="pwa-ios-step-icon">
                                ${icons.addHome}
                                <span>+</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="pwa-ios-done-btn" id="pwa-ios-done">${texts.understood}</button>
            </div>
        `;

        document.body.appendChild(iosOverlay);
        closeBanner();

        document.getElementById('pwa-ios-done').addEventListener('click', () => {
            iosOverlay.style.opacity = '0';
            setTimeout(() => {
                if (iosOverlay && iosOverlay.parentNode) {
                    iosOverlay.parentNode.removeChild(iosOverlay);
                }
                iosOverlay = null;
            }, 300);
        });
    }

    // ========================
    // GESTION INSTALLATION
    // ========================

    async function handleInstallClick() {
        const browserInfo = getBrowserInfo();

        // Si on a le prompt d'installation (Chrome/Edge/Samsung)
        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    console.log('✅ PWA installée');
                    localStorage.setItem('pwa_installed', 'true');
                }

                deferredPrompt = null;
                closeBanner();
            } catch (err) {
                console.error('Erreur installation:', err);
                showFallbackTutorial();
            }
            return;
        }

        // iOS - afficher tutoriel visuel
        if (browserInfo.isIOS) {
            showIOSTutorial();
            return;
        }

        // Autres navigateurs sans support - afficher tutoriel fallback
        showFallbackTutorial();
    }

    // ========================
    // INITIALISATION
    // ========================

    function init() {
        const browserInfo = getBrowserInfo();
        console.log('📱 PWA Install - Browser:', browserInfo);

        // Écouter beforeinstallprompt (Chrome/Edge/Samsung)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            console.log('📱 beforeinstallprompt reçu');

            if (shouldShowBanner()) {
                setTimeout(() => createInstallBanner(), 2000);
            }
        });

        // Sur iOS ou navigateurs sans beforeinstallprompt
        window.addEventListener('load', () => {
            // Attendre un peu pour voir si beforeinstallprompt arrive
            setTimeout(() => {
                if (!deferredPrompt && shouldShowBanner()) {
                    // Afficher quand même la bannière (avec tutoriel au clic)
                    createInstallBanner();
                }
            }, 3000);
        });

        // Écouter l'installation réussie
        window.addEventListener('appinstalled', () => {
            console.log('🎉 PWA installée avec succès');
            localStorage.setItem('pwa_installed', 'true');
            closeBanner();
        });
    }

    // Démarrer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
