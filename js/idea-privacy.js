/**
 * Star Galaxy - Idea Privacy Controls
 * Allows users to set privacy levels for their ideas
 */

document.addEventListener('DOMContentLoaded', function() {
    initIdeaPrivacy();
});

function initIdeaPrivacy() {
    console.log('Initializing idea privacy controls...');
    
    // Add privacy controls
    addPrivacyControls();
}

function addPrivacyControls() {
    // Create privacy controls
    const privacyControls = document.createElement('div');
    privacyControls.className = 'idea-privacy';
    privacyControls.innerHTML = `
        <select id="privacy-level">
            <option value="private">Private (Only you)</option>
            <option value="shared">Shared (Selected users)</option>
            <option value="public">Public (Anyone)</option>
        </select>
        <div class="privacy-indicator private"></div>
    `;
    
    // Add to the page
    const ideaTextarea = document.getElementById('idea-text');
    if (ideaTextarea) {
        ideaTextarea.parentNode.insertBefore(privacyControls, ideaTextarea.nextSibling);
    }
    
    // Add event listener
    const privacySelect = document.getElementById('privacy-level');
    const privacyIndicator = document.querySelector('.privacy-indicator');
    
    if (privacySelect && privacyIndicator) {
        privacySelect.addEventListener('change', function() {
            // Update indicator class
            privacyIndicator.className = 'privacy-indicator ' + this.value;
        });
    }
    
    console.log('Privacy controls added');
}
