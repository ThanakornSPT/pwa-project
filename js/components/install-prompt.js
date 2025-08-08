// Install Prompt Component
// Handles PWA installation

(function() {
    'use strict';
    
    let deferredPrompt;
    let installPromptElement;
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        installPromptElement = document.getElementById('installPrompt');
        setupInstallPrompt();
    });
    
    /**
     * Setup PWA install prompt
     */
    function setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', function(e) {
            console.log('beforeinstallprompt Event fired');
            
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            deferredPrompt = e;
            
            // Show install prompt
            showInstallPrompt();
        });
        
        // Listen for app installed event
        window.addEventListener('appinstalled', function(e) {
            console.log('PWA was installed');
            hideInstallPrompt();
            deferredPrompt = null;
        });
    }
    
    /**
     * Show install prompt
     */
    function showInstallPrompt() {
        if (installPromptElement && !isStandalone()) {
            installPromptElement.style.display = 'flex';
        }
    }
    
    /**
     * Hide install prompt
     */
    function hideInstallPrompt() {
        if (installPromptElement) {
            installPromptElement.style.display = 'none';
        }
    }
    
    /**
     * Check if app is running in standalone mode
     */
    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }
    
    /**
     * Install app (called by install button)
     */
    window.installApp = function() {
        if (deferredPrompt) {
            // Show the prompt
            deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
                hideInstallPrompt();
            });
        } else {
            // Fallback for browsers that don't support install prompt
            alert('To install this app:\n\n1. Open browser menu\n2. Select "Add to Home Screen" or "Install App"');
            hideInstallPrompt();
        }
    };
    
    /**
     * Dismiss install prompt (called by later button)
     */
    window.dismissInstall = function() {
        hideInstallPrompt();
        
        // Remember user dismissed (optional)
        localStorage.setItem('goodvibes_install_dismissed', Date.now());
    };
    
    // Hide install prompt if running in standalone mode
    if (isStandalone()) {
        document.addEventListener('DOMContentLoaded', function() {
            hideInstallPrompt();
        });
    }
})();
