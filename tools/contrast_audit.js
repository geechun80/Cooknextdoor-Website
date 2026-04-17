#!/usr/bin/env node
/**
 * contrast_audit.js
 * Scans HTML files for lime-background elements that use white text (contrast failure).
 *
 * Rules checked:
 *   FAIL  — background is lime (#E3EF26 / var(--orange)) AND color is #fff / white / rgba(255,255,255,1)
 *   WARN  — background is lime AND color is not explicitly set to --on-lime / #06231D
 *   WARN  — background is white / #fff AND color is #E3EF26 / var(--orange)  (lime text on white)
 *
 * Usage:
 *   node tools/contrast_audit.js              # scans all .html in project root
 *   node tools/contrast_audit.js news.html    # scans specific file(s)
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT      = path.join(__dirname, '..');
const LIME_HEX  = ['#e3ef26', '#E3EF26'];
const LIME_VAR  = ['var(--orange)'];
const DARK_OK   = ['var(--on-lime)', '#06231d', '#06231D'];
const WHITE_PAT = /(?:^|;|\s)color\s*:\s*(#fff\b|white\b|rgba\(255\s*,\s*255\s*,\s*255\s*,\s*1\)|rgb\(255\s*,\s*255\s*,\s*255\))/i;
const BG_LIME   = /background(?:-color)?\s*:\s*(#[Ee]3[Ee][Ff]26|var\(--orange\))/i;
const BG_WHITE  = /background(?:-color)?\s*:\s*(#fff\b|white\b|#ffffff\b)/i;
const COLOR_LIME = /(?:^|;|\s)color\s*:\s*(#[Ee]3[Ee][Ff]26|var\(--orange\))/i;

// ── Helpers ───────────────────────────────────────────────────────────────────
function isLimeBg(rule)  { return BG_LIME.test(rule); }
function isWhiteBg(rule) { return BG_WHITE.test(rule); }
function hasWhiteText(rule) { return WHITE_PAT.test(rule); }
function hasLimeText(rule)  { return COLOR_LIME.test(rule); }
function hasDarkText(rule)  { return DARK_OK.some(t => rule.includes(t)); }

// Split a <style> block or inline style into individual selector-rule chunks
function extractStyleRules(css) {
  const rules = [];
  // Match selector { ... } blocks
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    rules.push({ selector: m[1].trim(), body: m[2] });
  }
  return rules;
}

// Extract inline style="..." attributes with a rough line number
function extractInlineStyles(html) {
  const results = [];
  const re = /style="([^"]*)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const lineNum = html.slice(0, m.index).split('\n').length;
    results.push({ body: m[1], line: lineNum, selector: `[inline style ~line ${lineNum}]` });
  }
  return results;
}

function auditFile(filePath) {
  const src  = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // 1. CSS rules inside <style> blocks
  const styleBlocks = [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)];
  for (const block of styleBlocks) {
    const rules = extractStyleRules(block[1]);
    for (const rule of rules) {
      if (isLimeBg(rule.body) && hasWhiteText(rule.body)) {
        issues.push({ level: 'FAIL', selector: rule.selector, note: 'lime background + white text — use color:var(--on-lime)' });
      } else if (isLimeBg(rule.body) && !hasDarkText(rule.body) && rule.body.includes('color')) {
        issues.push({ level: 'WARN', selector: rule.selector, note: 'lime background — verify text is not white' });
      }
      if (isWhiteBg(rule.body) && hasLimeText(rule.body)) {
        issues.push({ level: 'WARN', selector: rule.selector, note: 'white background + lime text — low contrast' });
      }
    }
  }

  // 2. Inline styles
  const inlines = extractInlineStyles(src);
  for (const rule of inlines) {
    if (isLimeBg(rule.body) && hasWhiteText(rule.body)) {
      issues.push({ level: 'FAIL', selector: rule.selector, note: 'lime background + white text (inline)' });
    }
    if (isWhiteBg(rule.body) && hasLimeText(rule.body)) {
      issues.push({ level: 'WARN', selector: rule.selector, note: 'white background + lime text (inline)' });
    }
  }

  return issues;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let files;

if (args.length > 0) {
  files = args.map(f => path.isAbsolute(f) ? f : path.join(ROOT, f));
} else {
  files = fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(ROOT, f));
}

let totalFail = 0;
let totalWarn = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) {
    console.log(`\n  [SKIP] File not found: ${filePath}`);
    continue;
  }
  const issues = auditFile(filePath);
  const rel = path.relative(ROOT, filePath);
  const fails = issues.filter(i => i.level === 'FAIL');
  const warns = issues.filter(i => i.level === 'WARN');
  totalFail += fails.length;
  totalWarn += warns.length;

  if (issues.length === 0) {
    console.log(`\n  ✅  ${rel} — no contrast issues found`);
  } else {
    console.log(`\n  📄  ${rel}`);
    for (const iss of issues) {
      const icon = iss.level === 'FAIL' ? '  ❌ FAIL' : '  ⚠️  WARN';
      console.log(`${icon}  ${iss.note}`);
      console.log(`         Selector: ${iss.selector.slice(0, 120)}`);
    }
  }
}

console.log(`\n${'─'.repeat(60)}`);
console.log(`  Total: ${totalFail} FAIL  |  ${totalWarn} WARN`);
if (totalFail === 0 && totalWarn === 0) {
  console.log('  All clear — lime contrast looks good across all scanned files.');
}
console.log('');
