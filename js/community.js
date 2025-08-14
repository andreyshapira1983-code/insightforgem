// community.js
// Provides simple group chat functionality and renders user profiles on the community page

document.addEventListener('DOMContentLoaded', function () {
  // Chat implementation
  const messagesContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('chat-send');

  // Load stored messages or start empty
  function loadMessages() {
    let msgs = [];
    try {
      msgs = JSON.parse(localStorage.getItem('starGalaxyChatMessages')) || [];
    } catch (e) {
      msgs = [];
    }
    return msgs;
  }

  function saveMessages(msgs) {
    localStorage.setItem('starGalaxyChatMessages', JSON.stringify(msgs));
  }

  function renderMessages() {
    const msgs = loadMessages();
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';
    msgs.forEach(function (msg) {
      var div = document.createElement('div');
      div.className = 'chat-message';
      var timeStr = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      var senderSpan = document.createElement('span');
      senderSpan.className = 'sender';
      senderSpan.textContent = msg.user;
      var messageSpan = document.createElement('span');
      messageSpan.className = 'message-text';
      messageSpan.textContent = msg.text;
      var timeSpan = document.createElement('span');
      timeSpan.className = 'message-time';
      timeSpan.style.fontSize = '0.8em';
      timeSpan.style.opacity = '0.6';
      timeSpan.style.marginLeft = '6px';
      timeSpan.textContent = timeStr;
      div.appendChild(senderSpan);
      div.appendChild(document.createTextNode(' '));
      div.appendChild(messageSpan);
      div.appendChild(document.createTextNode(' '));
      div.appendChild(timeSpan);
      messagesContainer.appendChild(div);
    });
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    const authData = localStorage.getItem('starGalaxyAuth');
    const userName = authData ? JSON.parse(authData).provider.toUpperCase() : 'Guest';
    const msgs = loadMessages();
    msgs.push({ user: userName, text: text, time: Date.now() });
    saveMessages(msgs);
    chatInput.value = '';
    renderMessages();
  }

  if (sendButton) {
    sendButton.addEventListener('click', function () {
      sendMessage();
    });
  }
  if (chatInput) {
    chatInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Profiles rendering
  const profileContainer = document.getElementById('profile-list');
  function renderProfiles() {
    if (!profileContainer) return;
    profileContainer.innerHTML = '';
    const profiles = [];
    // Current user profile
    const auth = localStorage.getItem('starGalaxyAuth');
    if (auth) {
      const { provider, userName } = JSON.parse(auth);
      // Determine number of saved ideas
      let ideas = [];
      try {
        ideas = JSON.parse(localStorage.getItem('starGalaxyIdeas')) || [];
      } catch (e) {
        ideas = [];
      }
      profiles.push({
        name: provider.charAt(0).toUpperCase() + provider.slice(1),
        initial: userName,
        description: `Signed in via ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
        ideaCount: ideas.length
      });
    }
    // Sample profiles for demonstration
    profiles.push({
      name: 'Alice',
      initial: 'A',
      description: 'AI researcher exploring new frontiers.',
      ideaCount: 5
    });
    profiles.push({
      name: 'Bob',
      initial: 'B',
      description: 'Entrepreneur passionate about sustainable tech.',
      ideaCount: 3
    });
    profiles.forEach(function (prof) {
      const item = document.createElement('div');
      item.className = 'profile-item';
      item.innerHTML = `
        <div class="profile-photo">${prof.initial}</div>
        <div class="profile-info">
          <h3>${prof.name}</h3>
          <p>${prof.description}</p>
          <p style="font-size:0.8rem; opacity:0.8;">Ideas: ${prof.ideaCount}</p>
        </div>
      `;
      profileContainer.appendChild(item);
    });
  }

  // Initialize chat and profiles
  renderMessages();
  renderProfiles();
});