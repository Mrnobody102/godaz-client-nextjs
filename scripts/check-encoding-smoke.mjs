import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const roots = ['app', 'components', 'contexts', 'lib', 'messages', 'docs', 'stores', 'tests', '.github'];
const rootFiles = [
  '.env.example',
  '.gitignore',
  'eslint.config.mjs',
  'next.config.ts',
  'package.json',
  'playwright.config.ts',
  'proxy.ts',
  'tsconfig.json',
];
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
const accentlessVietnamesePatterns = [
  { name: 'accentless-vui-long', pattern: /\bVui long\b/u },
  { name: 'accentless-khong', pattern: /\bKhong\b/u },
  { name: 'accentless-dang', pattern: /\bDang (nhap|dat|tai|xu ly|giao)\b/u },
  { name: 'accentless-thanh-toan', pattern: /\b(thanh toan|Thanh toan)\b/u },
  { name: 'accentless-giao-hang', pattern: /\b(giao hang|Giao hang)\b/u },
  { name: 'accentless-phuong-thuc', pattern: /\b(Phuong thuc|phuong thuc)\b/u },
  { name: 'accentless-order-copy', pattern: /\b(Tam tinh|Tong cong|Tong tien|Giam gia|Ma giam gia)\b/u },
  { name: 'accentless-address-copy', pattern: /\b(Dia chi|Nhap dia|Luu dia|Quan\/Huyen)\b/u },
  { name: 'accentless-status-copy', pattern: /\b(Cho thanh toan|Da thanh toan|Da giao|Da huy|Da hoan tien)\b/u },
];
const blockedPatterns = [...mojibakePatterns, ...accentlessVietnamesePatterns];

const failures = [];

function scanFile(filePath) {
  const contents = readFileSync(filePath, 'utf8');
  for (const { name, pattern } of blockedPatterns) {
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

for (const filePath of rootFiles) {
  scanFile(filePath);
}

if (failures.length > 0) {
  console.error('Mojibake-like text found:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Encoding smoke passed.');
