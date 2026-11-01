import { copyFileSync, existsSync, lstatSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Publication is opt-in, including within asset and download directories.
export const siteFiles = Object.freeze([
  '404.html',
  'CNAME',
  'agb/index.html',
  'assets/flying-notes.css',
  'assets/fonts/manrope.woff2',
  'assets/icons/LICENSE',
  'assets/icons/caret-down.svg',
  'assets/icons/close.svg',
  'assets/icons/menu.svg',
  'assets/icons/minus.svg',
  'assets/icons/plus.svg',
  'assets/images/benjamin-schwarz.jpg',
  'assets/images/hannes-muenzinger.webp',
  'assets/images/hero.avif',
  'assets/images/hero.jpg',
  'assets/images/hero.webp',
  'assets/images/logo-artus.png',
  'assets/images/logo-homenergy.svg',
  'assets/images/logo-hydr8.png',
  'assets/images/logo-kartenmacherei.svg',
  'assets/images/logo-ona.svg',
  'assets/images/maria-taugerbeck.webp',
  'assets/images/max-sutter-portrait-3320.webp',
  'assets/images/og-image.jpg',
  'assets/site.css',
  'assets/site.js',
  'brand/max-sutter/source/OFL-Manrope.txt',
  'brand/max-sutter/svg/max-sutter-horizontal-white.svg',
  'brand/max-sutter/svg/max-sutter-horizontal.svg',
  'brand/max-sutter/web-icons/apple-touch-icon.png',
  'brand/max-sutter/web-icons/favicon.ico',
  'brand/max-sutter/web-icons/favicon.svg',
  'de/agb/index.html',
  'de/datenschutz/index.html',
  'de/flying-speaker-notes/index.html',
  'de/impressum/index.html',
  'de/index.html',
  'downloads/flying-speaker-notes/Flying-Speaker-Notes-Apple-Silicon.dmg',
  'downloads/flying-speaker-notes/Flying-Speaker-Notes-Apple-Silicon.dmg.sha256',
  'downloads/flying-speaker-notes/build.json',
  'flying-speaker-notes/index.html',
  'index.html',
  'legal-notice/index.html',
  'main.js',
  'privacy/index.html',
  'robots.txt',
  'sitemap.xml',
  'style.css',
  'terms/index.html',
]);

export function buildSite({ sourceRoot = root, outputRoot = path.join(root, 'dist') } = {}) {
  sourceRoot = realpathSync(sourceRoot);
  outputRoot = path.resolve(outputRoot);
  const canonicalOutput = existsSync(outputRoot) ? realpathSync(outputRoot) : outputRoot;
  if (sourceRoot === canonicalOutput || sourceRoot.startsWith(`${canonicalOutput}${path.sep}`)) {
    throw new Error('The publication directory must not replace the source directory or its ancestors.');
  }
  for (const file of siteFiles) {
    const source = path.join(sourceRoot, file);
    if (!lstatSync(source).isFile() || realpathSync(source) !== source) {
      throw new Error(`Publication requires a regular file without symbolic links: ${file}`);
    }
  }
  rmSync(outputRoot, { recursive: true, force: true });
  for (const file of siteFiles) {
    const destination = path.join(outputRoot, file);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(path.join(sourceRoot, file), destination);
  }
  writeFileSync(path.join(outputRoot, '.nojekyll'), '');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildSite();
  console.log(`Built dist/ with ${siteFiles.length + 1} public files.`);
}
