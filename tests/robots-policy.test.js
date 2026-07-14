import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectRobotsPolicy, isFullyCrawlableRobotsPolicy } from '../tools/robots-policy.mjs';

const sitemap = 'https://maxsutter.de/sitemap.xml';

test('accepts a fully crawlable wildcard policy', () => {
  const policy = inspectRobotsPolicy(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`);

  assert.equal(policy.allowsRoot, true);
  assert.deepEqual(policy.wildcardDisallows, []);
  assert.deepEqual(policy.sitemaps, [sitemap]);
  assert.equal(isFullyCrawlableRobotsPolicy(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, sitemap), true);
});

test('reports a wildcard rule that blocks a production route', () => {
  const policy = inspectRobotsPolicy(`User-agent: *\nAllow: /\nDisallow: /de/\n\nSitemap: ${sitemap}\n`);

  assert.deepEqual(policy.wildcardDisallows, ['/de/']);
  assert.equal(isFullyCrawlableRobotsPolicy(`User-agent: *\nAllow: /\nDisallow: /de/\n\nSitemap: ${sitemap}\n`, sitemap), false);
});

test('does not treat a named crawler group as the wildcard policy', () => {
  const policy = inspectRobotsPolicy(`User-agent: ExampleBot\nDisallow: /private/\n\nUser-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`);

  assert.equal(policy.allowsRoot, true);
  assert.deepEqual(policy.wildcardDisallows, []);
  assert.equal(isFullyCrawlableRobotsPolicy(`User-agent: ExampleBot\nDisallow: /private/\n\nUser-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, sitemap), true);
});
