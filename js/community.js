// community.js
// Provides simple group chat functionality and renders user profiles on the community page

document.addEventListener('DOMContentLoaded', function () {
  // Element references
  const messagesContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('chat-send');
  const channelList = document.getElementById('channel-list');
  const channelTitle = document.getElementById('channel-title');
  const membersList = document.getElementById('members-online');
  const pinnedList = document.getElementById('pinned-items');

  // Current channel (defaults to public)
  let currentChannel = 'public';

      // In‑memory chat storage keyed by channel.  Messages are no longer
      // persisted in localStorage.
      window.starGalaxyChatStorage = window.starGalaxyChatStorage || {};

      function loadMessages(channel) {
        return window.starGalaxyChatStorage[channel] || [];
      }

      function saveMessages(channel, msgs) {
        window.starGalaxyChatStorage[channel] = msgs;
      }

  // Render the list of messages for the current channel
  function renderMessages() {
    const msgs = loadMessages(currentChannel);
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';
    msgs.forEach(function (msg) {
      const div = document.createElement('div');
      div.className = 'chat-message';
      const timeStr = new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const senderSpan = document.createElement('span');
      senderSpan.className = 'sender';
      senderSpan.textContent = msg.user;
      const messageSpan = document.createElement('span');
      messageSpan.className = 'message-text';
      messageSpan.textContent = msg.text;
      const timeSpan = document.createElement('span');
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

  // Send a message in the current channel
  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
         // Use the in‑memory auth state to derive a user name.  If the
         // user is not authenticated, default to 'Guest'.
         const authData = window.starGalaxyAuthState;
         const userName = authData ? authData.provider.toUpperCase() : 'Guest';
    const msgs = loadMessages(currentChannel);
    msgs.push({ user: userName, text: text, time: Date.now() });
    saveMessages(currentChannel, msgs);
    chatInput.value = '';
    renderMessages();
  }

  // Change current channel
  function switchChannel(channel) {
    currentChannel = channel;
    // Update active class in channel list
    document.querySelectorAll('.channel-item').forEach(function (li) {
      if (li.dataset.channel === channel) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });
    // Update channel title
    if (channelTitle) channelTitle.textContent = '#' + channel;
    // Render messages for new channel
    renderMessages();
  }

  // Bind channel clicks
  if (channelList) {
    channelList.addEventListener('click', function (e) {
      const li = e.target.closest('.channel-item');
      if (li) {
        switchChannel(li.dataset.channel);
      }
    });
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

  // Render members (static list for now)
  function renderMembers() {
    if (!membersList) return;
    membersList.innerHTML = '';
    const members = ['Alice', 'Bob', 'Charlie', 'Dana'];
    members.forEach(function (name) {
      const li = document.createElement('li');
      li.textContent = name;
      membersList.appendChild(li);
    });
  }
  // Render pinned items (static list for now)
  function renderPinned() {
    if (!pinnedList) return;
    pinnedList.innerHTML = '';
    const pinned = [
      'Welcome to the community!',
      'Check out the resources page for helpful links.'
    ];
    pinned.forEach(function (txt) {
      const li = document.createElement('li');
      li.textContent = txt;
      pinnedList.appendChild(li);
    });
  }

  // Initialize chat and sidebars
  renderMessages();
  renderMembers();
  renderPinned();
});