import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isFullyCrawlableRobotsPolicy } from './robots-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productionOrigin = 'https://maxsutter.de';
const errors = [];

const pages = [
  { file: 'index.html', route: '/', lang: 'en', canonical: '/', indexable: true },
  { file: 'de/index.html', route: '/de/', lang: 'de', canonical: '/de/', indexable: true },
  { file: '404.html', route: '/404.html', lang: 'en', noindex: true, bilingual: true },
  { file: 'legal-notice/index.html', route: '/legal-notice/', lang: 'en', canonical: '/legal-notice/', noindex: true, alternate: '/de/impressum/' },
  { file: 'privacy/index.html', route: '/privacy/', lang: 'en', canonical: '/privacy/', noindex: true, alternate: '/de/datenschutz/' },
  { file: 'terms/index.html', route: '/terms/', lang: 'en', canonical: '/terms/', noindex: true, alternate: '/de/agb/' },
  { file: 'de/impressum/index.html', route: '/de/impressum/', lang: 'de', canonical: '/de/impressum/', noindex: true, alternate: '/legal-notice/' },
  { file: 'de/datenschutz/index.html', route: '/de/datenschutz/', lang: 'de', canonical: '/de/datenschutz/', noindex: true, alternate: '/privacy/' },
  { file: 'de/agb/index.html', route: '/de/agb/', lang: 'de', canonical: '/de/agb/', noindex: true, alternate: '/terms/' },
];

const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');
const fail = (message) => errors.push(message);
const attribute = (html, tagPattern, name) => {
  const tag = html.match(tagPattern)?.[0] ?? '';
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'))?.[1] ?? '';
};

