/**
 * Star Galaxy - Legal Norms Analysis
 * This file contains functions to analyze ideas against legal frameworks worldwide
 */

function analyzeIdeaForLegalNorms(idea) {
    const lowerIdea: idea.toLowerCase();
    
    // Generate different results based on keywords in the idea
    const results = {
        summary: "Your idea has been analyzed against legal frameworks in major global markets.",
        general: [
            { text: "Intellectual property protection should be a priority for this idea.", alert: false },
            { text: "Consider trademark registration in your primary markets.", alert: false }
        ],
        us: [
            { text: "US patent application should be filed within one year of public disclosure.", alert: false },
            { text: "Compliance with FTC regulations may be required for consumer-facing aspects.", alert: false }
        ],
        eu: [
            { text: "GDPR compliance will be necessary if collecting user data.", alert: true },
            { text: "EU trademark registration provides protection across all member states.", alert: false }
        ],
        asia: [
            { text: "China requires separate patent and trademark filings.", alert: false },
            { text: "Japan has specific requirements for software patents.", alert: false }
        ],
        other: [
            { text: "Consider PCT application for international patent protection.", alert: false },
            { text: "Many countries operate on a first-to-file patent system.", alert: false }
        ]
    };
    
    // Add specific legal considerations based on idea content
    if (lowerIdea.includes('data') || lowerIdea.includes('user information')) {
        results.general.push({ text: "Data protection laws apply in most jurisdictions for this type of idea.", alert: true });
        results.us.push({ text: "May require compliance with CCPA in California if collecting personal data.", alert: true });
        results.eu.push({ text: "GDPR requires explicit consent for data collection and processing.", alert: true });
    }
    
    if (lowerIdea.includes('health') || lowerIdea.includes('medical')) {
        results.general.push({ text: "Health-related ideas face strict regulatory requirements in most countries.", alert: true });
        results.us.push({ text: "FDA approval may be required before market entry.", alert: true });
        results.eu.push({ text: "Compliance with EU Medical Device Regulation may be necessary.", alert: true });
        results.asia.push({ text: "China's NMPA has specific requirements for health-related products.", alert: true });
    }
    
    if (lowerIdea.includes('finance') || lowerIdea.includes('payment')) {
        results.general.push({ text: "Financial services are heavily regulated worldwide.", alert: true });
        results.us.push({ text: "May require compliance with SEC regulations and state banking laws.", alert: true });
        results.eu.push({ text: "PSD2 compliance required for payment services in the EU.", alert: true });
        results.asia.push({ text: "Financial licensing requirements vary significantly across Asian markets.", alert: true });
    }
    
    if (lowerIdea.includes('children') || lowerIdea.includes('kids')) {
        results.general.push({ text: "Products/services for children face additional regulatory requirements.", alert: true });
        results.us.push({ text: "COPPA compliance required for online services used by children under 13.", alert: true });
        results.eu.push({ text: "Enhanced GDPR protections apply for data of children under 16.", alert: true });
    }
    
    return results;
}

// Make the function available globally
window.analyzeIdeaForLegalNorms = analyzeIdeaForLegalNorms;
