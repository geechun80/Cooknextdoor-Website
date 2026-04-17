# 🚀 CookNextDoor Backend Setup Guide

Complete setup instructions to get the backend live.

---

## **Step 1: Firebase Project Setup**

### A. Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Open project `cooknextdoor-eedbe`
3. Navigate to **Firestore Database**
4. Click **Create Database**
   - Choose mode: **Production mode** (we'll set rules next)
   - Location: **Singapore (asia-southeast1)**

### B. Create Collections

In Firestore, create these empty collections (they auto-populate with first documents):

```
- users
- cooks
- listings
- orders
- messages
- reviews
- verification_queue
- admin_reports
- notifications
- analytics
```

**Alternative:** Run this in Firestore Console's web UI to seed empty collections:
```javascript
// Go to Firestore > Get Started > console
firebase.firestore().collection('users').doc('__placeholder__').set({});
firebase.firestore().collection('cooks').doc('__placeholder__').set({});
// ... repeat for each collection
```

---

### C. Set Firestore Security Rules

1. In Firebase Console → **Firestore Database** → **Rules** tab
2. Replace with these rules:

```firestore-security-rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check admin
    function isAdmin() {
      return request.auth.token.admin == true;
    }

    // Users collection - private read/write for own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid == userId;
      allow update, delete: if request.auth.uid == userId || isAdmin();
    }

    // Cooks collection - public read, private write
    match /cooks/{cookId} {
      allow read: if true; // Public profile
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.userId || isAdmin();
    }

    // Listings - public read, cook-only write
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.cookId || isAdmin();
    }

    // Orders - buyer/cook can read/write own orders
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.buyerId || 
                      request.auth.uid == resource.data.cookId || isAdmin();
      allow create: if request.auth.uid != null;
      allow update: if request.auth.uid == resource.data.buyerId || 
                       request.auth.uid == resource.data.cookId || isAdmin();
    }

    // Messages - participants can read/write
    match /messages/{conversationId} {
      allow read: if request.auth.uid in resource.data.participantIds || isAdmin();
      allow write: if request.auth.uid != null && request.auth.uid in resource.data.participantIds;
    }

    // Reviews - public read, verified user write
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth.uid == request.resource.data.reviewerId;
      allow update: if request.auth.uid == resource.data.reviewerId && 
                       resource.data.createdAt.toMillis() + 604800000 > now.toMillis(); // 7 days
    }

    // Verification queue - user read own, admin full access
    match /verification_queue/{submissionId} {
      allow read: if request.auth.uid == resource.data.cookId || isAdmin();
      allow write: if isAdmin();
    }

    // Admin reports - admins only
    match /admin_reports/{reportId} {
      allow read, write: if isAdmin();
    }

    // Notifications - users read own
    match /notifications/{userId}/messages/{notificationId} {
      allow read: if request.auth.uid == userId;
      allow write: if isAdmin();
    }

    // Analytics - public read
    match /analytics/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

3. Click **Publish**

---

### D. Enable Firebase Storage

1. Go to **Firebase Console** → **Storage**
2. Click **Get Started**
3. Create bucket:
   - Location: **Singapore (asia-southeast1)**
   - Storage rules: Use the default rules (we'll improve later)

### E. Create Storage Folders

Go to **Storage** in Firebase Console. Create these folders by uploading a test file:
- `user-profiles/`
- `cook-documents/verification/`
- `cook-documents/certificates/`
- `listings/`
- `orders/`
- `reviews/`
- `admin/reports/`

---

### F. Download Service Account Key

This is required for the backend to communicate with Firebase.

1. Go to **Firebase Console** → **Project Settings** (⚙️ icon top left)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. Save as `firebase-service-key.json` in project root

⚠️ **IMPORTANT:** Add to `.gitignore`:
```
firebase-service-key.json
.env.local
```

---

## **Step 2: Install Dependencies**

Run in terminal:

```bash
npm install
```

This installs:
- `express` - Web server
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `firebase-admin` - Backend Firebase SDK
- `nodemon` - Auto-reload on code changes

---

## **Step 3: Configure Environment Variables**

`.env.local` already created. Verify it contains:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC3ynPUHYnPQ9msdLJNB5l-gM--CogrXAQ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=cooknextdoor-eedbe.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=cooknextdoor-eedbe
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=cooknextdoor-eedbe.firebasestorage.app
API_PORT=3001
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-key.json
```

---

## **Step 4: Start the Backend**

### Development Mode:
```bash
npm run backend:dev
```

You should see:
```
🚀 CookNextDoor Backend running on http://localhost:3001
💚 Health check: http://localhost:3001/api/health
```

### Test it:
```bash
curl http://localhost:3001/api/health
# Response: {"status":"OK","timestamp":"2026-04-10T..."}
```

---

## **Step 5: Create Indexes in Firestore**

Some queries require composite indexes. Firebase will prompt you to create them when you run certain queries, or create manually:

1. Go to **Firestore** → **Indexes** → **Composite Indexes**
2. Add these indexes:

| Collection | Fields | Status |
|-----------|--------|--------|
| `listings` | `status`, `expiresAt` | Create |
| `listings` | `status`, `createdAt` | Create |
| `listings` | `location.latitude`, `createdAt` | Create |
| `listings` | `location.longitude`, `createdAt` | Create |
| `cooks` | `isActive`, `location.latitude` | Create |
| `cooks` | `isActive`, `location.longitude` | Create |
| `orders` | `buyerId`, `orderStatus` | Create |
| `orders` | `cookId`, `orderStatus` | Create |
| `reviews` | `targetId`, `createdAt` | Create |
| `reviews` | `targetType`, `rating` | Create |

---

## **Step 6: Add Admin User (Optional)**

For admin dashboard access, set custom claims on a user:

```bash
# In Firebase Console → Authentication → Users
# Click on a user → Custom Claims (using Firebase CLI or Cloud Functions)

firebase auth:set-custom-claims email@example.com --admin true
```

---

## **Step 7: Connect Frontend to Backend**

Update your frontend forms to call the API. Example:

### Register Form (Frontend)
```javascript
// In cook-register.html or your React component
async function handleCookRegistration(formData) {
  try {
    const response = await fetch('http://localhost:3001/api/cooks/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}` // Get from Firebase Auth
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Cook registered! Awaiting verification.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## **Step 8: Deploy Backend**

### Option A: Heroku (Free tier)
```bash
heroku create cooknextdoor-api
git push heroku main
```

### Option B: Firebase Cloud Functions (Recommended for this project)
```bash
npm install -g firebase-tools
firebase deploy --only functions
```

### Option C: Google Cloud Run
```bash
gcloud run deploy cooknextdoor-api --source .
```

### Option D: DigitalOcean App Platform
1. Connect GitHub repo
2. Set environment variables
3. Deploy

---

## **Step 9: Setup Notifications (Optional)**

### Email Notifications (SendGrid)

1. Sign up for [SendGrid](https://sendgrid.com)
2. Get API key
3. Add to `.env.local`:
```
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=noreply@cooknextdoor.sg
```

### SMS Notifications (Twilio)

1. Sign up for [Twilio](https://twilio.com)
2. Get Account SID and Auth Token
3. Add to `.env.local`:
```
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+65XXXXXXXXX
```

---

## **Step 10: Monitor & Debug**

### Firestore Real-time Monitoring
```bash
firebase emulators:start
```

### Backend Logs
```bash
# Development: Check console output
# Production: Use Cloud Logging
gcloud logging read --limit 50
```

### Test API Endpoints
Use Postman or curl:

```bash
# Create user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.sg","password":"test123","name":"Test","userType":"buyer"}'

# Get health
curl http://localhost:3001/api/health

# Browse listings
curl http://localhost:3001/api/listings?status=available

# Find nearby
curl "http://localhost:3001/api/listings/nearby?latitude=1.3521&longitude=103.8198"
```

---

## **Checklist**

- [ ] Firestore database created
- [ ] Collections created
- [ ] Security rules published
- [ ] Storage bucket created
- [ ] Service account key downloaded to `firebase-service-key.json`
- [ ] Dependencies installed (`npm install`)
- [ ] Backend runs locally (`npm run backend:dev`)
- [ ] Health check responds: `http://localhost:3001/api/health`
- [ ] `.env.local` configured
- [ ] Firebase indexes created
- [ ] Frontend forms updated to call API
- [ ] Backend deployed to production

---

## **Troubleshooting**

### Backend won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <PID> /F

# Or use different port
API_PORT=3002 npm run backend
```

### Firebase auth errors
```
Error: Invalid service account
→ Download new firebase-service-key.json from Firebase Console
```

### CORS errors on frontend
```
Error: Access to XMLHttpRequest blocked by CORS policy
→ Backend has cors() enabled. If still issue, check frontend URL matches CORS config
```

### Firestore operations fail silently
```
→ Check Firestore security rules
→ Verify user authentication token is valid
→ Check custom claims if admin-only operations
```

### IndexError on large queries
```
→ Create composite index (Firebase console will provide link)
→ Or adjust query complexity
```

---

## **Next Steps**

1. ✅ **Backend running** → Start integrating frontend forms
2. **Add notifications** → Email/SMS on order updates
3. **Implement geolocation** → Better 1km radius search
4. **Add payment verification** → Process PayNow screenshots
5. **Create admin dashboard** → Manage verifications & moderation
6. **Deploy** → Move to production domain

---

**Deployed Backend URL (after setup):**
```
Production: https://cooknextdoor-api.herokuapp.com/api
Staging:    http://localhost:3001/api
```

For questions, check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) or [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md).