for (const page of pages) {
  const absolutePath = path.join(root, page.file);
  if (!existsSync(absolutePath)) {
    fail(`${page.route}: missing ${page.file}`);
    continue;
  }

  const html = read(page.file);
  const htmlLang = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)?.[1];
  if (htmlLang !== page.lang) fail(`${page.route}: expected html lang=${page.lang}, got ${htmlLang || 'none'}`);

  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (h1Count !== 1) fail(`${page.route}: expected exactly one h1, found ${h1Count}`);

  const robots = attribute(html, /<meta\b[^>]*\bname=["']robots["'][^>]*>/i, 'content');
  if (page.indexable && /noindex/i.test(robots)) fail(`${page.route}: indexable page contains noindex`);
  if (page.noindex && !/noindex/i.test(robots)) fail(`${page.route}: missing noindex`);

  if (page.canonical) {
    const canonical = attribute(html, /<link\b[^>]*\brel=["']canonical["'][^>]*>/i, 'href');
    if (canonical !== `${productionOrigin}${page.canonical}`) {
      fail(`${page.route}: canonical mismatch (${canonical || 'missing'})`);
    }
  }

  const favicon = html.match(/<link\b[^>]*\brel=["']icon["'][^>]*>/i)?.[0] ?? '';
  if (attribute(favicon, /<link\b[^>]*>/i, 'href') !== '/assets/images/favicon-32.png' && !page.indexable) {
    fail(`${page.route}: missing standard favicon`);
  }

  if (page.indexable) {
    const expectedAlternates = {
      en: `${productionOrigin}/`,
      de: `${productionOrigin}/de/`,
      'x-default': `${productionOrigin}/`,
    };
    for (const [lang, href] of Object.entries(expectedAlternates)) {
      const alternate = html.match(new RegExp(`<link\\b(?=[^>]*\\brel=["']alternate["'])(?=[^>]*\\bhreflang=["']${lang}["'])[^>]*>`, 'i'))?.[0] ?? '';
      if (attribute(alternate, /<link\b[^>]*>/i, 'href') !== href) fail(`${page.route}: missing or incorrect ${lang} alternate`);
    }

    const jsonScripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    const nodes = [];
    for (const match of jsonScripts) {
      try {
        const value = JSON.parse(match[1]);
        nodes.push(...(value['@graph'] ?? [value]));
      } catch (error) {
        fail(`${page.route}: invalid JSON-LD (${error.message})`);
      }
    }
    const webPage = nodes.find((node) => node['@type'] === 'WebPage');
    if (!webPage) fail(`${page.route}: missing WebPage JSON-LD node`);
    if (webPage && webPage.inLanguage !== page.lang) fail(`${page.route}: WebPage inLanguage mismatch`);
    if (webPage && webPage.url !== `${productionOrigin}${page.canonical}`) fail(`${page.route}: WebPage URL mismatch`);
    if (webPage && (!webPage.isPartOf || !webPage.about)) fail(`${page.route}: WebPage must reference WebSite and Person`);

    for (const metaName of ['og:image:alt', 'twitter:image:alt']) {
      const selector = metaName.startsWith('og:')
        ? new RegExp(`<meta\\b[^>]*\\bproperty=["']${metaName}["'][^>]*>`, 'i')
        : new RegExp(`<meta\\b[^>]*\\bname=["']${metaName}["'][^>]*>`, 'i');
      if (!attribute(html, selector, 'content').trim()) fail(`${page.route}: missing ${metaName}`);
    }
  }

  if (page.alternate) {
    const expectedLang = page.lang === 'en' ? 'de' : 'en';
    const alternate = html.match(new RegExp(`<link\\b(?=[^>]*\\brel=["']alternate["'])(?=[^>]*\\bhreflang=["']${expectedLang}["'])[^>]*>`, 'i'))?.[0] ?? '';
    if (attribute(alternate, /<link\b[^>]*>/i, 'href') !== `${productionOrigin}${page.alternate}`) {
      fail(`${page.route}: language alternate mismatch`);
    }
  }

  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));
  for (const match of html.matchAll(/\bhref=["']#([^"']+)["']/gi)) {
    if (!ids.has(match[1])) fail(`${page.route}: missing in-page target #${match[1]}`);
  }

  const localReferences = [
    ...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi),
    ...html.matchAll(/\bsrcset=["']([^"']+)["']/gi),
  ].flatMap((match) => match[1].split(',').map((value) => value.trim().split(/\s+/)[0]));

  for (const reference of localReferences) {
    if (!reference || reference.startsWith('#') || /^(?:https?:|mailto:|tel:|data:)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith('/')
      ? path.join(root, clean.slice(1))
      : path.resolve(path.dirname(absolutePath), clean);
    const resolved = clean.endsWith('/') ? path.join(target, 'index.html') : target;
    if (!existsSync(resolved)) fail(`${page.route}: missing local target ${reference}`);
  }
}

for (const forbiddenPath of ['imprint/index.html', 'site.webmanifest']) {
  if (existsSync(path.join(root, forbiddenPath))) fail(`obsolete file remains: ${forbiddenPath}`);
}

const productionFiles = pages.map((page) => page.file).filter((file) => existsSync(path.join(root, file)));
for (const file of [...productionFiles, 'assets/site.js', 'main.js']) {
  if (!existsSync(path.join(root, file))) continue;
  const contents = read(file);
  for (const forbidden of ['/new/', '/neu/', '/imprint/', '?lang=', 'site.webmanifest']) {
    if (contents.includes(forbidden)) fail(`${file}: obsolete reference ${forbidden}`);
  }
}

const landingHtml = ['index.html', 'de/index.html'].map(read);
const endpoints = landingHtml.map((html) => attribute(html, /<form\b[^>]*\bdata-contact-form[^>]*>/i, 'action'));
if (!endpoints[0] || endpoints[0] !== endpoints[1]) fail('landing forms must use one identical non-empty endpoint');

const privacyReleaseBlockers = [
  /legal basis\s*[–-]\s*draft/i,
  /this draft/i,
  /reviewed by legal counsel before publication/i,
  /Rechtsgrundlage\s*[–-]\s*Entwurfsstand/i,
  /in diesem Entwurf/i,
  /vor Veröffentlichung juristisch zu prüfen/i,
];
for (const privacyFile of ['privacy/index.html', 'de/datenschutz/index.html']) {
  const privacyHtml = read(privacyFile);
  for (const blocker of privacyReleaseBlockers) {
    if (blocker.test(privacyHtml)) fail(`${privacyFile}: contains provisional pre-publication wording`);
  }
}

const sitemap = read('sitemap.xml');
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (JSON.stringify(sitemapLocations) !== JSON.stringify([`${productionOrigin}/`, `${productionOrigin}/de/`])) {
  fail(`sitemap locations mismatch: ${sitemapLocations.join(', ')}`);
}
if (!sitemap.includes('hreflang="en"') || !sitemap.includes('hreflang="de"') || !sitemap.includes('hreflang="x-default"')) {
  fail('sitemap is missing language alternates');
}

const robots = read('robots.txt');
if (!isFullyCrawlableRobotsPolicy(robots, `${productionOrigin}/sitemap.xml`)) {
  fail('robots.txt must allow all wildcard-user-agent crawling and declare the production sitemap');
}
if (read('CNAME').trim() !== 'maxsutter.de') fail('CNAME must be maxsutter.de');

for (const cssFile of ['assets/site.css', 'style.css']) {
  const css = read(cssFile);
  for (const match of css.matchAll(/url\((['"]?)([^)'"?#]+)\1\)/gi)) {
    const target = match[2].startsWith('/')
      ? path.join(root, match[2].slice(1))
      : path.resolve(path.dirname(path.join(root, cssFile)), match[2]);
    if (!existsSync(target)) fail(`${cssFile}: missing url() target ${match[2]}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Site checks passed for ${pages.length} HTML routes.`);
}
