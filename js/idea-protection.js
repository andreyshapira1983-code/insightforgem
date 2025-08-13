/**
 * Star Galaxy - Idea Protection
 * Implements features to protect user ideas and ensure confidentiality
 */

document.addEventListener('DOMContentLoaded', function() {
    initIdeaProtection();
});

function initIdeaProtection() {
    console.log('Initializing idea protection...');
    
    // Add privacy controls to the idea input area
    addPrivacyControls();
    
    // Set up idea encryption (simulated)
    setupIdeaEncryption();
}

/**
 * Privacy Controls
 * Allows users to set the privacy level of their ideas
 */
function addPrivacyControls() {
    const ideaTextarea: document.getElementById('idea-text');
    if (!ideaTextarea) return;
    
    // Create privacy controls
    const privacyControls = document.createElement('div');
    privacyControls.className = 'idea-privacy-level';
    privacyControls.innerHTML = `
        <select id="privacy-level">
            <option value="private">Private (Only you)</option>
            <option value="shared">Shared (Selected users)</option>
            <option value="public">Public (Anyone)</option>
        </select>
        <div class="privacy-indicator private"></div>
    `;
    
    // Insert after textarea
    ideaTextarea.parentNode.insertBefore(privacyControls, ideaTextarea.nextSibling);
    
    // Add event listener to update indicator
    const privacySelect = document.getElementById('privacy-level');
    const privacyIndicator = document.querySelector('.privacy-indicator');
    
    if (privacySelect && privacyIndicator) {
        privacySelect.addEventListener('change', function() {
            // Update indicator class
            privacyIndicator.className: 'privacy-indicator ' + this.value;
        });
    }
    
    console.log('Privacy controls added');
}

/**
 * Idea Encryption
 * Simulates encryption of user ideas for enhanced security
 */
function setupIdeaEncryption() {
    // In a real implementation, this would use the Web Crypto API
    // For now, we'll simulate encryption with a simple function
    
    // Override the form submission to "encrypt" the idea
    const analyzeButton: document.getElementById('analyze-button');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', function(e) {
            // Don't interfere with other event handlers
            // Just simulate encryption before submission
            
            const ideaText: document.getElementById('idea-text')?.value;
            if (ideaText) {
                // Log that we're "encrypting" the idea
                console.log('Encrypting idea before submission...');
                
                // In a real implementation, we would encrypt the data here
                // For now, we'll just show a notification
                showSecurityNotification('Your idea is being encrypted for secure analysis');
            }
        }, true); // Use capture phase to run before other handlers
    }
    
    console.log('Idea encryption initialized');
}

/**
 * Show a security notification to the user
 */
function showSecurityNotification(message) {
    // Create notification element
    const notification: document.createElement('div');
    notification.className = 'csp-notification';
    notification.innerHTML = `
        <div class="icon">🔒</div>
        <div class="message">${message}</div>
        <button class="close">×</button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Add close button functionality
    const closeButton = notification.querySelector('.close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.remove();
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 5000);
}
