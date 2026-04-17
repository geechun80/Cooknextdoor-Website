# CookNextDoor Deployment & Operations Checklist

## 🚀 Pre-Launch Checklist

### Backend Setup
- [ ] Firebase project created (cooknextdoor-eedbe)
- [ ] Firestore database created in Singapore region
- [ ] All 10 collections created
- [ ] Security rules published
- [ ] Storage bucket created
- [ ] Service key downloaded (`firebase-service-key.json`)
- [ ] `.gitignore` includes `firebase-service-key.json` and `.env.local`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Backend starts successfully (`npm run backend:dev`)
- [ ] Health check responds (`/api/health`)
- [ ] All 20+ API routes tested

### Frontend Integration
- [ ] `api-client.js` linked in HTML files
- [ ] Firebase SDK linked in HTML
- [ ] Auth forms capture input correctly
- [ ] Forms submit to API endpoints
- [ ] Token stored in localStorage after login
- [ ] API calls include auth token in header
- [ ] Error handling displays user-friendly messages
- [ ] Geolocation permission request works

### Firestore Indexes
- [ ] `listings`: status + expiresAt
- [ ] `listings`: location + createdAt  
- [ ] `cooks`: isActive + location
- [ ] `orders`: buyerId + orderStatus
- [ ] `orders`: cookId + orderStatus
- [ ] `reviews`: targetId + createdAt

### Security & Compliance
- [ ] Firebase API key is public (NEXT_PUBLIC_*)
- [ ] Service account key is secret (not in repo)
- [ ] Firestore security rules prevent unauthorized access
- [ ] CORS configured for your domain
- [ ] Rate limiting planned (not urgent for MVP)
- [ ] No hardcoded passwords/API keys
- [ ] Payment processing NOT enabled (direct user-to-user only)

### Testing
- [ ] User registration works
- [ ] Cook registration works
- [ ] Listing creation works
- [ ] Order placement works
- [ ] Nearby search functional (1km radius)
- [ ] Review submission works
- [ ] Error messages are user-friendly
- [ ] Mobile responsive

### Deployment
- [ ] Choose hosting: Heroku/Firebase/Cloud Run/DigitalOcean
- [ ] Set environment variables on server
- [ ] Database backup configured
- [ ] Logs collection enabled
- [ ] Monitoring alerts set up
- [ ] Domain pointing to API
- [ ] SSL certificate installed
- [ ] CORS whitelist updated

---

## 📋 Daily Operations

### Monitor Backend Health
```bash
# Check if server is running
curl http://localhost:3001/api/health

# View recent logs
firebase logging read --limit 20

# Check Firestore usage
firebase firestore:indexes
```

### Database Maintenance
```bash
# Backup Firestore
gcloud firestore export gs://cooknextdoor-eedbe-backups/

# Delete old orders (after 90 days)
# Use Cloud Functions or manual cleanup

# Archive completed orders
# Move to offline storage
```

### User Management
```bash
# Create admin user
firebase auth:set-custom-claims admin@example.sg --admin true

# Disable suspicious user
firebase auth:delete malicious@user.sg

# Reset user password
firebase auth:set-custom-claims user@example.sg --force-password-reset true
```

---

## 🆘 Emergency Procedures

### Backend Down
1. Check server logs: `firebase logging read --tail`
2. Verify Firebase connection: `npm run backend:dev`
3. Check API key validity in `.env.local`
4. Restart server: `kill` + `npm run backend`
5. Notify users via social media

### Database Issues
1. Check Firestore storage quota: Firebase Console → Usage
2. Create backup: `gcloud firestore export gs://bucket/backup/`
3. Check security rules haven't been modified
4. Restore from backup if needed

### Payment/Order Issues
1. **Disputed payment:** Contact cook & buyer, resolve offline
2. **Order stuck in pending:** Allow 24hrs, then archive
3. **Fake orders:** Bulk cancel if detected, ban user

### Security Incident
1. Revoke compromised service key immediately
2. Generate new `firebase-service-key.json`
3. Check audit logs for unauthorized access
4. Notify affected users
5. Reset all passwords

---

## 📊 Key Metrics to Track

| Metric | Target | Check |
|--------|--------|-------|
| **API Uptime** | 99.5% | Daily |
| **Response Time** | <500ms | Weekly |
| **Active Cooks** | Growth | Monthly |
| **Total Orders** | Growth | Weekly |
| **Avg Rating** | >4.5 ⭐ | Monthly |
| **User Growth** | +20% MoM | Monthly |
| **Error Rate** | <1% | Daily |
| **Database Usage** | <80% quota | Weekly |

---

## 🔄 Regular Maintenance Schedule

### Daily
- [ ] Check API health status
- [ ] Monitor error logs
- [ ] Verify orders are processing

