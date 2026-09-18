import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// This release intentionally has no public writing. Update this check only when
// Drew explicitly approves launching that section.
const output = new URL('../dist/', import.meta.url);
const root = output.pathname;
assert(!existsSync(join(root, 'writing')), 'Unapproved writing routes were generated.');
const files = directory => readdirSync(directory).flatMap(name => {
  const file = join(directory, name);
  return statSync(file).isDirectory() ? files(file) : [file];
});
for (const file of files(root).filter(file => file.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  assert(!/href=["'][^"']*\/writing(?:[\/?#"'])/i.test(html), 'Public writing link in ' + file);
}
for (const page of ['index.html', 'hello/index.html', 'contact/index.html', 'drew-cleaver.vcf']) {
  assert(existsSync(join(root, page)), 'Missing required output: ' + page);
}
console.log('Release check passed: contact routes present; writing is absent from output and navigation.');
