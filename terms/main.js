// Simple accessible hamburger toggle for small screens
(function () {
  const btn = document.querySelector('.hamburger');
  const nav = document.getElementById('primary-navigation');
  if (!btn || !nav) return;

  const close = () => {
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
  };

  const open = () => {
    btn.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-open');
  };

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? close() : open();
  });

  // Close on link click
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));

  // Close on Escape
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') close();
  });

  // Reset on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) close();
  });
})();
