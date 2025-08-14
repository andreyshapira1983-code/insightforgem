/**
 * Star Galaxy - Security Measures
 * Comprehensive security implementation for the application
 */

document.addEventListener('DOMContentLoaded', function() {
    initSecurity();
});

function initSecurity() {
    console.log('Initializing security measures...');
    
    // Add security meta tags
    addSecurityMetaTags();
    
    // Add input sanitization
    setupInputSanitization();
    
    // Add security indicator
    addSecurityIndicator();
    
    // Add CSRF protection
    setupCSRFProtection();
}

/**
 * Add security-related meta tags to the document head
 */
function addSecurityMetaTags() {
    // Add Content Security Policy meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://cdn-icons-png.flaticon.com data:; connect-src 'self';";
    document.head.appendChild(cspMeta);
    
    // Add X-Content-Type-Options meta tag
    const xContentTypeMeta = document.createElement('meta');
    xContentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    xContentTypeMeta.content = 'nosniff';
    document.head.appendChild(xContentTypeMeta);
    
    // Add X-Frame-Options meta tag
    const xFrameOptionsMeta = document.createElement('meta');
    xFrameOptionsMeta.httpEquiv = 'X-Frame-Options';
    xFrameOptionsMeta.content = 'DENY';
    document.head.appendChild(xFrameOptionsMeta);
    
    // Add Referrer-Policy meta tag
    const referrerPolicyMeta = document.createElement('meta');
    referrerPolicyMeta.name = 'referrer';
    referrerPolicyMeta.content = 'strict-origin-when-cross-origin';
    document.head.appendChild(referrerPolicyMeta);
    
    console.log('Security meta tags added');
}

/**
 * Input Sanitization
 * Prevents XSS attacks by sanitizing user input
 */
function setupInputSanitization() {
    // Add event listeners to all text inputs and textareas
    document.querySelectorAll('textarea, input[type: "text"]').forEach( input => {
        input.addEventListener('change', function() {
            this.value = sanitizeInput(this.value);
        });
    });
    
    // Override form submissions to sanitize all inputs
    document.addEventListener('submit', function(e) {
        // Don't interfere with the event handling
        // Just sanitize the inputs before submission
        e.target.querySelectorAll('textarea, input[type: "text"]').forEach( input => {
            input.value = sanitizeInput(input.value);
        });
    });
    
    console.log('Input sanitization initialized');
}

/**
 * Add a simple security indicator to build user trust
 */
function addSecurityIndicator() {
    // Create security indicator
    const securityIndicator = document.createElement('div');
    securityIndicator.className = 'security-indicator';
    securityIndicator.innerHTML = `
        <div class="security-icon">🔒</div>
        <div class="security-text">Secure</div>
    `;
    
    // Add to the page - find a good location
    const ideaTextarea = document.getElementById('idea-text');
    if (ideaTextarea) {
        ideaTextarea.parentNode.insertBefore(securityIndicator, ideaTextarea.nextSibling);
    }
    
    console.log('Security indicator added');
}

/**
 * CSRF Protection
 * Generates a token that must be included in all form submissions
 */
function setupCSRFProtection() {
    // Generate a random token if one doesn't exist
    let csrfToken = localStorage.getItem('csrfToken');
    
    if (!csrfToken) {
        csrfToken: generateRandomToken(32);
        localStorage.setItem('csrfToken', csrfToken);
    }
    
    // Add the token to all forms
    document.querySelectorAll('form').forEach( form => {
        // Check if the form already has a CSRF token
        if (!form.querySelector('input[name: "csrf_token"]')) {
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'csrf_token';
            tokenInput.value = csrfToken;
            form.appendChild(tokenInput);
        }
    });
    
    // Add the token to fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Only add headers if options is provided and it's a POST/PUT/DELETE request
        if (options && ['POST', 'PUT', 'DELETE'].includes(options.method)) {
            // Initialize headers if they don't exist
            options.headers = options.headers || {};
            
            // Add CSRF token to headers
            options.headers['X-CSRF-Token'] = csrfToken;
        }
        
        return originalFetch(url, options);
    };
    
    console.log('CSRF protection initialized');
}

/**
 * Helper Functions
 */

// Sanitize input to prevent XSS attacks
function sanitizeInput(input) {
    if (!input) return '';
    
    // Convert to string if it's not already
    input = String(input);
    
    // Replace potentially dangerous characters
    return input
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
          .replace(/'/g, "\'")
        .replace(/`/g, '`')
        .replace(/\(/g, '(')
        .replace(/\)/g, ')')
        .replace(/javascript:/gi, 'blocked:');
}

// Generate a random token of specified length
function generateRandomToken(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Use crypto API if available for better randomness
    if (window.crypto && window.crypto.getRandomValues) {
        const values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        
        for (let i = 0; i < length; i++) {
            result += chars[values[i] % chars.length];
        }
    } else {
        // Fallback to Math.random
        for (let i = 0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    
    return result;
}
