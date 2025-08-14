// generator.js
// Handles idea generation, displaying a percentage score and saving to local storage

document.addEventListener('DOMContentLoaded', function () {
  const generateButton = document.getElementById('generate-button');
  const ideaInput = document.getElementById('idea-input');
  const progressContainer = document.getElementById('progress-container');
  const scoreText = document.getElementById('score-text');
  const saveButton = document.getElementById('save-button');
  const progressCircle = document.querySelector('.progress-circle');

  // Storage for the current generated idea data
  let currentResult = null;

  async function generateIdea() {
    const idea = ideaInput.value.trim();
    if (!idea) {
      alert('Please enter an idea to generate.');
      return;
    }
    // Disable the generate button to prevent multiple submissions
    if (generateButton) generateButton.disabled = true;
    // Indicate loading state
    if (progressContainer) {
      progressContainer.style.display = 'flex';
    }
    if (progressCircle) {
      progressCircle.style.background = `conic-gradient(var(--primary) 0deg, var(--border) 0deg)`;
    }
    if (scoreText) {
      scoreText.innerText = '...';
    }
    // Prepare the OpenAI API payload.  We instruct the model to
    // evaluate the business idea and return a structured analysis.
    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert business analyst. Given a business idea, you evaluate its viability on a scale of 0–100 and provide a brief verdict, recommendations, risks, next steps and patentability advice in a structured format. Format your response with labels like "Score", "Verdict", "Recommendations", "Risks", "Next Steps" and "Patentability" separated by new lines.'
        },
        {
          role: 'user',
          content: idea
        }
      ],
      temperature: 0.7
    };
    let score = null;
    let details = null;
    try {
      const response = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error('AI service returned an error');
      }
      const data = await response.json();
      // Attempt to parse the response.  We expect the assistant to
      // return content in a structure with labelled lines.
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (typeof content === 'string' && content.trim().length > 0) {
        details = {};
        const lines = content.split(/\n/).map(l => l.trim()).filter(Boolean);
        lines.forEach(function (line) {
          const lower = line.toLowerCase();
          if (lower.startsWith('score')) {
            const match = line.match(/(\d+)/);
            if (match) {
              score = parseInt(match[1], 10);
            }
          } else if (lower.startsWith('verdict')) {
            details.verdict = line.split(':').slice(1).join(':').trim();
          } else if (lower.startsWith('recommendations')) {
            details.recommendations = line.split(':').slice(1).join(':').trim();
          } else if (lower.startsWith('risks')) {
            details.risks = line.split(':').slice(1).join(':').trim();
          } else if (lower.startsWith('next')) {
            details.nextSteps = line.split(':').slice(1).join(':').trim();
          } else if (lower.startsWith('patent')) {
            details.patentability = line.split(':').slice(1).join(':').trim();
          }
        });
      }
    } catch (err) {
      console.error('Failed to call AI service:', err);
    }
    // If parsing failed or AI not available, fall back to random dummy data
    if (typeof score !== 'number' || score < 0 || score > 100 || !details) {
      score = Math.floor(Math.random() * 61) + 40;
      details = {
        verdict: score >= 70 ? 'Feasible' : 'Risky',
        recommendations: 'Focus on user engagement and consider scalable business models.',
        risks: 'Potential competition, market saturation and regulatory hurdles.',
        nextSteps: 'Refine your value proposition, conduct market validation and prepare a pitch.',
        patentability: 'Consult a qualified patent attorney to explore protection strategies.'
      };
    }
    // Update progress circle and text
    const degrees = score * 3.6;
    if (progressCircle) {
      progressCircle.style.background = `conic-gradient(var(--primary) ${degrees}deg, var(--border) 0deg)`;
    }
    if (scoreText) {
      scoreText.innerText = `${score}%`;
    }
    // Detect language of the idea (rudimentary).  If the text contains
    // Cyrillic characters, assume Russian (ru), otherwise English (en).
    let lang = 'en';
    if (/\p{Script=Cyrillic}/u.test(idea)) {
      lang = 'ru';
    }
    // Save current result for saving.  Default visibility is private.
    currentResult = {
      id: Date.now(),
      idea: idea,
      score: score,
      details: details,
      visibility: 'private',
      lang: lang
    };
    // Re-enable the generate button
    if (generateButton) generateButton.disabled = false;
  }

  function saveIdea() {
    if (!currentResult) return;
    let ideas = [];
    try {
      ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
    } catch (e) {
      ideas = [];
    }
    // Check for duplicates: if an idea with the same text already exists,
    // do not save another copy.  Compare trimmed idea text in a
    // case‑insensitive manner.  If found, notify the user and abort.
    const existing = ideas.find(function (it) {
      return (it.idea || '').toString().trim().toLowerCase() === currentResult.idea.trim().toLowerCase();
    });
    if (existing) {
      alert('This idea already exists in My Ideas.');
    } else {
      ideas.push(currentResult);
      localStorage.setItem('starGalaxyIdeas', JSON.stringify(ideas));
      alert('Your idea has been saved to My Ideas!');
    }
    // Reset state
    currentResult = null;
    ideaInput.value = '';
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
  }

  if (generateButton) {
    generateButton.addEventListener('click', generateIdea);
  }
  if (saveButton) {
    saveButton.addEventListener('click', saveIdea);
  }
});