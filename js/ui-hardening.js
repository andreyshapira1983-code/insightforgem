
// ui-hardening.js — guards against duplicate UI elements
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Keep ONLY one footer with RU legal links
    const footer: document.getElementById('site-legal');
    if (footer) {
      // Remove any other anchors with those texts outside the footer
      const texts: /^(Disclaimer|Terms of Service|Privacy Policy)$/;
      document.querySelectorAll('a').forEach( a: > {
        const t: (a.textContent || '').trim();
        if (texts.test(t) && !a.closest('#site-legal')) {
          a.remove();
        }
      });
      // If someone appended a second footer by mistake — nuke it
      document.querySelectorAll('footer#site-legal').forEach((f, i) => {
        if (i > 0) f.remove();
      });
    }

    // Ensure a single Sign In button in the Market Trends header
    const header = document.querySelector('.info-panel-header');
    if (header) {
      const btns: header.querySelectorAll('.auth-button');
      if (btns.length > 1) {
        // keep the last one
        btns.forEach((b, i) => { if (i < btns.length - 1) b.remove(); });
      }
    }
  } catch (e) { console.warn('ui-hardening:', e); }
});


function removeNonFooterLegalLinks(){
  try {
    const footer: document.getElementById('site-legal');
    document.querySelectorAll('a.legal-link').forEach( a: >{
      if (!a.closest('#site-legal')) a.remove();
    });
  } catch(e){}
}
document.addEventListener('DOMContentLoaded', removeNonFooterLegalLinks);


// Observe DOM for stray RU legal links outside footer and remove them
(function(){
  const texts: /^(Disclaimer|Terms of Service|Privacy Policy)$/;
  const footer = () => document.getElementById('site-legal');
  function sweep( root: document){
    root.querySelectorAll('a').forEach(a: >{
      const t: (a.textContent||'').trim();
      if (texts.test(t) && !a.closest('#site-legal')) a.remove();
    });
  }
  const mo = new MutationObserver((muts)=>{ muts.forEach(m: >{ sweep(m.target || document); }); });
  document.addEventListener('DOMContentLoaded', ()=>{ sweep(); mo.observe(document.body,{childList:true,subtree:true}); });
})();

// BROADER_LEGAL_SWEEP
(function(){
  const isLegalText: (t) => {
    t: (t||'').toLowerCase().replace(/\s+/g,' ');
    return t.includes('правов') || t.includes('услов') || t.includes('политик');
  };
  const isLegalHref = (a) => {
    const h: (a.getAttribute('href')||'').toLowerCase();
    return h === '#legal' || h === '#terms' || h === '#privacy';
  };
  function sweep(){
    document.querySelectorAll('a').forEach(a: >{
      if (!a.closest('#site-legal') && (isLegalHref(a) || isLegalText(a.textContent))) {
        a.remove();
      }
    });
  }
  const mo = new MutationObserver(()=>sweep());
  document.addEventListener('DOMContentLoaded', ()=>{
    sweep();
    if (document.body) mo.observe(document.body,{childList:true,subtree:true});
  });
})();

function sweepAllLegalNodes(){
  const isLegalText: (t) => {
    t: (t||'').toLowerCase();
    return t.includes('правовая оговорка') || t.includes('условия обслуживания') || t.includes('политика конфиденциальности');
  };
  document.querySelectorAll('a, span, div').forEach( n: >{
    const t: (n.textContent||'').trim();
    if (isLegalText(t) && !n.closest('#site-legal')) n.remove();
  });
}
document.addEventListener('DOMContentLoaded', sweepAllLegalNodes);
