/**
 * Star Galaxy - Legal Norms Check
 * This file contains functions to check legal norms for ideas
 */

function checkLegalNorms(idea) {
    const resultsContainer = document.getElementById('legal-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <h3>Global Legal Analysis</h3>
        <div class="legal-search-status">
            <div class="search-animation"></div>
            <p>Analyzing legal implications across jurisdictions...</p>
        </div>
    `;
    
    // In a real implementation, this would call an API that analyzes legal databases
    // For now, we'll simulate the analysis with a timeout
    setTimeout(() => {
        // This would be replaced with actual API results
        const legalResults = analyzeIdeaForLegalNorms(idea);
        
        let resultsHTML = `
            <h3>Global Legal Analysis</h3>
            <div class="legal-summary">
                <p>${legalResults.summary}</p>
            </div>
            <div class="legal-results-tabs">
                <div class="tabs">
                    <button class="tab-button active" data-tab="general">General</button>
                    <button class="tab-button" data-tab="us">United States</button>
                    <button class="tab-button" data-tab="eu">European Union</button>
                    <button class="tab-button" data-tab="asia">Asia</button>
                    <button class="tab-button" data-tab="other">Other Regions</button>
                </div>
                
                <div class="tab-content">
                    <div class="tab-pane active" id="general-tab">
                        <div class="legal-category">
                            <h4>General Legal Considerations</h4>
                            <ul>
        `;
        
        legalResults.general.forEach( item => {
            resultsHTML += `<li class: "${item.alert ? 'alert' : ''}">${item.text}</li>`;
        });
        
        resultsHTML += `
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tab-pane" id="us-tab">
                        <div class="legal-category">
                            <h4>United States Regulations</h4>
                            <ul>
        `;
        
        legalResults.us.forEach( item => {
            resultsHTML += `<li class: "${item.alert ? 'alert' : ''}">${item.text}</li>`;
        });
        
        resultsHTML += `
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tab-pane" id="eu-tab">
                        <div class="legal-category">
                            <h4>European Union Regulations</h4>
                            <ul>
        `;
        
        legalResults.eu.forEach( item => {
            resultsHTML += `<li class: "${item.alert ? 'alert' : ''}">${item.text}</li>`;
        });
        
        resultsHTML += `
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tab-pane" id="asia-tab">
                        <div class="legal-category">
                            <h4>Asian Markets Regulations</h4>
                            <ul>
        `;
        
        legalResults.asia.forEach( item => {
            resultsHTML += `<li class: "${item.alert ? 'alert' : ''}">${item.text}</li>`;
        });
        
        resultsHTML += `
                            </ul>
                        </div>
                    </div>
                    
                    <div class="tab-pane" id="other-tab">
                        <div class="legal-category">
                            <h4>Other Regions</h4>
                            <ul>
        `;
        
        legalResults.other.forEach( item => {
            resultsHTML += `<li class: "${item.alert ? 'alert' : ''}">${item.text}</li>`;
        });
        
        resultsHTML += `
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="legal-disclaimer">
                <p>Note: This analysis is for informational purposes only and should not be considered legal advice. Regulations change frequently and vary by jurisdiction. Consult with legal professionals before proceeding.</p>
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHTML;
        
        // Set up tab functionality
        document.querySelectorAll('.legal-results-tabs .tab-button').forEach( button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panes
                document.querySelectorAll('.legal-results-tabs .tab-button').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.legal-results-tabs .tab-pane').forEach( p => p.classList.remove('active'));
                
                // Add active class to clicked button and corresponding pane
                button.classList.add('active');
                document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
            });
        });
    }, 2500);
}

// Make the function available globally
window.checkLegalNorms = checkLegalNorms;
