@echo off
cd /d "C:\Users\65945\CookNextDoor Website"
echo [%date% %time%] Starting CookNextDoor news update... >> logs\news_update.log
node tools/fetch_news.js >> logs\news_update.log 2>&1
node tools/post_social.js >> logs\news_update.log 2>&1
echo [%date% %time%] Done. >> logs\news_update.log
