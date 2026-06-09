import { execSync } from 'node:child_process';

let audit;

try {
  const output = execSync('npm audit --omit=dev --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  audit = JSON.parse(output);
} catch (error) {
  if (!error.stdout) {
    throw error;
  }
  audit = JSON.parse(error.stdout.toString('utf8'));
}

const vulnerabilities = Object.values(audit.vulnerabilities || {});
const blocking = vulnerabilities.filter(
  (item) => item.severity === 'high' || item.severity === 'critical'
);

if (blocking.length > 0) {
  console.error('Production dependency audit failed:');
  for (const item of blocking) {
    const via = Array.isArray(item.via)
      ? item.via
          .map((entry) => (typeof entry === 'string' ? entry : entry.title))
          .filter(Boolean)
          .join('; ')
      : '';
    console.error(`- ${item.name}: ${item.severity}${via ? ` (${via})` : ''}`);
  }
  process.exit(1);
}

const totals = audit.metadata?.vulnerabilities || {};
console.log(
  `Production audit passed. moderate=${totals.moderate || 0}, low=${totals.low || 0}`
);
