// main.js
// Handles global authentication UI and user state across pages

document.addEventListener('DOMContentLoaded', function () {
  const signInButton = document.getElementById('sign-in-button');
  const authModal = document.getElementById('auth-modal');
  const authModalClose = document.querySelector('.auth-modal-close');
  const socialAuthButtons = document.querySelectorAll('.social-auth-button');
  const userProfile = document.getElementById('user-profile');

  // Show the modal
  function openAuthModal() {
    if (authModal) {
      authModal.classList.add('active');
    }
  }

  // Hide the modal
  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('active');
    }
  }

  // Simulate login by saving provider and generating a simple user name
  function simulateLogin(provider) {
    const nameMap = {
      google: 'G',
      facebook: 'F',
      github: 'GH',
      apple: 'A',
      email: 'U'
    };
    const userName = nameMap[provider] || 'U';
    const authState = { provider, userName };
    localStorage.setItem('starGalaxyAuth', JSON.stringify(authState));
    updateAuthUI();
    closeAuthModal();
  }

  // Remove auth state on logout
  function simulateLogout() {
    localStorage.removeItem('starGalaxyAuth');
    updateAuthUI();
  }

  // Update the UI based on whether a user is logged in or not
  function updateAuthUI() {
    const data = localStorage.getItem('starGalaxyAuth');
    if (data) {
      const { userName } = JSON.parse(data);
      // Hide sign in button
      if (signInButton) signInButton.style.display = 'none';
      // Show profile with initial
      if (userProfile) {
        userProfile.innerHTML = `
          <span class="user-avatar">${userName}</span>
          <div class="user-menu">
            <a href="ideas.html">My Ideas</a>
            <a href="#" id="logout-link">Sign Out</a>
          </div>
        `;
        userProfile.style.display = 'flex';
        // Bind logout click
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
          logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            simulateLogout();
          });
        }
        // Toggle profile menu on click to avoid disappearing on hover
        userProfile.addEventListener('click', function (e) {
          // Prevent the click from triggering the logout anchor if clicked on the link
          if (e.target && e.target.id === 'logout-link') {
            return;
          }
          // Toggle the 'open' class on the profile container
          if (userProfile.classList.contains('open')) {
            userProfile.classList.remove('open');
          } else {
            userProfile.classList.add('open');
          }
        });
      }
    } else {
      // Show sign in
      if (signInButton) signInButton.style.display = 'inline-block';
      if (userProfile) {
        userProfile.innerHTML = '';
        userProfile.style.display = 'none';
        userProfile.classList.remove('open');
      }
    }
  }

  // Attach event listeners
  if (signInButton) {
    signInButton.addEventListener('click', function () {
      openAuthModal();
    });
  }
  if (authModalClose) {
    authModalClose.addEventListener('click', function () {
      closeAuthModal();
    });
  }
  if (authModal) {
    authModal.addEventListener('click', function (e) {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }
  socialAuthButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const provider = this.dataset.provider;
      simulateLogin(provider);
    });
  });

  // Initialize UI on load
  updateAuthUI();
});
