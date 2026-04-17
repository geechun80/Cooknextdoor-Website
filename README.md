# CookNextDoor - Complete Backend & Frontend Setup

Modern hyperlocal food marketplace where neighborhood home cooks sell to nearby people. Zero commission, self-pickup, direct payment.

---

## 📁 Project Structure

```
/
├── app/                          # Next.js app (future expansion)
├── chatbot/                      # Vite React chatbot (separate)
├── components/                   # UI components
├── lib/
│   ├── api-client.js            # ✨ Frontend API SDK
│   └── utils.ts
├── tools/                        # Utility scripts (news fetcher, etc)
├── workflows/                    # WAT framework documentation
│
├── backend-server.js             # ✨ Express backend (CORE)
├── FIRESTORE_SCHEMA.md           # ✨ Database structure
├── API_DOCUMENTATION.md          # ✨ Complete API reference
├── BACKEND_SETUP.md              # ✨ Setup instructions
│
├── index.html                    # Landing page
├── cook-register.html            # Cook onboarding UI
├── user-auth.html                # Buyer auth UI
├── cook-list-dish.html           # Cook's dish listing UI
├── food-mood.html                # Food discovery page
├── news.html                     # News page
│
├── package.json                  # Dependencies & scripts
├── .env.local                    # Environment variables
├── firebase-service-key.json     # (Add this - downloaded from Firebase)
└── .gitignore
```

---

## 🎯 What's Implemented

### ✅ Frontend (UI/UX)
- [x] Beautiful responsive landing page
- [x] Cook registration form (7-step)
- [x] Buyer authentication forms
- [x] Food listings UI mockup
- [x] News & testimonials page
- [x] Mobile-first design

### ⭐ Backend Ready for Production
- [x] Express.js API server with 20+ endpoints
- [x] Firebase Admin SDK integration
- [x] User management (registration, profiles, location)
- [x] Cook onboarding workflow
- [x] Food listing creation & search
- [x] Order tracking system (payment-agnostic)
- [x] Geolocation 1km radius search
- [x] Rating & review system
- [x] Firestore database schema
- [x] Security rules (access control)
- [x] Frontend API client SDK
- [x] Complete documentation

### ❌ Still Needed for Full Launch
- [ ] Connect frontend forms to API
- [ ] Payment verification (PayNow/PayLah receipt upload)
- [ ] Messaging/Chat system
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Cook verification workflow
- [ ] Mobile app (iOS/Android)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Firebase account
- npm/yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Firebase Service Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `firebase-service-key.json` in project root

### 3. Set Up Firestore Database
See [BACKEND_SETUP.md](BACKEND_SETUP.md) - Step 1

### 4. Start Backend Server
```bash
npm run backend:dev
```

Server runs on `http://localhost:3001`

### 5. Test Health Check
```bash
curl http://localhost:3001/api/health
```

Should return: `{"status":"OK","timestamp":"2026-04-10T..."}`

### 6. Explore API
See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for all endpoints

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md) | Database collections & fields |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | All 20+ API endpoints with examples |
| [BACKEND_SETUP.md](BACKEND_SETUP.md) | Step-by-step setup guide |
| [CLAUDE.md](CLAUDE.md) | WAT framework & project brief |

---

## 🔧 Development

### Run Frontend (Next.js)
```bash
npm run dev
```
Opens: `http://localhost:3000`

### Run Backend
```bash
npm run backend        # Production mode
npm run backend:dev    # Development with auto-reload
```

### Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Security Features

✅ **Already Implemented:**
- Firebase Authentication (OAuth, Email/Password)
- Firestore security rules (role-based access)
- Service account key (backend-only)
- Input validation

⚠️ **Recommended for Production:**
- HTTPS/SSL certificates
- Rate limiting on API
- CORS whitelist by domain
- Environment variables encryption
- Payment verification system
- User verification badges

---

## 📊 Database Collections

```javascript
// User Accounts
users/{userId}
  ├─ name, email, phone
  ├─ location (latitude, longitude, block)
  ├─ rating, reviewCount
  └─ preferences

// Cooks/Sellers
cooks/{cookId}
  ├─ businessName, cuisineTypes
  ├─ verificationStatus
  ├─ operatingHours
  └─ totalOrdersFulfilled

// Food Listings
listings/{listingId}
  ├─ dishName, price, portions
  ├─ images, ingredients, dietary
  ├─ pickupTime, location
  └─ rating, availability

// Orders (Tracking Only)
orders/{orderId}
  ├─ buyerId, cookId, listingId
  ├─ quantity, totalPrice
  ├─ orderStatus (pending→confirmed→ready→picked_up)
  ├─ paymentMethod, paymentStatus
  └─ timeline

// Reviews
reviews/{reviewId}
  ├─ rating, text, tags
  ├─ targetId (cook or dish)
  └─ isVerified

// Messages
messages/{conversationId}
  ├─ participantIds
  └─ messages[]

// Verification Queue
verification_queue/{submissionId}
  └─ Cook documents awaiting admin review

// Admin Reports
admin_reports/{reportId}
  └─ User reports & moderation
```

---

## 🌐 API Endpoints Summary

### Authentication
```
POST   /api/auth/register
GET    /api/auth/profile (protected)
```

### Users
```
GET    /api/users/:userId
PUT    /api/users/:userId (protected)
```

