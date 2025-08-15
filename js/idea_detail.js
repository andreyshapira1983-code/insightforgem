// idea_detail.js
// Displays the details of a single idea based on query parameter id

document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('idea-details');
  if (!id || !container) {
    if (container) {
      container.innerHTML = '<p>Idea not found.</p>';
    }
    return;
  }
  let ideas = [];
  try {
    ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
  } catch (e) {
    ideas = [];
  }
  const idea = ideas.find(function (item) { return String(item.id) === String(id); });
  if (!idea) {
    container.textContent = 'Idea not found.';
    return;
  }
  var text = idea.idea;
  var score = idea.score;
  var details = idea.details;
  // Clear existing content
  container.textContent = '';
  // Title
  var h2 = document.createElement('h2');
  h2.textContent = text;
  container.appendChild(h2);
  // Score circle
  var scoreDiv = document.createElement('div');
  scoreDiv.className = 'score-circle big';
  scoreDiv.textContent = score + '%';
  container.appendChild(scoreDiv);
  // Visibility and language controls
  var metaDiv = document.createElement('div');
  metaDiv.className = 'idea-meta';
  // Visibility label and select
  var visLabel = document.createElement('label');
  visLabel.textContent = 'Visibility: ';
  var visSelect = document.createElement('select');
  ['private', 'link', 'shared', 'public'].forEach(function (opt) {
    var optionEl = document.createElement('option');
    optionEl.value = opt;
    optionEl.textContent = opt;
    if (idea.visibility === opt) optionEl.selected = true;
    visSelect.appendChild(optionEl);
  });
  visSelect.addEventListener('change', function () {
    var newVal = this.value;
    idea.visibility = newVal;
    // Persist change to local storage
    var all = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
    var idx = all.findIndex(function (it) { return String(it.id) === String(id); });
    if (idx >= 0) {
      all[idx].visibility = newVal;
      localStorage.setItem('starGalaxyIdeas', JSON.stringify(all));
    }
    // If new visibility is public or link, update share link display
    updateShareLink();
  });
  visLabel.appendChild(visSelect);
  metaDiv.appendChild(visLabel);
  // Language display
  var langSpan = document.createElement('span');
  langSpan.style.marginLeft = '16px';
  langSpan.textContent = 'Language: ' + (idea.lang || '');
  metaDiv.appendChild(langSpan);
  container.appendChild(metaDiv);

  // Share link area
  var shareDiv = document.createElement('div');
  shareDiv.className = 'idea-share';
  shareDiv.style.marginTop = '8px';
  var shareInput = document.createElement('input');
  shareInput.type = 'text';
  shareInput.readOnly = true;
  shareInput.style.width = '100%';
  shareInput.style.display = 'none';
  var copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy Link';
  copyBtn.className = 'cosmic-button';
  copyBtn.style.display = 'none';
  copyBtn.addEventListener('click', function () {
    shareInput.select();
    try {
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.textContent = 'Copy Link'; }, 2000);
    } catch (err) {
      // fallback
    }
  });
  shareDiv.appendChild(shareInput);
  shareDiv.appendChild(copyBtn);
  container.appendChild(shareDiv);
  // Function to update share link display based on visibility
  function updateShareLink() {
    if (idea.visibility === 'public' || idea.visibility === 'link') {
      var url = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(id);
      shareInput.value = url;
      shareInput.style.display = 'inline-block';
      copyBtn.style.display = 'inline-block';
    } else {
      shareInput.style.display = 'none';
      copyBtn.style.display = 'none';
    }
  }
  updateShareLink();
  // Helper to add section
  function addSection(title, content) {
    var h3 = document.createElement('h3');
    h3.textContent = title;
    container.appendChild(h3);
    var p = document.createElement('p');
    p.textContent = content;
    container.appendChild(p);
  }
  addSection('Verdict', details.verdict);
  addSection('Recommendations', details.recommendations);
  addSection('Risks', details.risks);
  addSection('Next Steps', details.nextSteps);
  addSection('Patentability', details.patentability);
});
