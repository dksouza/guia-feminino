/**
 * Guia de Saúde Feminina - Mini App Logic
 */

// App State & Elements
const DOM = {
    loginSection: document.getElementById('login-section'),
    homeSection: document.getElementById('home-section'),
    appSection: document.getElementById('app-section'),
    
    loginForm: document.getElementById('login-form'),
    emailInput: document.getElementById('email'),
    loginError: document.getElementById('login-error'),
    
    logoutBtn: document.getElementById('logout-btn'),
    backBtn: document.getElementById('back-btn'),
    
    moduleCards: document.querySelectorAll('.module-card'),
    viewerTitle: document.getElementById('viewer-title'),
    
    iframe: document.getElementById('content-iframe'),
    loader: document.getElementById('iframe-loader'),
    shareBtn: document.getElementById('share-btn'),
    fullscreenBtn: document.getElementById('fullscreen-btn')
};

const APP_DATA_KEY = '@GuiaSaude:logged';
let currentContentUrl = '';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
    setupEventListeners();
});

// Setup Listeners
function setupEventListeners() {
    // Auth
    DOM.loginForm.addEventListener('submit', handleLogin);
    DOM.logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    DOM.backBtn.addEventListener('click', goBackToHome);
    
    // Modules
    DOM.moduleCards.forEach(card => {
        card.addEventListener('click', () => {
            const url = card.getAttribute('data-url');
            const title = card.querySelector('h4').innerText;
            openModule(url, title);
        });
    });

    // Iframe Load
    DOM.iframe.addEventListener('load', handleIframeLoaded);

    // Extras
    DOM.fullscreenBtn.addEventListener('click', toggleFullScreen);
    DOM.shareBtn.addEventListener('click', handleShare);

    // Form clear errors
    DOM.emailInput.addEventListener('input', hideError);
}

// Authentication
function checkAuthState() {
    const isLogged = localStorage.getItem(APP_DATA_KEY);
    
    if (isLogged === 'true') {
        showHomeScreen();
    } else {
        showLoginScreen();
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = DOM.emailInput.value.trim();
    
    if (!email) {
        showError();
        return;
    }
    
    localStorage.setItem(APP_DATA_KEY, 'true');
    hideError();
    DOM.loginForm.reset();
    showHomeScreen();
}

function handleLogout() {
    localStorage.removeItem(APP_DATA_KEY);
    showLoginScreen();
    resetViewer();
}

// Screen Transitions
function showLoginScreen() {
    DOM.homeSection.classList.remove('active');
    DOM.appSection.classList.remove('active');
    setTimeout(() => {
        DOM.loginSection.classList.add('active');
    }, 300);
}

function showHomeScreen() {
    DOM.loginSection.classList.remove('active');
    DOM.appSection.classList.remove('active');
    setTimeout(() => {
        DOM.homeSection.classList.add('active');
    }, 300);
}

function openModule(url, title) {
    currentContentUrl = url;
    DOM.viewerTitle.innerText = title;
    
    DOM.homeSection.classList.remove('active');
    setTimeout(() => {
        DOM.appSection.classList.add('active');
        
        // Show loader, reset iframe view
        DOM.loader.style.opacity = '1';
        DOM.loader.style.visibility = 'visible';
        DOM.iframe.classList.remove('loaded');
        
        // Load the new content
        DOM.iframe.src = currentContentUrl;
    }, 300);
}

function goBackToHome() {
    resetViewer();
    showHomeScreen();
}

function resetViewer() {
    DOM.iframe.src = 'about:blank';
    DOM.iframe.classList.remove('loaded');
    DOM.loader.style.opacity = '1';
    DOM.loader.style.visibility = 'visible';
}

function showError() {
    DOM.loginError.classList.remove('hidden');
    DOM.emailInput.parentElement.style.borderColor = 'var(--error-color)';
}

function hideError() {
    DOM.loginError.classList.add('hidden');
    DOM.emailInput.parentElement.style.borderColor = 'var(--border-color)';
}

// Iframe Loading
function handleIframeLoaded() {
    if (DOM.iframe.src === 'about:blank' || !DOM.iframe.src) return;

    DOM.loader.style.opacity = '0';
    setTimeout(() => {
        DOM.loader.style.visibility = 'hidden';
        DOM.iframe.classList.add('loaded');
    }, 300);
}

// Extras
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        DOM.appSection.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        DOM.fullscreenBtn.innerHTML = '<i class="ph ph-corners-in"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        DOM.fullscreenBtn.innerHTML = '<i class="ph ph-corners-out"></i>';
    }
}

async function handleShare() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Guia de Saúde Feminina',
                text: 'Confira este incrível guia informativo!',
                url: currentContentUrl
            });
            console.log('Conteúdo compartilhado com sucesso.');
        } catch (error) {
            console.log('Erro ao compartilhar:', error);
        }
    } else {
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = currentContentUrl;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        alert('Link copiado para a área de transferência!');
    }
}
