import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const clauseNumbers = (html) => [...html.matchAll(/<p>(\d+\.\d+)\b/g)].map((match) => match[1]);

test('German and English terms keep the same numbered structure', () => {
  const german = read('de/agb/index.html');
  const english = read('terms/index.html');

  assert.deepEqual(clauseNumbers(english), clauseNumbers(german));
  assert.match(german, /unter Angabe ihres Versionsstands/);
  assert.match(english, /identifies their version date/);
});

test('consumer withdrawal information is included without promising a separate attachment', () => {
  const german = read('de/agb/index.html');
  const english = read('terms/index.html');

  for (const [html, headings] of [
    [german, ['Widerrufsbelehrung', 'Muster-Widerrufsformular']],
    [english, ['Withdrawal Instructions', 'Model Withdrawal Form']],
  ]) {
    for (const heading of headings) assert.match(html, new RegExp(`<h3>${heading}</h3>`));
  }

  assert.doesNotMatch(german, /gesondert zur Verfügung gestellt/i);
  assert.doesNotMatch(english, /provided separately/i);

  assert.match(german, /vollständiger Erbringung der Dienstleistung/);
  assert.match(german, /bestätigt hat, dass ihm bekannt ist/);
  assert.match(english, /only upon full performance of the service/);
  assert.match(english, /confirmed their awareness/);

  assert.match(german, /Kauf der folgenden Waren \(\*\)\/die Erbringung der folgenden Dienstleistung/);
  assert.match(german, /Bestellt am \(\*\)\/erhalten am \(\*\)/);
  assert.match(english, /sale of the following goods \(\*\)\/for the supply of the following service/);
  assert.match(english, /Ordered on \(\*\)\/received on \(\*\)/);

  for (const html of [german, english]) {
    assert.match(html, /Maximilian O\. Sutter/);
    assert.match(html, /Harbatshofen 10 ½/);
    assert.match(html, /impressum@maxsutter\.de/);
  }
});

test('legal notices do not retain obsolete RStV or TMG boilerplate', () => {
  for (const file of ['de/impressum/index.html', 'legal-notice/index.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /\b(?:RStV|TMG)\b/);
  }
});

test('confidentiality rules preserve technical processing without creating a chain-of-title guarantee', () => {
  const german = read('de/agb/index.html');
  const english = read('terms/index.html');

  assert.match(german, /technischen Vertragsdurchführung nach Ziffer 10\.7/);
  assert.match(english, /technical performance of the contract under clause 10\.7/);
  assert.doesNotMatch(german, /Rechtekette/);
  assert.doesNotMatch(english, /chain of title/i);
});
