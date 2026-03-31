# Workflow: News Auto-Update

## Objective
Fetch fresh Singapore & Malaysia home-cook news every 2–3 days,
update news-data.json, and optionally post to Facebook.

## Inputs
- `news-data.json` (auto-created on first run)
- `.env` with `FB_PAGE_ACCESS_TOKEN` and `FB_PAGE_ID` (optional, for social posting)

## Steps

1. Run news fetcher:
   ```
   node tools/fetch_news.js
   ```
   - Pulls from 6 Google News RSS queries (SG + MY, business / charity / culture)
   - Deduplicates against existing articles
   - Saves up to 60 articles to `news-data.json`

2. Run social poster (if FB credentials set):
   ```
   node tools/post_social.js
   ```
   - Posts up to 3 new articles to Facebook Page
   - Marks posted articles so they're never double-posted

3. The `news.html` page reads from `news-data.json` automatically — no rebuild needed.

## Schedule
This workflow is scheduled to run every 2 days via Claude Code scheduler.

## Edge Cases
- If Google News returns 0 results → skip quietly, try next query
- If FB token expired → log warning, skip social posting, continue
- Max 60 articles kept (oldest dropped first)

## Social Media Setup (one-time)
1. Go to https://developers.facebook.com
2. Create an App → Add "Facebook Login" product
3. Under "Tools" → "Graph API Explorer" → get a Page Access Token
4. Add to `.env`:
   ```
   FB_PAGE_ACCESS_TOKEN=EAA...your_token
   FB_PAGE_ID=123456789
   SITE_URL=https://cooknextdoor.com/news.html
   ```
