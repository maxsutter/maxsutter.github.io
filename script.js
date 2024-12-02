document.addEventListener('DOMContentLoaded', () => {
    // Modal functionality
    const modal = document.getElementById('booking-modal');
    const btns = document.querySelectorAll('#book-session-btn, #book-session-btn-bottom');
    const closeBtn = document.getElementById('close-modal');
    let lastFocusedButton = null;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            lastFocusedButton = btn;
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            // Set focus to the close button
            closeBtn.focus();
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        // Return focus to the last focused button
        if (lastFocusedButton) {
            lastFocusedButton.focus();
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            if (lastFocusedButton) {
                lastFocusedButton.focus();
            }
        }
    });

    // Keyboard navigation for modal
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            if (lastFocusedButton) {
                lastFocusedButton.focus();
            }
        }
    });

    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
        hamburger.setAttribute('aria-expanded', isActive);
    });

    // Close mobile menu when a link is clicked
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Intersection Observer for fade-in animations
    const faders = document.querySelectorAll('.fade-in');
    const sliders = document.querySelectorAll('.slide-in');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    sliders.forEach(slider => {
        appearOnScroll.observe(slider);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    // Modal functionality
    const modal = document.getElementById('booking-modal');
    const btns = document.querySelectorAll('#book-session-btn, #book-session-btn-bottom');
    const closeBtn = document.getElementById('close-modal');
    let lastFocusedButton = null;

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            lastFocusedButton = btn;
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            // Set focus to the close button
            closeBtn.focus();
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        // Return focus to the last focused button
        if (lastFocusedButton) {
            lastFocusedButton.focus();
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            if (lastFocusedButton) {
                lastFocusedButton.focus();
            }
        }
    });

    // Keyboard navigation for modal
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('show')) {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            if (lastFocusedButton) {
                lastFocusedButton.focus();
            }
        }
    });

    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
        hamburger.setAttribute('aria-expanded', isActive);
    });

    // Close mobile menu when a link is clicked
    navLinks.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            navLinks.classList.remove('active');
            hamburger.classList.remove('toggle');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    });

    // Intersection Observer for fade-in animations
    const faders = document.querySelectorAll('.fade-in');
    const sliders = document.querySelectorAll('.slide-in');

    const appearOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                appearOnScroll.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    sliders.forEach(slider => {
        appearOnScroll.observe(slider);
    });

    // Kontaktformular AJAX Submission
    const contactForm = document.querySelector('.contact-form');
    const formResponse = document.querySelector('.form-response');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Something went wrong.');
                    });
                }
            })
            .then(data => {
                formResponse.style.color = '#2ecc71'; // Grün für Erfolg
                formResponse.textContent = "Thank you! Your message has been sent.";
                contactForm.reset();
            })
            .catch(error => {
                formResponse.style.color = '#e74c3c'; // Rot für Fehler
                formResponse.textContent = "Oops! Something went wrong, and we couldn't send your message.";
                console.error('There was a problem with the form submission:', error);
            });
        });
    }
});