/**
 * Star Galaxy - AI Analysis Functions
 * Handles idea analysis and result generation
 */

function analyzeWithAI() {
    console.log('Analyzing with AI...');

    const ideaText = document.getElementById('idea-text')?.value?.trim();
    const resultsContainer = document.getElementById('results-container');
    const selectedMode = document.querySelector('.ai-option.selected')?.getAttribute('data-mode') || 'analyze';

    if (!ideaText || !resultsContainer) {
        console.error('Missing idea text or results container');
        return;
    }

    // Show loading state
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
        <div class="ai-thinking">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
        <p>Generating comprehensive analysis...</p>
    `;

    // Generate mock results (since we don't have a real API)
    setTimeout(() => {
        displayMockResults(ideaText, selectedMode);
    }, 2000);
}

function displayMockResults(ideaText, mode) {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    
    // Generate truly random but consistent scores based on the idea text and current time
    // This ensures different results for different inputs and modes
    const currentDate = new Date();
    const timeInfluence = currentDate.getMinutes() + currentDate.getSeconds();
    
    // Create a hash from the idea text - different texts will produce different values
    const ideaHash = Array.from(ideaText).reduce((acc, char, index) => 
        acc + (char.charCodeAt(0) * (index + 1)), 0);
    
    // Combine idea hash with mode and time for varied results
    const modeMultiplier = mode === 'analyze' ? 1 : mode === 'market' ? 1.2 : 0.8;
    const seedBase = (ideaHash * modeMultiplier + timeInfluence) % 100;
    
    // Generate scores with some randomness but influenced by the input
    const randomFactor = Math.random() * 15 - 7.5; // -7.5 to +7.5
    
    // Calculate scores based on idea length, content, and selected mode
    let feasibilityBase = 50 + (ideaText.length % 20);
    let marketBase = 45 + (countKeywords(ideaText, ['market', 'customer', 'need', 'solution', 'problem']) * 5);
    let innovationBase = 40 + (countKeywords(ideaText, ['new', 'innovative', 'unique', 'first', 'revolutionary']) * 5);
    
    // Adjust based on mode
    if ( mode === 'market') {
        marketBase += 15;
        feasibilityBase -= 5;
    } else if ( mode === 'improve') {
        innovationBase += 15;
        marketBase -= 5;
    } else { // analyze
        feasibilityBase += 10;
    }
    
    // Apply seed influence and clamp values
    const feasibilityScore = Math.max(30, Math.min(98, Math.round(feasibilityBase + (seedBase % 15) + randomFactor)));
    const marketScore = Math.max(30, Math.min(98, Math.round(marketBase + ((seedBase * 1.3) % 15) + randomFactor)));
    const innovationScore = Math.max(30, Math.min(98, Math.round(innovationBase + ((seedBase * 0.7) % 15) + randomFactor)));
    
    // Generate different analysis text based on the scores and mode
    let analysisText = '';
    
    if ( mode === 'market') {
        analysisText = `Market analysis for "${truncateText(ideaText, 40)}"\n\n`;
        
        if (marketScore > 75) {
            analysisText += `Market potential is very high (${marketScore}%). There is significant demand for such solutions. `;
            analysisText += `Our analysis indicates strong growth potential in this sector.\n\n`;
        } else if (marketScore > 50) {
            analysisText += `Market potential is moderate (${marketScore}%). There is some interest in such solutions. `;
            analysisText += `The market is competitive but has room for new entrants with the right approach.\n\n`;
        } else {
            analysisText += `Market potential is limited (${marketScore}%). You might want to reconsider your target audience. `;
            analysisText += `Consider pivoting to address a more promising market segment.\n\n`;
        }
        
        analysisText += `Target audience: ${generateTargetAudience(ideaText)}\n\n`;
        analysisText += `Recommendations for development:\n`;
        analysisText += `• Conduct detailed target audience research\n`;
        analysisText += `• Study existing competitors: ${generateCompetitors(ideaText)}\n`;
        analysisText += `• Define a unique selling proposition\n`;
        analysisText += `• Consider ${generateMarketingStrategy(ideaText)} as a marketing strategy`;
    } 
    else if ( mode === 'improve') {
        analysisText = `Improvement suggestions for "${truncateText(ideaText, 40)}"\n\n`;
        
        if (innovationScore < 60) {
            analysisText += `Your idea needs more innovation. Consider integrating new technologies or approaches.\n\n`;
        } else if (innovationScore > 80) {
            analysisText += `Your idea shows strong innovation potential. Focus on practical implementation.\n\n`;
        } else {
            analysisText += `Your idea has some innovative elements but could be enhanced further.\n\n`;
        }
        
        analysisText += `Possible improvements:\n`;
        analysisText += `• ${generateImprovement1(ideaText)}\n`;
        analysisText += `• ${generateImprovement2(ideaText)}\n`;
        analysisText += `• ${generateImprovement3(ideaText)}\n`;
        analysisText += `• ${generateImprovement4(ideaText)}`;
    }
    else { // analyze mode (default)
        analysisText = `Analysis of "${truncateText(ideaText, 40)}"\n\n`;
        
        if (feasibilityScore > 75) {
            analysisText += `Feasibility: High (${feasibilityScore}%). The idea is technically achievable with available technologies.\n\n`;
        } else if (feasibilityScore > 50) {
            analysisText += `Feasibility: Moderate (${feasibilityScore}%). Will require certain technical resources and expertise.\n\n`;
        } else {
            analysisText += `Feasibility: Low (${feasibilityScore}%). The idea may face significant technical challenges.\n\n`;
        }
        
        if (marketScore > 75) {
            analysisText += `Market Potential: High (${marketScore}%). There is significant demand and growth opportunity.\n\n`;
        } else if (marketScore > 50) {
            analysisText += `Market Potential: Moderate (${marketScore}%). There is some interest in the market.\n\n`;
        } else {
            analysisText += `Market Potential: Low (${marketScore}%). The market may be limited or saturated.\n\n`;
        }
        
        if (innovationScore > 75) {
            analysisText += `Innovation: High (${innovationScore}%). The idea offers a new approach to solving a problem.`;
        } else if (innovationScore > 50) {
            analysisText += `Innovation: Moderate (${innovationScore}%). The idea contains some innovative elements.`;
        } else {
            analysisText += `Innovation: Low (${innovationScore}%). The idea is not particularly different from existing solutions.`;
        }
    }
    
    // Display the dynamic mock results
    resultsContainer.innerHTML = `
        <h3>Analysis Results</h3>
        <div class="analysis-summary">
            ${analysisText.replace(/\n/g, '<br>')}
        </div>
        
        <div class="scores-container">
            <div class="score-item">
                <div class="score-title">Feasibility</div>
                <div class="score-circle ${getScoreClass(feasibilityScore/100)}">
                    <div class="score-value">${feasibilityScore}%</div>
                </div>
            </div>
            
            <div class="score-item">
                <div class="score-title">Market Potential</div>
                <div class="score-circle ${getScoreClass(marketScore/100)}">
                    <div class="score-value">${marketScore}%</div>
                </div>
            </div>
            
            <div class="score-item">
                <div class="score-title">Innovation</div>
                <div class="score-circle ${getScoreClass(innovationScore/100)}">
                    <div class="score-value">${innovationScore}%</div>
                </div>
            </div>
        </div>
    `;
    
    // Add score styles if not already present
    if (!document.getElementById('enhanced-results-styles')) {
        const style = document.createElement('style');
        style.id = 'enhanced-results-styles';
        style.textContent = `
            .analysis-summary {
                margin-bottom: 25px;
                line-height: 1.6;
            }
            
            .scores-container {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                flex-wrap: wrap;
            }
            
            .score-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 30%;
                min-width: 100px;
            }
            
            .score-title {
                margin-bottom: 10px;
                font-weight: 600;
                text-align: center;
            }
            
            .score-circle {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 18px;
                position: relative;
                background: var(--card);
                border: 3px solid;
            }
            
            .score-circle.poor {
                border-color: #ff6b6b;
                box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
            }
            
            .score-circle.medium {
                border-color: #ffd166;
                box-shadow: 0 0 15px rgba(255, 209, 102, 0.3);
            }
            
            .score-circle.good {
                border-color: #06d6a0;
                box-shadow: 0 0 15px rgba(6, 214, 160, 0.3);
            }
            
            .ai-thinking {
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 20px 0;
            }
            
            .ai-thinking .dot {
                width: 8px;
                height: 8px;
                background-color: var(--primary);
                border-radius: 50%;
                margin: 0 4px;
                animation: pulse 1.5s infinite ease-in-out;
            }
            
            .ai-thinking .dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .ai-thinking .dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(0.9); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
            }
            
            @media (max-width: 600px) {
                .scores-container {
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                
                .score-item {
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Helper function to count keywords in text
function countKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.reduce((count, keyword) => {
        const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
        const matches = lowerText.match(regex) || [];
        return count + matches.length;
    }, 0);
}

// Helper functions to generate varied content
function generateTargetAudience(idea) {
    const audiences = [
        "Young professionals (25-34)",
        "Small business owners",
        "Enterprise companies",
        "Tech enthusiasts",
        "Parents with young children",
        "Health-conscious consumers",
        "Remote workers",
        "Students and educators",
        "Urban millennials",
        "Senior citizens"
    ];
    
    // Select based on idea content
    if (idea.toLowerCase().includes('health') || idea.toLowerCase().includes('fitness')) {
        return "Health-conscious consumers aged 25-45";
    } else if (idea.toLowerCase().includes('business') || idea.toLowerCase().includes('enterprise')) {
        return "Small to medium businesses and corporate clients";
    } else if (idea.toLowerCase().includes('education') || idea.toLowerCase().includes('learn')) {
        return "Students and educators in K-12 and higher education";
    } else if (idea.toLowerCase().includes('senior') || idea.toLowerCase().includes('elder')) {
        return "Senior citizens and their caregivers";
    } else {
        // Pick semi-randomly based on idea length
        return audiences[idea.length % audiences.length];
    }
}

function generateCompetitors(idea) {
    const competitors = [
        "established market leaders",
        "emerging startups",
        "international corporations",
        "local specialized businesses",
        "digital platforms",
        "traditional service providers",
        "direct-to-consumer brands",
        "subscription-based services"
    ];
    
    // Pick semi-randomly based on idea length
    return competitors[idea.length % competitors.length];
}

function generateMarketingStrategy(idea) {
    const strategies = [
        "content marketing",
        "social media campaigns",
        "influencer partnerships",
        "SEO optimization",
        "email marketing",
        "community building",
        "referral programs",
        "freemium model",
        "B2B partnerships",
        "trade show presence"
    ];
    
    // Pick semi-randomly based on idea length
    return strategies[(idea.length * 2) % strategies.length];
}

function generateImprovement1(idea) {
    const improvements = [
        "Add personalization elements for users",
        "Implement AI-driven recommendations",
        "Create a mobile-first approach",
        "Develop a subscription-based revenue model",
        "Add social sharing capabilities",
        "Integrate with popular platforms and services",
        "Focus on accessibility features",
        "Create a community around your product"
    ];
    
    return improvements[idea.length % improvements.length];
}

function generateImprovement2(idea) {
    const improvements = [
        "Consider integration with existing platforms",
        "Explore blockchain technology for added security",
        "Add gamification elements to increase engagement",
        "Implement user feedback loops for continuous improvement",
        "Create strategic partnerships with complementary services",
        "Develop an API for third-party integrations",
        "Focus on scalable infrastructure from the start",
        "Consider internationalization for global markets"
    ];
    
    return improvements[(idea.length + 3) % improvements.length];
}

function generateImprovement3(idea) {
    const improvements = [
        "Think about the scalability of your solution",
        "Add data analytics to track user behavior",
        "Implement A/B testing for key features",
        "Create a clear onboarding process for new users",
        "Develop a comprehensive content strategy",
        "Focus on reducing friction in the user journey",
        "Consider sustainability aspects of your product",
        "Add premium features for power users"
    ];
    
    return improvements[(idea.length + 5) % improvements.length];
}

function generateImprovement4(idea) {
    const improvements = [
        "Develop a clear monetization strategy",
        "Create a roadmap for feature development",
        "Focus on building a strong brand identity",
        "Implement robust security measures from the start",
        "Consider regulatory compliance requirements",
        "Develop a customer support strategy",
        "Create educational content around your product",
        "Build strategic partnerships in your industry"
    ];
    
    return improvements[(idea.length + 7) % improvements.length];
}

// Helper function to truncate text with ellipsis
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function getScoreClass(score) {
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'medium';
    return 'poor';
}
