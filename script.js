// script.js

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
});