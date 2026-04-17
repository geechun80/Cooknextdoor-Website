# Workflow: Color Contrast Audit

## Objective
Detect lime-background elements that use white text (contrast failure) across all HTML pages,
so no page ships with illegible buttons or badges.

## When to run
- After any color palette change
- After any mass find-and-replace on CSS
- Before committing HTML changes that touch button/pill/badge styles

## Tool
`tools/contrast_audit.js`

## Usage

```bash
# Scan all HTML files in project root
node tools/contrast_audit.js

# Scan specific files only
node tools/contrast_audit.js news.html food-mood.html
```

## What it checks
| Check | Level | Rule |
|---|---|---|
| lime bg + white text | FAIL | `background:var(--orange)` or `#E3EF26` + `color:#fff` |
| lime bg + non-dark text | WARN | lime bg present but `--on-lime` not explicitly set |
| white bg + lime text | WARN | `background:#fff` + `color:var(--orange)` |

## Expected output
- ✅ File name — clean
- ❌ FAIL — selector + fix hint
- ⚠️  WARN — selector + note

## Fix pattern
Any FAIL with lime background: change `color:#fff` → `color:var(--on-lime)`

```css
/* BEFORE */
.btn-primary { background: var(--orange); color: #fff; }

/* AFTER */
.btn-primary { background: var(--orange); color: var(--on-lime); }
```

## Known remaining issues (as of 2026-04-14)
- cook-list-dish.html: .prog-step.active .prog-dot, .lib-tag.active, .lib-item .check, .chip.selected, .btn-primary
- cook-register.html: .prog-step.active .prog-dot, .chip.selected, .day-chip.selected, .btn-primary
- user-auth.html: .btn-primary
