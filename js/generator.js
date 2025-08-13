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

  function generateIdea() {
    const idea = ideaInput.value.trim();
    if (!idea) {
      alert('Please enter an idea to generate.');
      return;
    }
    // Generate a pseudo‑random score between 40 and 100
    const score = Math.floor(Math.random() * 61) + 40;
    // Update the conic gradient to reflect the score
    const degrees = score * 3.6;
    if (progressCircle) {
      progressCircle.style.background = `conic-gradient(var(--primary) ${degrees}deg, var(--border) 0deg)`;
    }
    if (scoreText) {
      scoreText.innerText = `${score}%`;
    }
    // Show the progress container
    if (progressContainer) {
      progressContainer.style.display = 'flex';
    }
    // Build dummy analysis details for later use
    const details = {
      verdict: score >= 70 ? 'Feasible' : 'Risky',
      recommendations: 'Focus on user engagement and consider scalable business models.',
      risks: 'Potential competition, market saturation and regulatory hurdles.',
      nextSteps: 'Refine your value proposition, conduct market validation and prepare a pitch.',
      patentability: 'Consult a qualified patent attorney to explore protection strategies.'
    };
    currentResult = {
      id: Date.now(),
      idea: idea,
      score: score,
      details: details
    };
  }

  function saveIdea() {
    if (!currentResult) return;
    let ideas = [];
    try {
      ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
    } catch (e) {
      ideas = [];
    }
    ideas.push(currentResult);
    localStorage.setItem('starGalaxyIdeas', JSON.stringify(ideas));
    // Reset state
    currentResult = null;
    ideaInput.value = '';
    if (progressContainer) {
      progressContainer.style.display = 'none';
    }
    alert('Your idea has been saved to My Ideas!');
  }

  if (generateButton) {
    generateButton.addEventListener('click', generateIdea);
  }
  if (saveButton) {
    saveButton.addEventListener('click', saveIdea);
  }
});