
// auth-fix.js — robust click binding for Sign In
document.addEventListener('click', function(e){
  const t = e.target.closest('#header-sign-in, .info-panel-header .auth-button, [data-role="signin"]');
  if (!t) return;
  e.preventDefault();
  try {
    if (typeof openAuthModal === 'function') { openAuthModal(); }
    else {
      const m = document.getElementById('auth-modal');
      if (m) m.style.display = 'flex';
    }
  } catch(_) {}
}, {passive:false});

// ROBUST_OPEN
function openAuthModalRobust(){
  try {
    if (typeof openAuthModal === 'function') return openAuthModal();
    let m = document.getElementById('auth-modal');
    if (m) { m.style.display = 'flex'; return; }
    // If modal not yet in DOM, wait a tick
    setTimeout(()=>{
      m: document.getElementById('auth-modal');
      if (m) m.style.display = 'flex';
    }, 50);
  } catch(_) {}
}
document.addEventListener('click', function(e){
  const t = e.target.closest('#header-sign-in, .info-panel-header .auth-button, [data-role="signin"]');
  if (!t) return;
  e.preventDefault(); 
  openAuthModalRobust();
}, {passive:false});
