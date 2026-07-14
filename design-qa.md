# Direction 1 implementation — design QA

- Source visual truth: `/Users/maxsutter/.codex/visualizations/2026/07/10/019f4bf2-935f-7b61-9740-5bad89504839/maxsutter-website-directions/direction-1-cinematic.png`
- Implementation: `http://localhost:8080/` (English) and `http://localhost:8080/de/` (German)
- Desktop evidence: `/Users/maxsutter/.codex/visualizations/2026/07/10/019f4bf2-935f-7b61-9740-5bad89504839/implementation-qa/hero-desktop-1440.png`
- Mobile evidence: `/Users/maxsutter/.codex/visualizations/2026/07/10/019f4bf2-935f-7b61-9740-5bad89504839/implementation-qa/hero-mobile-390.png`
- Viewports: desktop 1440 × 900; mobile 390 × 844
- State: English landing page; first FAQ item open; contact form idle; additional checks for open mobile navigation, German route, and form preview error
- Review-fix revalidation: 2026-07-11 at 1440 × 900 desktop and 390 × 844 mobile; hero height, wrapping, landmarks, overflow, menu opening, and initial menu focus checked against the current implementation.

## Comparison evidence

- Full-view comparison: `/Users/maxsutter/.codex/visualizations/2026/07/10/019f4bf2-935f-7b61-9740-5bad89504839/implementation-qa/full-view-comparison.png`
- Focused desktop hero comparison: `/Users/maxsutter/.codex/visualizations/2026/07/10/019f4bf2-935f-7b61-9740-5bad89504839/implementation-qa/hero-desktop-comparison.png`
- Focused mobile hero comparison: `/Users/maxsutter/.codex/visualizations/2026/07/10/019f4bf2-935f-7b61-9740-5bad89504839/implementation-qa/hero-mobile-comparison.png`
- Focused section evidence: `outcomes-desktop-1440.png`, `reviews-desktop-1440.png`, `faq-desktop-1440.png`, `contact-desktop-1440.png`, and `footer-desktop-1440.png` in the same QA directory.
- The source is a composite concept board rather than an exact browser capture. Pixel precision was therefore judged only within the focused hero crops; full-page review used composition, hierarchy, rhythm, color, image treatment, and component density.

## Findings

No actionable P0, P1, or P2 differences remain.

- Fonts and typography: Manrope is self-hosted and matches the source's geometric, low-contrast sans-serif character. Display scale, weight, line height, wrapping, and supporting-copy hierarchy are consistent across both tested viewports.
- Spacing and layout rhythm: hero, logo rail, outcome row, testimonial cards, FAQ, black contact block, and footer preserve the source hierarchy. The added “How we work” panel is an intentional SEO/content addition from the approved implementation plan.
- Colors and tokens: warm ivory, near-black, white, and amber map cleanly to the source. Borders, fields, CTA pills, and review surfaces stay restrained.
- Image quality and asset fidelity: the original hero, brand mark, client logos, and all three testimonial portraits are local assets. No placeholders or code-drawn image substitutes remain.
- Copy and content: all original English testimonials and FAQ facts are retained; German is a full parallel route. Each page has one semantic H1, with two short spans used only to control the intended desktop line break rather than Framer's per-character output.
- Icons: source logo assets and local Phosphor icons use one consistent stroke family. The review stars use the filled five-star asset from the live source.
- Responsiveness: no horizontal overflow or clipped primary actions at 390 px. German and English hero copy remain readable and the testimonial proof stays above the fold.
- Accessibility: the hero sits inside the main landmark while the site header remains a top-level banner. The full-screen mobile navigation moves focus to its first link, keeps focus within the menu, makes background content inert, and restores focus to the menu button on Escape. Semantic navigation, one H1, labelled fields, keyboard-operable FAQ, localized menu labels, visible focus, reduced motion, and live form status are present.

## Comparison history

### Iteration 1

- [P2] Mobile hero crop placed Max too low and left too much empty sky. Fixed with the closer original mobile image, responsive `<picture>` source, adjusted focal point, and revised bottom spacing.
- [P2] Expanded mobile menu retained the accessible name “Open menu”. Fixed with localized open/close labels synchronized with `aria-expanded`.
- [P2] Testimonial stars initially used an outlined approximation. Replaced with the exact filled five-star source asset and corrected its standalone SVG namespace/fill.

Post-fix evidence: `hero-mobile-comparison.png`, `menu-mobile-390.png`, and `reviews-desktop-1440.png`. The revised comparison contains no remaining P0/P1/P2 mismatch.

### Iteration 2 — browser review

- Standardized all testimonial cards to the same width while retaining the alternating surface color.
- Removed the redundant outcomes display heading; the eyebrow remains as the semantic section heading.
- Added a smooth, reduced-motion-aware FAQ transition without changing native keyboard operation or single-open behavior.
- Reworked the contact heading into one editorial column with an amber rule tying the introduction to the headline.
- Made both optional context fields permanently visible and removed the inline Formcarry notice; the full disclosure remains in the privacy policy.

## Functional verification

- Main navigation anchors tested.
- Mobile navigation open, link visibility, Escape close, and responsive reset tested.
- EN → DE and DE → EN routes tested.
- FAQ animated open/close and single-open behavior tested.
- Optional contact fields tested as permanently visible at desktop and mobile widths.
- Required form inputs, local validation, native Formcarry fallback, honeypot field, and the explicit missing-endpoint error path tested.
- English and German pages checked for one H1, valid JSON-LD, matching canonical/hreflang, local resources, complete images, and zero horizontal overflow.
- Browser console checked after English and German routes: no warnings or errors.
- The Formcarry endpoint is configured. Live delivery testing remains pending. Formcarry database retention is disabled, while email notifications remain active.

## Follow-up polish

- None required for handoff. Exact full-page height differs from the composite mock because all three testimonials and the approved “How we work” content are visible rather than hidden in a carousel.

final result: passed
