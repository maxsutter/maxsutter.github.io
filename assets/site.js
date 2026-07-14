(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const menuBackground = Array.from(document.querySelectorAll('.hero-content, .site-header .brand, main, footer, [data-language-suggestion]'));

  const setMenuBackgroundInert = (inert) => {
    menuBackground.forEach((element) => { element.toggleAttribute('inert', inert); });
  };

  const closeMenu = (restoreFocus = false) => {
    if (!menuButton || !mobileNav) return;
    const wasOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', menuButton.dataset.menuOpenLabel || 'Open menu');
    mobileNav.hidden = true;
    document.body.classList.remove('menu-open');
    setMenuBackgroundInert(false);
    if (restoreFocus && wasOpen) menuButton.focus();
  };

  if (menuButton && mobileNav) {
    const menuLinks = Array.from(mobileNav.querySelectorAll('a'));
    menuButton.addEventListener('click', () => {
      const opening = menuButton.getAttribute('aria-expanded') !== 'true';
      if (!opening) {
        closeMenu(true);
        return;
      }
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', menuButton.dataset.menuCloseLabel || 'Close menu');
      mobileNav.hidden = false;
      document.body.classList.add('menu-open');
      setMenuBackgroundInert(true);
      if (menuLinks[0]) menuLinks[0].focus();
    });
    menuLinks.forEach((link) => link.addEventListener('click', (event) => {
      const samePageTarget = link.hash
        && link.origin === window.location.origin
        && link.pathname === window.location.pathname
        ? document.querySelector(link.hash)
        : null;
      const focusTarget = samePageTarget ? samePageTarget.querySelector('h1, h2') || samePageTarget : null;
      const shouldMoveFocus = event.detail === 0 && focusTarget;

      closeMenu();

      if (shouldMoveFocus) {
        focusTarget.setAttribute('tabindex', '-1');
        focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), { once: true });
        window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
      }
    }));
    window.addEventListener('keydown', (event) => {
      if (menuButton.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [menuButton, ...menuLinks];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  document.querySelectorAll('[data-language-link]').forEach((link) => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('preferredLanguage', link.dataset.languageLink); } catch (_) {}
    });
  });

  const suggestion = document.querySelector('[data-language-suggestion]');
  if (suggestion) {
    const current = document.documentElement.lang.slice(0, 2);
    let preferred = '';
    let dismissed = false;
    try {
      preferred = localStorage.getItem('preferredLanguage') || '';
      dismissed = sessionStorage.getItem('languageSuggestionDismissed') === 'true';
    } catch (_) {}
    const browserLanguages = (navigator.languages || [navigator.language || 'en']).map((lang) => lang.toLowerCase());
    const browserSpeaksGerman = browserLanguages.some((lang) => lang === 'de' || lang.startsWith('de-'));
    const shouldSuggest = !dismissed && !preferred && ((current === 'en' && browserSpeaksGerman) || (current === 'de' && !browserSpeaksGerman));
    if (shouldSuggest) suggestion.hidden = false;

    const dismiss = suggestion.querySelector('[data-dismiss-language]');
    if (dismiss) dismiss.addEventListener('click', () => {
      suggestion.hidden = true;
      try { sessionStorage.setItem('languageSuggestionDismissed', 'true'); } catch (_) {}
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const faqItems = Array.from(document.querySelectorAll('.faq details'));
  const faqAnimations = new WeakMap();

  const animateFaq = (item, opening) => {
    const summary = item.querySelector('summary');
    const answer = item.querySelector('.faq-answer');
    if (!summary || !answer || reducedMotion) {
      item.open = opening;
      return;
    }

    const currentAnimation = faqAnimations.get(item);
    if (currentAnimation) currentAnimation.cancel();

    const startHeight = item.offsetHeight;
    if (opening) item.open = true;
    const endHeight = opening ? summary.offsetHeight + answer.offsetHeight : summary.offsetHeight;

    item.classList.toggle('is-opening', opening);
    item.classList.toggle('is-closing', !opening);
    item.style.overflow = 'hidden';

    const animation = item.animate(
      { height: [`${startHeight}px`, `${endHeight}px`] },
      { duration: 280, easing: 'cubic-bezier(.4, 0, .2, 1)' }
    );
    faqAnimations.set(item, animation);

    const cleanUp = () => {
      item.classList.remove('is-opening', 'is-closing');
      item.style.overflow = '';
      faqAnimations.delete(item);
    };

    animation.onfinish = () => {
      if (!opening) item.open = false;
      cleanUp();
    };
    animation.oncancel = cleanUp;
  };

  faqItems.forEach((item) => {
    const summary = item.querySelector('summary');
    if (!summary) return;
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      const opening = !item.open;
      if (opening) {
        faqItems.forEach((other) => {
          if (other !== item && other.open) animateFaq(other, false);
        });
      }
      animateFaq(item, opening);
    });
  });

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((element) => observer.observe(element));
  }

  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('button[type="submit"]');
  const defaultLabel = submit ? submit.querySelector('[data-submit-label]') : null;
  const requestTimeout = 15000;
  let isSubmitting = false;
  const messages = {
    en: {
      sending: 'Sending…',
      success: 'Thank you — your message is on its way. I’ll get back to you soon.',
      error: 'Something went wrong. Your entries are still here — please try again.',
      timeout: 'The submission took too long to confirm. Your entries are still here — please try again.',
      retry: 'Try again',
      preview: 'Preview mode: add the Formcarry endpoint before launch.'
    },
    de: {
      sending: 'Wird gesendet…',
      success: 'Vielen Dank — deine Nachricht ist unterwegs. Ich melde mich zeitnah.',
      error: 'Etwas ist schiefgelaufen. Deine Eingaben sind noch da — bitte versuche es erneut.',
      timeout: 'Das Senden hat zu lange gedauert und konnte nicht bestätigt werden. Deine Eingaben sind noch da — bitte versuche es erneut.',
      retry: 'Erneut versuchen',
      preview: 'Preview-Modus: Vor dem Launch muss noch der Formcarry-Endpunkt ergänzt werden.'
    }
  };

  const language = document.documentElement.lang.slice(0, 2) === 'de' ? 'de' : 'en';
  const copy = messages[language];

  const setStatus = (message, type) => {
    if (!status) return;
    status.textContent = message;
    status.classList.remove('is-success', 'is-error');
    if (type) status.classList.add(`is-${type}`);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting || !form.reportValidity()) return;

    const endpoint = form.getAttribute('action') || form.dataset.endpoint || '';
    if (!endpoint) {
      setStatus(copy.preview, 'error');
      return;
    }

    isSubmitting = true;
    form.setAttribute('aria-busy', 'true');
    if (submit) submit.disabled = true;
    if (defaultLabel) defaultLabel.textContent = copy.sending;
    setStatus('', '');

    const controller = new AbortController();
    let didTimeout = false;
    let labelAfterRequest = submit ? submit.dataset.defaultLabel || '' : '';
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, requestTimeout);

    try {
      const payload = new FormData(form);
      payload.set('page', window.location.origin + window.location.pathname);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Form submission failed');
      form.reset();
      setStatus(copy.success, 'success');
    } catch (_) {
      labelAfterRequest = copy.retry;
      setStatus(didTimeout ? copy.timeout : copy.error, 'error');
    } finally {
      window.clearTimeout(timeoutId);
      isSubmitting = false;
      form.removeAttribute('aria-busy');
      if (submit) submit.disabled = false;
      if (defaultLabel) defaultLabel.textContent = labelAfterRequest;
    }
  });
})();
