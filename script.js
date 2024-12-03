document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    Modal.init();
    HamburgerMenu.init();
    ScrollAnimations.init();
    ContactForm.init();
    Navbar.init(); // Initialisiere das Navbar-Modul
    Translation.init(); // Initialisiere das Übersetzungs-Modul
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

/**
 * Translation Module
 * Handles the language translations and updates the content dynamically.
 */
const Translation = (() => {
    const translations = {
        en: {
            "nav-about": "About",
            "nav-approach": "Approach",
            "nav-testimonials": "Testimonials",
            "nav-fit": "Is This a Fit?",
            "nav-contact": "Contact",
            "hero-title": "MAX SUTTER",
            "hero-subtitle": "Transformational Coaching to Unleash Your Authentic Leadership",
            "book-session-btn": "Experience a Free Session",
            "secondary-cta": "Message Me",
            "about-heading": "About Me",
            "about-paragraph-1": "I've walked the path of entrepreneurship and leadership myself—as a founder, CEO, and leader navigating high-growth environments. Along the way, I've worked with incredible coaches who profoundly shaped my journey. I know the terrain because I've been in it.",
            "about-paragraph-2": "What sets my approach apart is the integration of this firsthand experience with over 20 years of dedicated meditation practice and personal growth. I've trained with some of the best executive coaches in Silicon Valley, bringing depth to my work with clients.",
            "about-paragraph-3": "When I'm not coaching, building, or meditating, I spend my time with my wife and our two young children.",
            "approach-heading": "My Approach",
            "approach-paragraph-1": "I don't subscribe to formulaic tools or surface-level techniques like \"how to give feedback.\" Instead, I focus on the deeper truths: who you are and how you show up. Authenticity isn't just a concept; it's the foundation. If it's not real, people feel it. And real leadership starts from within.",
            "approach-paragraph-2": "My coaching comes from an awake space filled with love and compassion. I trust in your body's wisdom and hold a safe space that allows for the natural unfolding of clearing stored emotions and limiting beliefs. With sharp but gentle nudges, I guide you at your own pace towards loving resolution.",
            "approach-paragraph-3": "In practice, I combine techniques from state-of-the-art Western modalities with Eastern insights, especially from the Buddhist path. It's not about a technique; it's a state—a way of being that comes from having walked the path myself.",
            "testimonials-heading": "What Others Say",
            "testimonial-1-text": "“Max has an incredible ability to ask sharp questions from a place of wonder and curiosity. His gentle yet directed approach allowed me to explore deeply while feeling completely supported.”",
            "testimonial-1-cite": "– Client Testimonial",
            "fit-heading": "Is This a Fit for You?",
            "fit-paragraph-1": "If you're looking for advice or someone to tell you what to do, there are experts for that (and that's not me). But if you want to remove the blocks that let your own wisdom and clarity flow—and along the way experience more joy, ease, and peace—then I might be your guy.",
            "fit-paragraph-2": "I work with leaders ready to explore and expand their emotional fluidity, decision-making, communication, and authentic power. Together, we'll uncover the blocks and unleash your potential to lead with clarity, connection, and confidence.",
            "cta-heading": "Ready to Transform?",
            "cta-paragraph": "If this resonates, let's have a conversation. Transformation starts here.",
            "book-session-btn-bottom": "Book a Free Introductory Session",
            "secondary-cta-bottom": "Message Me",
            "footer-impressum": "Impressum",
            "footer-privacy": "Privacy Policy",
            "footer-agb": "Terms & Conditions",
            "footer-linkedin": "LinkedIn",
            "footer-copyright": "© 2024 Max Sutter. All rights reserved.",
            "modal-title": "Booking Session",
            "close-modal": "Close modal"
            // Füge hier weitere Übersetzungen für alle IDs hinzu
        },
        de: {
            "nav-about": "Über Mich",
            "nav-approach": "Mein Ansatz",
            "nav-testimonials": "Referenzen",
            "nav-fit": "Passt das zu Dir?",
            "nav-contact": "Kontakt",
            "hero-title": "MAX SUTTER",
            "hero-subtitle": "Transformationales Coaching zur Entfaltung Deiner Authentischen Führung",
            "book-session-btn": "Kostenlose Sitzung Erleben",
            "secondary-cta": "Schreib mir",
            "about-heading": "Über Mich",
            "about-paragraph-1": "Ich habe selbst den Weg des Unternehmertums und der Führung beschritten – als Gründer, CEO und Leiter in wachstumsstarken Umgebungen. Auf diesem Weg habe ich mit unglaublichen Coaches gearbeitet, die meine Reise tiefgreifend geprägt haben. Ich kenne das Terrain, weil ich selbst darin war.",
            "about-paragraph-2": "Was meinen Ansatz auszeichnet, ist die Integration dieser direkten Erfahrung mit über 20 Jahren engagierter Meditationspraxis und persönlichem Wachstum. Ich habe mit einigen der besten Executive Coaches im Silicon Valley trainiert und bringe dadurch Tiefe in meine Arbeit mit Klienten.",
            "about-paragraph-3": "Wenn ich nicht coache, baue oder meditiere, verbringe ich meine Zeit mit meiner Frau und unseren beiden kleinen Kindern.",
            "approach-heading": "Mein Ansatz",
            "approach-paragraph-1": "Ich setze nicht auf formelhafte Werkzeuge oder oberflächliche Techniken wie \"wie man Feedback gibt.\" Stattdessen konzentriere ich mich auf die tieferen Wahrheiten: Wer du bist und wie du dich präsentierst. Authentizität ist nicht nur ein Konzept; sie ist die Grundlage. Wenn es nicht echt ist, merken es die Leute. Und echte Führung beginnt von innen.",
            "approach-paragraph-2": "Mein Coaching kommt aus einem wachen Raum, der mit Liebe und Mitgefühl gefüllt ist. Ich vertraue auf die Weisheit deines Körpers und schaffe einen sicheren Raum, der das natürliche Auflösen gespeicherter Emotionen und limitierender Glaubenssätze ermöglicht. Mit scharfen, aber sanften Impulsen leite ich dich in deinem eigenen Tempo zu liebevoller Lösung.",
            "approach-paragraph-3": "In der Praxis kombiniere ich Techniken aus modernen westlichen Modalitäten mit östlichen Einsichten, insbesondere aus dem buddhistischen Pfad. Es geht nicht um eine Technik; es ist ein Zustand – eine Art zu sein, die aus eigener Erfahrung resultiert.",
            "testimonials-heading": "Was Andere Sagen",
            "testimonial-1-text": "„Max hat eine unglaubliche Fähigkeit, scharfe Fragen aus einem Ort der Verwunderung und Neugier zu stellen. Sein sanfter, aber gezielter Ansatz ermöglichte es mir, tief zu forschen und mich gleichzeitig vollständig unterstützt zu fühlen.“",
            "testimonial-1-cite": "– Kundenreferenz",
            "fit-heading": "Passt das zu Dir?",
            "fit-paragraph-1": "Wenn du nach Ratschlägen suchst oder jemanden, der dir sagt, was du tun sollst, gibt es dafür Experten (und das bin ich nicht). Aber wenn du die Blockaden entfernen möchtest, die deine eigene Weisheit und Klarheit behindern – und dabei mehr Freude, Leichtigkeit und Frieden erleben möchtest – dann könnte ich der Richtige für dich sein.",
            "fit-paragraph-2": "Ich arbeite mit Führungskräften, die bereit sind, ihre emotionale Flexibilität, Entscheidungsfindung, Kommunikation und authentische Macht zu erforschen und zu erweitern. Gemeinsam werden wir die Blockaden aufdecken und dein Potenzial freisetzen, um mit Klarheit, Verbindung und Selbstvertrauen zu führen.",
            "cta-heading": "Bereit für eine Transformation?",
            "cta-paragraph": "Wenn das für dich resoniert, lass uns ein Gespräch führen. Transformation beginnt hier.",
            "book-session-btn-bottom": "Kostenlose Einführungssitzung Buchen",
            "secondary-cta-bottom": "Schreib mir",
            "footer-impressum": "Impressum",
            "footer-privacy": "Datenschutz",
            "footer-agb": "Allgemeine Geschäftsbedingungen",
            "footer-linkedin": "LinkedIn",
            "footer-copyright": "© 2024 Max Sutter. Alle Rechte vorbehalten.",
            "modal-title": "Sitzung Buchen",
            "close-modal": "Modal schließen"
            // Füge hier weitere Übersetzungen für alle IDs hinzu
        }
    };

    let currentLang = 'en'; // Standard Sprache

    const languageButton = document.getElementById('language-button');
    const languageDropdown = document.getElementById('language-dropdown');

    /**
     * Setzt die Sprache der Website.
     * @param {string} lang - 'en' oder 'de'
     */
    const setLanguage = (lang) => {
        if (!translations[lang]) return;

        currentLang = lang;
        // Aktualisiere alle Elemente mit IDs entsprechend der Übersetzungen
        Object.keys(translations[lang]).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Unterscheidung zwischen Buttons und anderen Elementen
                if (element.tagName.toLowerCase() === 'button') {
                    element.textContent = translations[lang][id];
                } else if (element.tagName.toLowerCase() === 'a') {
                    // Spezielle Behandlung für Links, z.B. "Message Me"
                    if (id === "secondary-cta" || id === "secondary-cta-bottom") {
                        element.textContent = translations[lang][id];
                    }
                } else {
                    element.textContent = translations[lang][id];
                }
            }
        });

        // Aktualisiere den Sprachumschalter-Button
        languageButton.textContent = lang.toUpperCase();
        // Speichere die gewählte Sprache in localStorage
        localStorage.setItem('preferredLanguage', lang);
    };

    /**
     * Initialisiert die Sprache basierend auf Browser-Einstellungen oder gespeicherter Präferenz.
     */
    const initLanguage = () => {
        const storedLang = localStorage.getItem('preferredLanguage');
        if (storedLang && translations[storedLang]) {
            setLanguage(storedLang);
            return;
        }

        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('de')) {
            setLanguage('de');
        } else {
            setLanguage('en');
        }
    };

    /**
     * Bindet die Events für den Sprachumschalter.
     */
    const bindEvents = () => {
        languageButton.addEventListener('click', () => {
            const isExpanded = languageButton.getAttribute('aria-expanded') === 'true';
            languageButton.setAttribute('aria-expanded', !isExpanded);
            languageDropdown.classList.toggle('show');
        });

        // Event Delegation für Dropdown-Buttons
        languageDropdown.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'button') {
                const selectedLang = e.target.getAttribute('data-lang');
                setLanguage(selectedLang);
                languageDropdown.classList.remove('show');
                languageButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Schließen des Dropdowns beim Klicken außerhalb
        document.addEventListener('click', (e) => {
            if (!languageDropdown.contains(e.target) && !languageButton.contains(e.target)) {
                languageDropdown.classList.remove('show');
                languageButton.setAttribute('aria-expanded', 'false');
            }
        });
    };

    return {
        init: () => {
            initLanguage();
            bindEvents();
        }
    };
})();