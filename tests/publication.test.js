import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildSite, siteFiles } from '../tools/build-site.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('publication preserves website files and downloads while excluding internal files and stale output', (t) => {
  const temporary = mkdtempSync(path.join(tmpdir(), 'website-publication-'));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const sourceRoot = path.join(temporary, 'source');
  const outputRoot = path.join(temporary, 'dist');
  for (const file of siteFiles) {
    const target = path.join(sourceRoot, file);
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, file), target);
  }
  const internalFiles = [
    'cutover-checklist.md', 'preview-test-report.md', 'package.json', '.env',
    '.agents/instructions.md', 'tests/test.js', 'tools/build-site.mjs',
    'assets/images/original-photo.jpg', 'assets/internal.json',
    'downloads/private-notes.txt', 'brand/max-sutter/source/build.py',
  ];
  for (const file of internalFiles) {
    const target = path.join(sourceRoot, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, 'INTERNAL TEST SENTINEL');
  }
  mkdirSync(outputRoot);
  writeFileSync(path.join(outputRoot, 'stale-internal.md'), 'STALE TEST SENTINEL');

  buildSite({ sourceRoot, outputRoot });

  for (const file of [
    'index.html', 'de/index.html', '404.html', 'de/agb/index.html',
    'assets/site.js', 'assets/site.css', 'assets/images/og-image.jpg',
    'brand/max-sutter/web-icons/favicon.svg', 'flying-speaker-notes/index.html',
    'downloads/flying-speaker-notes/Flying-Speaker-Notes-Apple-Silicon.dmg',
    'downloads/flying-speaker-notes/Flying-Speaker-Notes-Apple-Silicon.dmg.sha256',
    'CNAME', 'robots.txt', 'sitemap.xml',
  ]) {
    assert.deepEqual(readFileSync(path.join(outputRoot, file)), readFileSync(path.join(root, file)), file);
  }
  for (const file of [...internalFiles, 'stale-internal.md']) {
    assert.equal(existsSync(path.join(outputRoot, file)), false, file);
  }
  assert.ok(existsSync(path.join(outputRoot, '.nojekyll')));

  // A renamed allowlisted asset cannot publish content from an unapproved path.
  const image = path.join(sourceRoot, 'assets/images/og-image.jpg');
  rmSync(image);
  symlinkSync(path.join(sourceRoot, '.env'), image);
  assert.throws(() => buildSite({ sourceRoot, outputRoot }), /without symbolic links/);
  rmSync(image);
  assert.throws(() => buildSite({ sourceRoot, outputRoot }), /ENOENT/);
  assert.throws(() => buildSite({ sourceRoot, outputRoot: sourceRoot }), /must not replace/);
});