### Weekly
- [ ] Database performance review
- [ ] API response time benchmark
- [ ] Security audit logs
- [ ] Backup verification

### Monthly
- [ ] Clean up old orders (archive)
- [ ] Update dependencies (`npm update`)
- [ ] Review user analytics
- [ ] Verify security rules haven't changed
- [ ] Database optimization

### Quarterly
- [ ] Load testing (simulate peak traffic)
- [ ] Security audit (penetration test)
- [ ] Performance optimization
- [ ] Disaster recovery drill
- [ ] Update documentation

---

## 🔐 Security Checklist

### Active Monitoring
- [ ] Firebase Authentication logs checked daily
- [ ] Failed login attempts tracked
- [ ] Suspicious activities flagged
- [ ] DDoS protection enabled
- [ ] WAF rules configured

### Access Control
- [ ] Only admin has console access
- [ ] Service key rotated every 90 days
- [ ] Access logs reviewed weekly
- [ ] Least privilege principle enforced
- [ ] 2FA enabled for all admins

### Data Protection
- [ ] Firestore encrypted at rest
- [ ] TLS 1.3 for transit
- [ ] Regular backups (daily)
- [ ] Sensitive data masked in logs
- [ ] GDPR compliance (if EU users)

### Incident Response
- [ ] Documented response procedures
- [ ] On-call rotation established
- [ ] Incident log maintained
- [ ] Post-mortems conducted
- [ ] Lessons documented

---

## 💰 Cost Management

### Firebase Pricing (as of April 2026)

| Service | Free Tier | Pricing |
|---------|-----------|---------|
| **Firestore** | 1GB storage | $0.06/100K reads, $0.18/100K writes |
| **Storage** | 5GB | $0.018/GB |
| **Auth** | Unlimited | Free |
| **Functions** | 2M invokes/month | $0.40/million |

### Estimated Monthly Cost (1000 daily users)
- Firestore reads: ~$50
- Firestore writes: ~$15
- Storage: ~$2
- **Total: ~$70/month** (usually under free tier)

### Cost Optimization
- [ ] Use indexes efficiently (avoid full collection scans)
- [ ] Archive old data to cheaper storage
- [ ] Batch write operations
- [ ] Use caching on frontend
- [ ] Monitor queries in Firebase Console

---

## 🧪 Testing Scenarios

### Happy Path (User Registration → Order → Delivery)
```bash
1. Register buyer → GET /api/auth/register
2. Set location → PUT /api/users/:id
3. Browse listings → GET /api/listings/nearby
4. View listing → GET /api/listings/:id
5. Create order → POST /api/orders
6. Upload payment proof → PUT /api/orders/:id
7. Cook confirms → Cook updates order status
8. Leave review → POST /api/reviews
```

### Edge Cases
- User registers twice (handled: Firebase prevents duplicate email)
- Order with 0 portions (handled: validation checks)
- Payment submitted twice (handled: check idempotency)
- Deleted listing referenced (handled: order stores snapshot)
- Concurrent order updates (handled: last-write-wins + Firestore timestamp)

---

## 📞 Support & Escalation

### Tier 1: Basic Issues
- API documentation questions → README.md
- Setup issues → BACKEND_SETUP.md
- Database schema → FIRESTORE_SCHEMA.md

### Tier 2: Technical Issues
- Backend errors → Check logs at `firebase logging`
- Database problems → Firebase Console
- Authentication issues → Firebase Auth console

### Tier 3: Missing Features
- Payment verification → TO BE IMPLEMENTED
- Messaging system → TO BE IMPLEMENTED
- Admin dashboard → TO BE IMPLEMENTED
- Notifications → TO BE IMPLEMENTED

---

## 🎯 Success Metrics

**MVP Success = These are working:**
- ✅ Users can register & authenticate
- ✅ Cooks can list food items
- ✅ Buyers can discover nearby food (1km)
- ✅ Orders can be placed & tracked
- ✅ Reviews/ratings visible
- ✅ Direct peer-to-peer payment (no money goes through platform)
- ✅ Zero commission

**Launch Readiness = Add these:**
- [ ] 10+ cooks onboarded & verified
- [ ] 50+ food listings active
- [ ] 100+ users registered
- [ ] 20+ completed orders
- [ ] Avg rating 4.0+ ⭐
- [ ] 99% backend uptime
- [ ] <500ms API response time

---

## 📚 Reference Links

- **Firebase Console:** https://console.firebase.google.com/
- **API Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Database Schema:** [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md)
- **Setup Guide:** [BACKEND_SETUP.md](BACKEND_SETUP.md)
- **Project README:** [README.md](README.md)

---

**Last Updated:** April 10, 2026

**Maintained By:** CookNextDoor Development Team

**Next Review:** April 24, 2026
