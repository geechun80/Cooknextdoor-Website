# Workflow: News Auto-Update

## Objective
Fetch fresh Singapore & Malaysia home-cook news every 2 days and update news-data.json.

## Steps

1. Run news fetcher:
   ```
   node tools/fetch_news.js
   ```
   - Pulls from 6 Google News RSS queries (SG + MY, business / charity / culture)
   - Deduplicates against existing articles
   - Saves up to 60 articles to `news-data.json`

2. The `news.html` page reads from `news-data.json` automatically — no rebuild needed.

## Schedule
Runs every 2 days via Windows Task Scheduler (`CookNextDoor_NewsUpdate`, 9am daily).

## Edge Cases
- If Google News returns 0 results → skip quietly, try next query
- Max 60 articles kept (oldest dropped first)
