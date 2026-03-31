---
name: Tomorrow Follow-up Items
description: Action items to complete in next session — Facebook setup, domain deploy, news page
type: project
---

## Priority items for next session (2026-04-01 onwards)

### 1. Facebook Page Integration (HIGH)
- User deferred Facebook setup to tomorrow
- **What's needed from user:**
  - Go to https://developers.facebook.com → create an App
  - Get a Page Access Token for their CookNextDoor Facebook Page
  - Get the Facebook Page ID
  - Add both to `.env` file:
    ```
    FB_PAGE_ACCESS_TOKEN=EAA...
    FB_PAGE_ID=123456789
    SITE_URL=https://cooknextdoor.com/news.html
    ```
- `tools/post_social.js` is already built and ready — just needs credentials
- Posts up to 3 new articles per run, marks them so no double-posting
- Will also run automatically via Windows Task Scheduler (`CookNextDoor_NewsUpdate` every 2 days)

### 2. Domain Deployment (HIGH)
- GitHub repo pushed: https://github.com/geechun80/Cooknextdoor-Website
- Next step: connect GitHub repo to hosting (Netlify/Vercel/GitHub Pages recommended)
- Update `SITE_URL` in `.env` once domain is live
- Ask user what hosting provider they are using

### 3. News Page Enhancements (MEDIUM)
- Success stories and testimonials are currently placeholder/seed data
- Consider adding a simple form/submission flow for real cooks to submit their stories
- The news auto-fetches every 2 days via Windows Task Scheduler — confirm it ran after first cycle

### 4. nav links to update on all pages
- Add `<a href="news.html">📰 News</a>` to nav on: index.html, cook-register.html, cook-list-dish.html, meetup-guide.html, user-auth.html

**Why:** All these pages have nav bars but don't link to the new news page yet.
