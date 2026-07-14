document.documentElement.classList.add('js');

(function () {
  document.querySelectorAll('[data-language-link]').forEach((link) => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('preferredLanguage', link.dataset.languageLink); } catch (_) {}
    });
  });

  const button = document.querySelector('.hamburger');
  const navigation = document.getElementById('primary-navigation');
  if (!button || !navigation) return;

  const setLabel = (open) => {
    const label = open ? button.dataset.closeLabel : button.dataset.openLabel;
    if (label) button.setAttribute('aria-label', label);
  };

  const close = (restoreFocus = false) => {
    const wasOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    setLabel(false);
    if (restoreFocus && wasOpen) button.focus();
  };

  const open = () => {
    button.setAttribute('aria-expanded', 'true');
    navigation.classList.add('is-open');
    setLabel(true);
  };

  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') {
      close(true);
    } else {
      open();
    }
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => close());
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || button.getAttribute('aria-expanded') !== 'true') return;
    event.preventDefault();
    close(true);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) close();
  });
})();
