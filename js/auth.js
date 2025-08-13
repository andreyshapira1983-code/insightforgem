// auth.js - Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
});

function initAuth() {
    console.log('Initializing authentication...');
    
    // Add auth container to the page
    addAuthContainer();
    
    // Set up event listeners
    setupAuthEvents();
    
    // Check if user is already logged in
    checkAuthState();
}

function addAuthContainer() {
    // Create auth container
    const authContainer = document.createElement('div');
    authContainer.className = 'auth-container';
    
    // Add sign in button
    authContainer.innerHTML = `
        <button id="sign-in-button" class="auth-button">
            Sign in
        </button>
    `;
    
    // Add to the page
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.appendChild(authContainer);
    }
    
    // Add auth modal
    const authModal = document.createElement('div');
    authModal.className = 'auth-modal';
    authModal.id = 'auth-modal';
    
    // Add modal content
    authModal.innerHTML = `
        <div class="auth-modal-content">
            <button class="auth-modal-close">×</button>
            <h2 class="auth-modal-title">Sign in</h2>
            <p class="auth-modal-subtitle">Choose how you'd like to sign in</p>
            
            <div class="social-auth-buttons">
                <button class="social-auth-button" id="google-auth">
                    <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google">
                    <span>Google</span>
                </button>
                
                <button class="social-auth-button" id="facebook-auth">
                    <img src="https://cdn-icons-png.flaticon.com/512/5968/5968764.png" alt="Facebook">
                    <span>Facebook</span>
                </button>
                
                <button class="social-auth-button" id="github-auth">
                    <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" alt="GitHub">
                    <span>GitHub</span>
                </button>
                
                <button class="social-auth-button" id="apple-auth">
                    <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple">
                    <span>Apple</span>
                </button>
            </div>
            
            <div class="auth-footer">
                By signing in, you agree to our <a href="legal/terms.html" target="_blank">Terms</a> and <a href="legal/privacy.html" target="_blank">Privacy Policy</a>
            </div>
        </div>
    `;
    
    // Add to the page
    document.body.appendChild(authModal);
}

function setupAuthEvents() {
    // Sign in button click
    const signInButton = document.getElementById('sign-in-button');
    if (signInButton) {
        signInButton.addEventListener('click', () => {
            openAuthModal();
        });
    }
    
    // Close modal button - FIXED
    const closeButton = document.querySelector('.auth-modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeAuthModal();
        });
    }
    
    // Close modal when clicking outside
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                closeAuthModal();
            }
        });
    }
    
    // Social auth buttons
    setupSocialAuthButtons();
}

function setupSocialAuthButtons() {
    // Google auth
    const googleAuth = document.getElementById('google-auth');
    if (googleAuth) {
        googleAuth.addEventListener('click', () => {
            simulateAuth('google');
        });
    }
    
    // Facebook auth
    const facebookAuth = document.getElementById('facebook-auth');
    if (facebookAuth) {
        facebookAuth.addEventListener('click', () => {
            simulateAuth('facebook');
        });
    }
    
    // GitHub auth
    const githubAuth = document.getElementById('github-auth');
    if (githubAuth) {
        githubAuth.addEventListener('click', () => {
            simulateAuth('github');
        });
    }
    
    // Apple auth
    const appleAuth = document.getElementById('apple-auth');
    if (appleAuth) {
        appleAuth.addEventListener('click', () => {
            simulateAuth('apple');
        });
    }
}

function openAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.add('active');
        
        // Re-attach close button event listener to ensure it works
        const closeButton = document.querySelector('.auth-modal-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closeAuthModal();
            });
        }
    }
}

function closeAuthModal() {
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.classList.remove('active');
    }
}

function simulateAuth(provider) {
    console.log(`Simulating auth with ${provider}...`);
    
    // Show loading state on button
    const button = document.getElementById(`${provider}-auth`);
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = `<span>Signing in...</span>`;
        button.disabled = true;
        
        // Simulate auth delay
        setTimeout(() => {
            // Simulate successful auth
            closeAuthModal();
            showLoggedInUser(provider);
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
        }, 1500);
    }
}

function showLoggedInUser(provider) {
    // Remove sign in button
    const signInButton = document.getElementById('sign-in-button');
    if (signInButton) {
        signInButton.remove();
    }
    
    // Create user profile
    const userProfile = document.createElement('div');
    userProfile.className = 'user-profile';
    
    // Set user data based on provider
    let userName = 'User';
    let avatarUrl = '';
    
    switch (provider) {
        case 'google':
            userName = 'G';
            break;
        case 'facebook':
            userName = 'F';
            break;
        case 'github':
            userName = 'GH';
            break;
        case 'apple':
            userName = 'A';
            break;
    }
    
    // Add user profile HTML
    userProfile.innerHTML = `
        <div class="user-avatar">
            <img src="${avatarUrl}" alt="${userName}" class="provider-icon">
        </div>
        <span class="user-name">${userName}</span>
        <div class="user-dropdown">
            <a href="#" class="dropdown-item">My Ideas</a>
            <a href="#" class="dropdown-item">Settings</a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item logout-item" id="logout-button">Sign Out</a>
        </div>
    `;
    
    // Add to auth container
    const authContainer = document.querySelector('.auth-container');
    if (authContainer) {
          removeHeaderSignInOnce();
    }
   
    // Add logout functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Save auth state
    localStorage.setItem('starGalaxyAuth', JSON.stringify({
        provider,
        userName,
        avatarUrl,
        timestamp: new Date().toISOString()
    }));
}

function logout() {
    // Remove user profile
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.remove();
    }
    
    // Add sign in button back
    addAuthContainer();
    
    // Set up event listeners again
    setupAuthEvents();
    
    // Clear auth state
    localStorage.removeItem('starGalaxyAuth');
}

// Check if user is already logged in
function checkAuthState() {
    const authState = localStorage.getItem('starGalaxyAuth');
    if (authState) {
        try {
            const { provider } = JSON.parse(authState);
            showLoggedInUser(provider);
        } catch (e) {
            console.error('Error parsing auth state:', e);
            localStorage.removeItem('starGalaxyAuth');
        }
    }
}


// /* SIGNIN_DELEGATION_START */
(function attachGlobalSignInHandler(){
  const openAuthModal = (typeof window.openAuthModal === 'function') ? window.openAuthModal : (function(){ 
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'flex';
  });
  document.addEventListener('click', function(e){
    const trigger = e.target.closest('#header-sign-in, [data-role="signin"]');
    if (trigger) {
      e.preventDefault();
      try { openAuthModal(); } catch(_) {}
    }
  }, { passive: false });
})(); 
// /* SIGNIN_DELEGATION_END */


// Ensure both possible sign-in buttons disappear after login
function removeHeaderSignInOnce(){
    try {
        const b1 = document.getElementById('sign-in-button');
        if (b1) b1.remove();
        const b2 = document.getElementById('header-sign-in');
        if (b2) b2.remove();
    } catch(e){}
}


// DIRECT_HEADER_SIGNIN_BINDING
document.addEventListener('DOMContentLoaded', function(){
  const headerBtn = document.getElementById('header-sign-in');
  if (headerBtn) {
    headerBtn.addEventListener('click', function(e){
      e.preventDefault();
      try { 
        if (typeof openAuthModal === 'function') { openAuthModal(); }
        else {
          const m = document.getElementById('auth-modal');
          if (m) m.style.display = 'flex';
        }
      } catch(_) {}
    }, {passive:false});
  }
});
