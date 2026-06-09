import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['app', 'components', 'contexts', 'lib', 'messages', 'docs', 'tests', '.github'];
const ignoredDirectories = new Set([
  '.git',
  '.next',
  'coverage',
  'node_modules',
  'playwright-report',
  'test-results',
]);
const textFilePattern = /\.(css|json|md|mjs|ts|tsx|yml|yaml)$/;

const mojibakePatterns = [
  { name: 'latin1-vietnamese-tone-below', pattern: /\u00e1\u00ba/u },
  { name: 'latin1-vietnamese-tone-hook', pattern: /\u00e1\u00bb/u },
  { name: 'broken-dong-symbol', pattern: /\u00e2\u201a\u00ab/u },
  { name: 'broken-copyright', pattern: /\u00c2\u00a9/u },
  { name: 'broken-vietnamese-d', pattern: /\u00c4[\u0090\u2018]/u },
  { name: 'broken-vietnamese-u', pattern: /\u00c6\u00b0/u },
  { name: 'broken-common-ca', pattern: /c\u0102\u00a1i/u },
  { name: 'broken-common-co', pattern: /C\u0102\u00b4/u },
];

const failures = [];

function scanFile(filePath) {
  const contents = readFileSync(filePath, 'utf8');
  for (const { name, pattern } of mojibakePatterns) {
    const match = pattern.exec(contents);
    if (!match) continue;

    const lineNumber = contents.slice(0, match.index).split(/\r?\n/).length;
    failures.push(`${filePath}:${lineNumber} matched ${name}`);
  }
}

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;

    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (entry.isFile() && textFilePattern.test(entry.name)) {
      scanFile(entryPath);
    }
  }
}

for (const root of roots) {
  walk(root);
}

if (failures.length > 0) {
  console.error('Mojibake-like text found:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Encoding smoke passed.');
