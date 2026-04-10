# Workflow: VPS SSL + Nginx Reverse Proxy Setup

**Purpose:** Take a Node.js/Express backend running on a raw VPS port (e.g. :3001) and expose it securely via HTTPS through a subdomain (e.g. `api.yourdomain.org`). Required for any frontend on `https://` to call the backend without browser security blocks.

**When to use this:**
- Backend is running on a VPS (Hostinger, DigitalOcean, Vultr, etc.) via PM2
- Frontend is on GitHub Pages, Vercel, or any HTTPS host
- Browser blocks API calls with `Mixed Content` or `CORS` errors
- You need a clean `https://api.yourdomain.org` instead of `http://IP:PORT`

---

## Prerequisites

| Item | Detail |
|---|---|
| VPS with SSH access | Root or sudo user |
| Domain with DNS control | Namecheap, Cloudflare, GoDaddy, etc. |
| Node.js app running via PM2 | On a local port (e.g. 3001) |
| Ubuntu 20.04+ on VPS | (these commands are Ubuntu/Debian) |

---

## Step 1 — Add DNS A Record

In your domain registrar DNS panel, add:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `api` | `YOUR_VPS_IP` | Auto |

This creates `api.yourdomain.org` → VPS IP.

**Wait 5–15 minutes for DNS to propagate before continuing.**

Verify with: `nslookup api.yourdomain.org`

---

## Step 2 — SSH into VPS

```bash
ssh root@YOUR_VPS_IP
```

---

## Step 3 — Install Nginx and Certbot

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx
```

Verify nginx is running:
```bash
sudo systemctl status nginx
```

---

## Step 4 — Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/api.yourdomain.org
```

Paste this config (replace `api.yourdomain.org` and port `3001` as needed):

```nginx
server {
    listen 80;
    server_name api.yourdomain.org;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
    }
}
```

Enable it:
```bash
sudo ln -s /etc/nginx/sites-available/api.yourdomain.org /etc/nginx/sites-enabled/
sudo nginx -t        # test config — must say "syntax is ok"
sudo systemctl reload nginx
```

---

## Step 5 — Get Free SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d api.yourdomain.org
```

Follow prompts:
- Enter your email
- Agree to terms (A)
- Choose whether to share email with EFF (optional)
- Certbot auto-edits nginx config to add HTTPS

Verify HTTPS works: `curl https://api.yourdomain.org/api/health`

**SSL auto-renews** every 90 days via a cron job certbot installs automatically.

---

## Step 6 — Update Backend CORS

In your `backend-server.js`, replace `app.use(cors())` with strict origin list:

```javascript
const allowedOrigins = [
  'https://yourdomain.org',
  'https://www.yourdomain.org',
  'http://localhost:8080',  // local dev
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // curl/mobile/Postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));
```

Redeploy to VPS:
```bash
# From local machine:
scp backend-server.js root@YOUR_VPS_IP:/root/app/
ssh root@YOUR_VPS_IP "cd /root/app && pm2 restart cooknextdoor-backend"
```

---

## Step 7 — Update Frontend API URL

Change all hardcoded `http://IP:PORT` references to the new HTTPS subdomain:

```javascript
// Before (insecure, blocked by browsers on HTTPS pages)
const API_URL = 'http://72.62.192.99:3001/api/chat/message';

// After (secure, works everywhere)
const API_URL = 'https://api.yourdomain.org/api/chat/message';
```

Commit and push frontend.

---

## Step 8 — Open Firewall Port 80 & 443

If your VPS has UFW enabled:

```bash
sudo ufw allow 'Nginx Full'   # opens 80 + 443
sudo ufw status
```

---

## Verification Checklist

```bash
# 1. DNS resolves
nslookup api.yourdomain.org

# 2. HTTP redirects to HTTPS
curl -I http://api.yourdomain.org/api/health

# 3. HTTPS works
curl https://api.yourdomain.org/api/health

# 4. PM2 still running
pm2 list

# 5. Nginx running
sudo systemctl status nginx
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `502 Bad Gateway` | Node app not running | `pm2 restart your-app` |
| `certbot: domain not found` | DNS not propagated yet | Wait 15 min, retry |
| `CORS error` in browser | Origin not in allowlist | Add origin to `allowedOrigins` array |
| `Mixed Content` in console | Still calling `http://` from `https://` page | Check all API_URL references in frontend |
| `nginx: [emerg] bind() failed` | Port 80 in use | `sudo systemctl stop apache2` |
| SSL cert expires | Auto-renew failed | `sudo certbot renew --dry-run` |

---

## If VPS Already Has Traefik (skip nginx entirely)

Hostinger VPS and many managed VPS providers pre-install **Traefik** as the reverse proxy. If port 80 is taken by `traefik`, do NOT install nginx — use Traefik's file provider instead.

**Check first:**
```bash
ss -tlnp | grep ':80'
# If you see traefik → follow steps below
```

**Step A — Create dynamic route file:**
```bash
mkdir -p /etc/traefik/dynamic
cat > /etc/traefik/dynamic/yourdomain-api.yml << 'EOF'
http:
  routers:
    yourapp-api:
      rule: "Host(`api.yourdomain.org`)"
      entrypoints:
        - websecure
      tls:
        certResolver: letsencrypt
      service: yourapp-api-svc
  services:
    yourapp-api-svc:
      loadBalancer:
        servers:
          - url: "http://localhost:3001"
EOF
```

**Step B — Add file provider to Traefik docker-compose:**
```bash
# Find Traefik compose file
docker inspect traefik-traefik-1 --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}'
# Edit that docker-compose.yml — add these two lines:
#   command: - --providers.file.directory=/etc/traefik/dynamic
#             - --providers.file.watch=true
#   volumes:  - /etc/traefik/dynamic:/etc/traefik/dynamic:ro
```

**Step C — Restart Traefik:**
```bash
cd /docker/traefik && docker compose up -d
# Traefik auto-issues Let's Encrypt cert — no certbot needed
```

**Verify:**
```bash
curl https://api.yourdomain.org/api/health
```

---

## Lessons Learned (CookNextDoor project)

- **Root cause of broken chatbot:** Frontend on `https://cooknextdoor.org` was calling `http://72.62.192.99:3001` — browsers block mixed content (HTTPS page → HTTP API)
- **Secondary issue:** `app.use(cors())` with no config allows all origins — fine for dev, security risk in prod
- **Check for Traefik before installing nginx** — Hostinger VPS ships with Traefik pre-installed; installing nginx causes port 80 conflict
- **Traefik `network_mode: host`** means it can reach `localhost:3001` directly — no Docker networking needed for PM2 apps
- **File provider** is the clean way to add non-Docker services to Traefik — no need to Dockerize everything
- **Let's Encrypt is free** and auto-renews — Traefik handles this automatically, no certbot needed
- **Always test with `curl https://...`** before debugging the browser
- **Chat/public endpoints must not have `verifyToken` middleware** — anonymous users can't get Firebase tokens

---

## For CookNextDoor Specifically

- VPS IP: `72.62.192.99`
- API subdomain: `api.cooknextdoor.org`
- Backend port: `3001`
- PM2 app name: `cooknextdoor-backend`
- Frontend origin: `https://cooknextdoor.org`
