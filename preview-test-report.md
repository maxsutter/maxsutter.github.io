# Preview test report

> Historical QA record: the tested `/new/` files were promoted to the repository root on 2026-07-11 and the preview subtree was removed. A post-promotion Chromium smoke test passed for `/` and `/de/`; all production routes and 39 assets returned HTTP 200.

Full browser matrix: 2026-07-10
Targeted revalidation after review fixes: 2026-07-11
Final production-root macOS Safari desktop revalidation: 2026-07-13

Preview: `http://localhost:8080/new/`

German route: `http://localhost:8080/new/de/`

Result: passed for preview use; the Formcarry endpoint is configured.

## Browser matrix

| Browser | Mobile | Tablet | Desktop | Result |
| --- | --- | --- | --- | --- |
| Chromium | 390 × 844 | 768 × 1024 | 1440 × 900 | Passed |
| Safari | iPhone 16, iOS 18.1 | iPad Air 11-inch, iPadOS 18.1 | macOS Safari | Passed |

The iPhone and iPad checks used Apple's simulators and the native Safari app, not a Chromium device emulation.

## Functional checks

The 2026-07-11 Chromium revalidation covered the current 1440 × 900 desktop and 390 × 844 mobile hero. It confirmed an exact viewport-height desktop hero, no horizontal overflow, the site header outside and hero inside the main landmark, mobile menu focus moving to the first link, and the updated full-screen menu state. Source-level checks additionally confirm background `inert` handling, focus wrapping, and Escape focus restoration.

The 2026-07-13 macOS Safari desktop revalidation covered the final root EN/DE landing pages, the German and English privacy routes, and the static legal-language switch. Layout, assets, navigation, and route transitions passed. Final phone-Safari revalidation remains pending; the earlier iPhone evidence predates root promotion and the final review fixes.

- Navigation: desktop anchors, mobile/tablet menu, section jumps, automatic menu close, responsive reset, and Escape close passed.
- Languages: English and German routes, desktop and mobile language links, localized labels, titles, headings, navigation, FAQ, form, and footer passed.
- FAQ: six native disclosure items, smooth click/tap transition, keyboard Return operation, reduced-motion fallback, and single-open behavior passed.
- Form states: required-field validation, invalid focus, filled valid state, loading/error presentation, and the missing-endpoint fallback passed.
- Keyboard: skip link now targets a main landmark containing the hero; visible focus, logical tab order, contained mobile-menu focus, Escape restoration, FAQ summaries, always-visible optional fields, and submit control passed.
- Responsive layout: no horizontal overflow, clipped primary action, or hidden required content at the tested widths.
- Console: no errors or warnings on the English or German routes during browser QA.

Both forms now use the live Formcarry endpoint `https://formcarry.com/s/c037Ctr8vBU`. Spam protection and email notifications to `max@maxsutter.de` are enabled. Data retention is disabled, so incoming submissions are not saved to the Formcarry database while email notifications remain active. No test submission or personal data was transmitted during setup. End-to-end delivery verification remains required before production.

## Metadata and links

- Exactly one H1 per language route; no duplicate IDs or broken in-page anchors.
- Unique localized titles and descriptions.
- Production canonicals already target `https://maxsutter.de/` and `https://maxsutter.de/de/`.
- Reciprocal `en`, `de`, and `x-default` hreflang links.
- Complete Open Graph and Twitter card metadata.
- Valid JSON-LD, sitemap, favicon, and touch icon. The preview manifest was later removed because the production site is not intended to be an installable PWA.
- Preview pages intentionally use `noindex, nofollow` until cutover.
- At preview time, all 40 local page, legal, asset, font, script, stylesheet, and manifest targets returned HTTP 200.
- Live homepage and X profile returned HTTP 200. LinkedIn returned its normal automated-client block status 999; the profile URL is syntactically valid and the browser link is present.

## Lighthouse 13.4.0

| Route | Mode | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| EN | Mobile | 95 | 100 | 100 | 66 | 2.3 s | 0 |
| EN | Desktop | 96 | 100 | 100 | 66 | 0.7 s | 0 |
| DE | Mobile | 97 | 100 | 100 | 66 | 2.4 s | 0 |
| DE | Desktop | 99 | 100 | 100 | 66 | 0.7 s | 0 |

The only scored SEO failure is the intentional preview `noindex`. After removing it at cutover, the currently audited SEO checks project to 100. Server-controlled caching and compression can only be tuned within GitHub Pages' platform limits.

## Production-root automated revalidation

After the static legal split and production hardening on 2026-07-11, the automated suite passed 30 Chromium checks across phone and desktop viewports. It covers all nine HTML routes, navigation, FAQ, No-JS/script-failure fallbacks, and intercepted form success, failure, timeout, retry, duplicate-submit, and data-minimization states without contacting Formcarry.

Six mobile Lighthouse runs (three each for EN and DE) scored 99–100 Performance and 100 Accessibility, Best Practices, and SEO. Reports remain local CI artifacts; a production desktop rerun is still required during cutover.

## Optimization applied during QA

- Added separate AVIF/WebP mobile hero sources and breakpoint-specific preloads.
- Replaced oversized portraits, brand mark, and kartenmacherei logo with right-sized WebP assets.
- Removed the mobile hero-copy animation from the LCP path.
- Corrected the testimonial star accessibility role.
- Mobile performance improved from 79/84 to 95/97; accessibility improved from 95/96 to 100.

## Visual evidence

QA directory:

`/Users/maxsutter/.codex/visualizations/2026/07/10/019f4bf2-935f-7b61-9740-5bad89504839/implementation-qa/`

Key files:

- `full-view-comparison.png`
- `hero-desktop-comparison.png`
- `hero-mobile-comparison.png`
- `chromium-mobile-optimized.png`
- `safari-ios18-mobile-de.png`
- `safari-ipados18-tablet-en.png`

The detailed source-to-implementation comparison is in `design-qa.md`.

## Preview acceptance

The preview is ready for content review and an explicit end-to-end form delivery test. Production launch still requires the remaining privacy/DPA confirmation and cutover steps. No production DNS, GitHub Pages domain, or Framer setting was changed.
