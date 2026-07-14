# Cutover checklist: Framer to GitHub Pages

This checklist launches the repository-root site at `https://maxsutter.de/`. The former `legal.maxsutter.de` host will be retired; English legal pages live at `/legal-notice/`, `/privacy/`, and `/terms/`, with German counterparts at `/de/impressum/`, `/de/datenschutz/`, and `/de/agb/`. Do not cancel Framer before production verification passes.

## 1. Decisions and rollback evidence

- [ ] Approve final English and German copy, testimonials, photos, logos, and FAQ answers.
- [ ] Export or screenshot the current Framer site and its DNS settings.
- [x] Record the current Framer DNS: apex A records `31.43.160.6` and `31.43.161.6`; `www` CNAME `sites.framer.app`; `legal` CNAME `maxsutter.github.io`.
- [x] Record repository rollback state: commit `ca7f440` is the last published Framer-redirect state.
- [ ] Lower relevant DNS TTLs at least one TTL period before cutover if the DNS provider permits it.
- [ ] Keep the existing GitHub Pages domain-verification TXT record.

## 2. Contact form and privacy

- [x] Configure Formcarry form `Max Sutter Website – Coaching Applications` with endpoint `https://formcarry.com/s/c037Ctr8vBU` on EN and DE.
- [x] Enable notifications to `max@maxsutter.de`, spam protection, and disable Formcarry database retention.
- [x] Update the bilingual privacy policy for Formcarry, purpose, legal basis, data categories, recipients, retention, and international-transfer information.
- [x] Finalize the bilingual GitHub Pages hosting disclosure and remove all provisional pre-publication wording.
- [ ] Confirm the Formcarry DPA/provider terms are accepted and appropriate.
- [ ] Configure the form subject and any remaining notification settings.
- [ ] Submit English and German test enquiries; verify success UI, recipient delivery, reply-to, spam behavior, and failure UI.
- [ ] Delete test submissions or messages when no longer needed.

## 3. Repository production state

- [x] Replace the root redirect with the English production landing page.
- [x] Promote German content to `/de/` and shared files to `/assets/`.
- [x] Promote `404.html`, `robots.txt`, and `sitemap.xml` to the root; remove the unnecessary PWA manifest.
- [x] Publish separate static EN and DE legal routes on the main site.
- [x] Remove landing-page `noindex, nofollow`; keep the 404 and legal pages non-indexable.
- [x] Normalize production legal links to the six static language-specific routes.
- [x] Add automated lint, HTML, source-invariant, Chromium, and Lighthouse quality gates.
- [x] Set the repository `CNAME` to `maxsutter.de`.
- [x] Remove the obsolete `/new/` preview copy.
- [x] Complete the core local root-route and browser verification in section 4.
- [ ] Create a dedicated cutover branch from `main` and a rollback tag for `ca7f440`.
- [ ] Commit the reviewed production state on the cutover branch, push that branch and the rollback tag for review, and let the branch checks pass. Do not merge or push the production commit to `main` yet.

## 4. Local release verification

- [x] `/`, `/de/`, all six legal routes, `/404.html`, `/robots.txt`, and `/sitemap.xml` load locally.
- [x] All local HTML, CSS, JS, font, icon, and image targets resolve.
- [x] EN/DE navigation, language links, mobile menu, focus handling, FAQ, footer, and legal links work.
- [x] Form validation plus success/error presentation work without sending personal data.
- [x] Canonical, hreflang, Open Graph, favicon, JSON-LD, and sitemap values use production URLs.
- [x] Landing-page source has no `noindex`; no mixed content, console errors, broken assets, redirect loops, or horizontal overflow.
- [ ] Re-run the Safari phone smoke test against the final root routes. The final macOS Safari desktop smoke passed on 2026-07-13; the existing phone evidence predates the root promotion and final review fixes.
- [x] Automated mobile Lighthouse EN/DE reaches at least 90 Performance and 100 Accessibility, Best Practices, and SEO; repeat desktop Lighthouse at cutover.

## 5. GitHub Pages and DNS cutover

- [ ] Verify `maxsutter.de` in GitHub Pages settings and retain the verification TXT record.
- [ ] Confirm GitHub Pages publishes from the `main` branch at `/`.
- [ ] Start the planned maintenance window. A temporary outage of `legal.maxsutter.de` from the custom-domain switch until the main-domain DNS cutover is accepted.
- [ ] Set this repository's Pages custom domain to `maxsutter.de` before changing DNS. GitHub may create or update the root `CNAME` commit on `main`; fetch it and integrate it into the cutover branch before merging.
- [ ] Merge the reviewed cutover branch into `main`, push `main`, and wait for the resulting GitHub Pages deployment to succeed. This is the production publish step.
- [ ] Replace the Framer apex records with GitHub Pages A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`.
- [ ] Change `www.maxsutter.de` to a CNAME pointing directly to `maxsutter.github.io`.
- [ ] Remove the `legal.maxsutter.de` CNAME after the main-domain legal routes are live; no redirect or replacement subdomain is planned.
- [ ] Do not add wildcard DNS records.
- [ ] Wait for propagation and certificate issuance, then enable **Enforce HTTPS**.
- [ ] Verify `dig` output for apex, `www`, removed `legal`, verification TXT, and any CAA records.
- [ ] End the maintenance window after the main-domain legal routes and removed `legal` DNS record are verified.

Official guidance: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## 6. Production verification

- [ ] `https://maxsutter.de/` returns 200 with the English page and a valid certificate.
- [ ] `https://maxsutter.de/de/` returns 200 with the German page.
- [ ] `https://www.maxsutter.de/` redirects once to `https://maxsutter.de/`.
- [ ] Navigation, language links, FAQ, form, footer, and legal links work in Safari and Chromium on phone and desktop.
- [ ] A real form enquiry arrives and contains only the intended fields.
- [ ] Source contains no landing-page `noindex`; `robots.txt` allows crawling; `sitemap.xml` is reachable.
- [ ] Canonical, hreflang, Open Graph image, favicon, and JSON-LD use production URLs.
- [ ] No mixed content, console errors, broken assets, redirect loops, or horizontal overflow.
- [ ] Run Lighthouse again and submit the sitemap in Google Search Console; request indexing for EN and DE.
- [ ] Confirm `legal.maxsutter.de` no longer resolves after its DNS record is removed.

## 7. Rollback and follow-up

- [ ] Keep Framer active for 48 hours after DNS changes or until all production checks pass, whichever is later.
- [ ] Roll back by restoring commit `ca7f440`, the former `legal.maxsutter.de` Pages domain, and the recorded Framer DNS values.
- [ ] Monitor form delivery, Pages builds, certificate status, Search Console, and 404s for at least one week.
- [ ] Cancel Framer only after the rollback window closes and the live site is stable.