### Cooks
```
POST   /api/cooks/register (protected)
GET    /api/cooks/:cookId
GET    /api/cooks/nearby?latitude=X&longitude=Y
GET    /api/cooks/:cookId/orders (protected)
```

### Listings
```
POST   /api/listings (protected)
GET    /api/listings?status=available
GET    /api/listings/nearby?latitude=X&longitude=Y
GET    /api/listings/:listingId
PUT    /api/listings/:listingId (protected)
```

### Orders
```
POST   /api/orders (protected)
GET    /api/orders/:orderId (protected)
GET    /api/users/:userId/orders (protected)
GET    /api/cooks/:cookId/orders (protected)
PUT    /api/orders/:orderId (protected)
```

### Reviews
```
POST   /api/reviews (protected)
GET    /api/reviews?targetId=X&targetType=cook
```

---

## 🛠 Frontend Integration Guide

### How to Call API from Frontend

1. **Import the API client:**
```javascript
import { CookNextDoorAPI } from './lib/api-client.js'
const api = new CookNextDoorAPI('http://localhost:3001')
```

2. **After Firebase login:**
```javascript
// Get Firebase ID token
const token = await currentUser.getIdToken()
api.setAuthToken(token)
```

3. **Call API endpoints:**
```javascript
// Register as cook
const result = await api.cooks.register({
  businessName: 'My Kitchen',
  cuisineTypes: ['Chinese'],
  location: { latitude: 1.35, longitude: 103.82, address: '...' }
})

// Find nearby listings
const nearby = await api.listings.nearby(1.35, 103.82)

// Place order
const order = await api.orders.create({
  cookId: 'cook123',
  listingId: 'listing123',
  quantity: 2
})
```

---

## 📱 User Workflows

### Buyer Journey
1. Sign up with email/Google
2. Set location
3. Browse nearby food (1km radius)
4. Filter by cuisine/price/rating
5. Place order (direct payment to cook: PayNow/PayLah/Cash)
6. Track order status
7. Leave review

### Cook Journey
1. Sign up + Register business
2. Submit verification documents
3. Add menu items (dishes)
4. Set operating hours
5. Accept orders
6. Prepare and notify "ready"
7. User picks up
8. Get paid & receive reviews

---

## 💳 Payment Flow (No Processing)

⚠️ **CookNextDoor does NOT handle payments**

User pays **directly** to cook:
1. User sees order total: SGD $11.00
2. Generates PayNow QR code with cook's payment details
3. User scans & transfers money
4. User uploads payment screenshot
5. Cook verifies receipt
6. Order mark as "confirmed"

**Backend tracks:** Payment status (pending → confirmed) but never handles money.

---

## 🌍 Deployment

### Option 1: Heroku (Free tier)
```bash
heroku create cooknextdoor-api
git push heroku main
```

### Option 2: Firebase Cloud Functions
```bash
firebase deploy --only functions
```

### Option 3: Google Cloud Run
```bash
gcloud run deploy cooknextdoor-api --source .
```

### Frontend: Netlify/Vercel
```bash
npm run build
# Deploy /out folder to Netlify
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### API Tests (Postman Collection)
Import `postman_collection.json` for all 20+ endpoints

### Manual Testing
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.sg","password":"test123","name":"Test"}'

# List foods
curl http://localhost:3001/api/listings?status=available

# Nearby search
curl "http://localhost:3001/api/listings/nearby?latitude=1.3521&longitude=103.8198"
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if firebase-service-key.json exists
# Verify .env.local has FIREBASE_SERVICE_ACCOUNT_KEY path
# Try port 3001 is not occupied: netstat -ano | findstr :3001
```

### CORS errors
```javascript
// In backend-server.js, cors is enabled
// If issues persist, restrict to frontend domain:
app.use(cors({ origin: 'https://yourdomain.com' }));
```

### Firestore queries fail
```
→ Check security rules (allow rules for collection)
→ Create composite indexes (Firebase console shows warnings)
→ Verify authentication token is valid
```

### Images not uploading
```
→ Verify Firebase Storage bucket exists
→ Check storage security rules allow uploads
→ Create `/listings/` folder in storage
```

---

## 🚧 Roadmap

### Phase 1: MVP (Current)
- ✅ Core backend API
- ✅ Firestore database
- [ ] Connect frontend forms
- [ ] User testing

### Phase 2: Features
- [ ] Messaging system (buyer-cook chat)
- [ ] Payment verification (PayNow screenshot upload)
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Cook verification workflow

### Phase 3: Scale
- [ ] Mobile app (React Native/Flutter)
- [ ] Cloud Functions for notifications
- [ ] Advanced analytics
- [ ] Referral program
- [ ] Multi-language support

### Phase 4: Global
- [ ] Multi-city expansion
- [ ] Payment gateway integration (optional)
- [ ] Restaurant partnerships
- [ ] Corporate catering

---

## 📞 Support

For issues or questions:
1. Check [BACKEND_SETUP.md](BACKEND_SETUP.md) troubleshooting
2. Read [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Review [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md)
4. Contact: support@cooknextdoor.sg

---

## 📄 License

Licensed under ISC. See package.json

---

## 🙏 Credits

Built with:
- **Firebase** - Authentication & Firestore database
- **Express.js** - Backend API
- **React** - Frontend (future)
- **Tailwind CSS** - Styling
- **Next.js** - Static export for pages

---

**Last Updated:** April 10, 2026

**Version:** 1.0.0-beta

**Status:** 🟢 Backend ready. Frontend integration in progress.
