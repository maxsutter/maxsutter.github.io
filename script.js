document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Modal.init();
    HamburgerMenu.init();
    ScrollAnimations.init();
    ContactForm.init();
    Navbar.init(); // Initialisiere das Navbar-Modul
});

/**
 * Modal Module
 * Handles the opening and closing of modals, including accessibility features.
 */
const Modal = (() => {
    const modal = document.getElementById('booking-modal');
    const triggerButtons = document.querySelectorAll('#book-session-btn, #book-session-btn-bottom');
    const closeButton = document.getElementById('close-modal');
    let lastFocusedElement = null;

    const openModal = (event) => {
        lastFocusedElement = event.currentTarget;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        closeButton.focus();
    };

    const closeModal = () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    };

    const handleOutsideClick = (event) => {
        if (event.target === modal) {
            closeModal();
        }
    };

    const handleEscape = (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    };

    const bindEvents = () => {
        triggerButtons.forEach(button => {
            button.addEventListener('click', openModal);
        });

        closeButton.addEventListener('click', closeModal);
        window.addEventListener('click', handleOutsideClick);
        window.addEventListener('keydown', handleEscape);
    };

    return {
        init: bindEvents
    };
})();

/**
 * HamburgerMenu Module
 * Handles the toggle functionality of the hamburger menu for mobile navigation.
 */
const HamburgerMenu = (() => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    const toggleMenu = () => {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
        hamburger.setAttribute('aria-expanded', isActive);
    };

    const closeMenuOnLinkClick = (event) => {
        if (event.target.tagName === 'A') {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    };

    const bindEvents = () => {
        if (hamburger) {
            hamburger.addEventListener('click', toggleMenu);
        }

        if (navLinks) {
            navLinks.addEventListener('click', closeMenuOnLinkClick);
        }
    };

    return {
        init: bindEvents
    };
})();

/**
 * ScrollAnimations Module
 * Implements fade-in and slide-in animations using the Intersection Observer API.
 */
const ScrollAnimations = (() => {
    const faders = document.querySelectorAll('.fade-in');
    const sliders = document.querySelectorAll('.slide-in');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScrollCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    };

    const initObserver = () => {
        const observer = new IntersectionObserver(appearOnScrollCallback, appearOptions);
        faders.forEach(fader => observer.observe(fader));
        sliders.forEach(slider => observer.observe(slider));
    };

    const bindEvents = () => {
        if ('IntersectionObserver' in window) {
            initObserver();
        } else {
            // Fallback für ältere Browser
            faders.forEach(fader => fader.classList.add('appear'));
            sliders.forEach(slider => slider.classList.add('appear'));
        }
    };

    return {
        init: bindEvents
    };
})();

/**
 * ContactForm Module
 * Handles AJAX submission of the contact form with user feedback.
 */
const ContactForm = (() => {
    const contactForm = document.querySelector('.contact-form');
    const formResponse = document.querySelector('.form-response');

    const submitForm = async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                showResponse('Vielen Dank! Ihre Nachricht wurde gesendet.', '#2ecc71');
                contactForm.reset();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Etwas ist schief gelaufen.');
            }
        } catch (error) {
            showResponse("Oops! Etwas ist schief gelaufen und wir konnten Ihre Nachricht nicht senden.", '#e74c3c');
            console.error('Problem bei der Formularübermittlung:', error);
        }
    };

    const showResponse = (message, color) => {
        if (formResponse) {
            formResponse.style.color = color;
            formResponse.textContent = message;
        }
    };

    const bindEvents = () => {
        if (contactForm) {
            contactForm.addEventListener('submit', submitForm);
        }
    };

    return {
        init: bindEvents
    };
})();

/**
 * Navbar Module
 * Handles the background color change of the navbar on scroll with performance optimization.
 */
const Navbar = (() => {
    const navbar = document.querySelector('.navbar');
    const scrollThreshold = 50; // Threshold in pixels to add the 'scrolled' class

    /**
     * Adds or removes the 'scrolled' class based on the scroll position.
     */
    const handleScroll = () => {
        if (window.scrollY > scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    /**
     * Throttle function to limit the rate at which a function can fire.
     * @param {Function} func - The function to throttle.
     * @param {number} limit - The time limit in milliseconds.
     * @returns {Function} - The throttled function.
     */
    const throttle = (func, limit) => {
        let lastFunc;
        let lastRan;
        return function(...args) {
            const context = this;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function() {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    };

    /**
     * Binds the scroll event with throttling.
     */
    const bindEvents = () => {
        if (navbar) {
            window.addEventListener('scroll', throttle(handleScroll, 100)); // Throttle to fire every 100ms
            // Initial check in case the page is loaded at a scrolled position
            handleScroll();
        } else {
            console.warn('Navbar element not found.');
        }
    };

    return {
        init: bindEvents
    };
})();