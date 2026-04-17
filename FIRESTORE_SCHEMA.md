# CookNextDoor Firestore Database Schema

## Collections Overview

### 1. **users** - Buyer/General User Profiles
```
/users/{userId}
  ├─ email: string (unique index)
  ├─ name: string
  ├─ phone: string
  ├─ profilePhoto: string (URL)
  ├─ userType: enum ["buyer", "cook", "both"]
  ├─ location: {
  │   ├─ latitude: number
  │   ├─ longitude: number
  │   ├─ address: string
  │   ├─ block: string (HDB block for Singapore)
  │   └─ postal: string
  ├─ rating: number (avg 0-5)
  ├─ reviewCount: number
  ├─ bio: string (max 200 chars)
  ├─ verified: boolean
  ├─ createdAt: timestamp
  ├─ updatedAt: timestamp
  └─ preferences: {
      ├─ allowNotifications: boolean
      ├─ favoriteCategories: string[]
      └─ maxDistance: number (1000-5000 meters)

Indexes:
- email (unique)
- location (geospatial for radius queries)
- userType
- verified
- createdAt (for "new cooks")
```

---

### 2. **cooks** - Cook/Seller Profiles (extends users collection)
```
/cooks/{cookId}
  ├─ userId: string (reference to users/{userId})
  ├─ businessName: string
  ├─ description: string
  ├─ cuisineTypes: string[] ["Indian", "Chinese", "Malay", "Italian", etc]
  ├─ averagePrice: number (SGD)
  ├─ location: { latitude, longitude, address, block, postal }
  ├─ rating: number (avg 0-5)
  ├─ reviewCount: number
  ├─ isActive: boolean (currently accepting orders)
  ├─ verificationStatus: enum ["pending", "verified", "rejected"]
  ├─ verificationDocuments: [
  │   { type: "id", url: string, uploadedAt: timestamp }
  │ ]
  ├─ bankDetails: {
  │   ├─ accountHolder: string
  │   ├─ bankCode: string
  │   ├─ accountNumber: string (encrypted)
  │   └─ verified: boolean
  ├─ operatingHours: {
  │   ├─ monday: { open: "10:00", close: "18:00" }
  │   ├─ tuesday: { open: "10:00", close: "18:00" }
  │   └─ ... (rest of week)
  ├─ maxOrdersPerDay: number
  ├─ prepTimeMinutes: number
  ├─ totalOrdersFulfilled: number
  ├─ foodSafetyScore: number (0-100, from reviews)
  ├─ createdAt: timestamp
  └─ updatedAt: timestamp

Indexes:
- userId
- verificationStatus
- isActive + location (for "nearby cooks" queries)
- rating (for "top rated")
- cuisineTypes (for filtering)
```

---

### 3. **listings** - Active Food Dishes
```
/listings/{listingId}
  ├─ cookId: string (reference to cooks/{cookId})
  ├─ dishName: string
  ├─ description: string
  ├─ cuisine: string
  ├─ category: enum ["main", "side", "dessert", "drink"]
  ├─ price: number (SGD per portion)
  ├─ portionSize: string ("3-5 servings")
  ├─ totalPortions: number (max available)
  ├─ portionsAvailable: number (remaining)
  ├─ images: [
  │   { url: string, uploadedAt: timestamp }
  │ ]
  ├─ ingredients: string[] (allergen info: "peanuts", "gluten", etc)
  ├─ dietary: string[] ["vegetarian", "vegan", "halal", etc]
  ├─ pickupTime: {
  │   ├─ startTime: string ("HH:MM")
  │   ├─ endTime: string ("HH:MM")
  │   └─ date: date
  ├─ location: { latitude, longitude, address, block }
  ├─ pickupInstructions: string
  ├─ rating: number (avg 0-5)
  ├─ reviewCount: number
  ├─ isActive: boolean (not sold out or delisted)
  ├─ status: enum ["available", "limited", "sold_out", "archived"]
  ├─ createdAt: timestamp
  ├─ updatedAt: timestamp
  └─ expiresAt: timestamp (auto-archive if not picked up)

Indexes:
- cookId
- status + expiresAt (for "current listings")
- cuisine + status (for filtering)
- location (geospatial for 1km radius)
- createdAt (for "newest")
- rating (for "top rated")
- portionsAvailable > 0 (for "available" filter)
```

---

### 4. **orders** - Order Records (Tracking Only - No Payment)
```
/orders/{orderId}
  ├─ buyerId: string (reference to users/{buyerId})
  ├─ cookId: string (reference to cooks/{cookId})
  ├─ listingId: string (reference to listings/{listingId})
  ├─ dishName: string (snapshot at order time)
  ├─ quantity: number (portions ordered)
  ├─ unitPrice: number (snapshot at order time)
  ├─ totalPrice: number (quantity × unitPrice)
  ├─ paymentMethod: enum ["paynow", "paylah", "cash"]
  ├─ paymentStatus: enum ["pending", "confirmed", "failed"]
  ├─ paymentProof: string (URL to photo/screenshot for manual verification)
  ├─ orderStatus: enum [
  │   "pending",      // Buyer placed order, waiting for cook to confirm
  │   "confirmed",    // Cook confirmed, preparing
  │   "ready",        // Ready for pickup
  │   "picked_up",    // Buyer collected
  │   "completed",    // Order fulfilled
  │   "cancelled",    // Cancelled by buyer
  │   "expired"       // Not picked up in time
  │ ]
  ├─ pickupLocation: { latitude, longitude, address, block }
  ├─ pickupTime: {
  │   ├─ startTime: string
  │   ├─ endTime: string
  │   └─ date: date
  ├─ buyerNotes: string
  ├─ cookResponse: string (if need to discuss)
  ├─ specialRequests: string[] (no onions, extra spice, etc)
  ├─ timeline: {
  │   ├─ createdAt: timestamp
  │   ├─ confirmedAt: timestamp
  │   ├─ readyAt: timestamp
  │   ├─ pickedUpAt: timestamp
  │   └─ completedAt: timestamp
  ├─ buyerRating: number (1-5) [optional, set after completion]
  ├─ buyerReview: string [optional]
  └─ cancelReason: string (if cancelled)

Indexes:
- buyerId + orderStatus (for buyer history)
- cookId + orderStatus (for cook dashboard)
- orderstatus + pickupTime (for "ready for pickup" queries)
- createdAt (for sorting)
```

---

### 5. **messages** - Chat Between Users
```
/messages/{conversationId}
  ├─ participantIds: string[] (userId1, userId2)
  ├─ lastMessage: string
  ├─ lastMessageAt: timestamp
  ├─ lastReadBy: {
  │   ├─ {userId1}: timestamp
  │   └─ {userId2}: timestamp
  ├─ isActive: boolean
  └─ messages: [
      {
        ├─ id: string
        ├─ senderId: string
        ├─ text: string
        ├─ timestamp: timestamp
        ├─ read: boolean
        └─ type: enum ["text", "order_status", "system"]
      }
    ]

Indexes:
- participantIds (for user's conversations)
- lastMessageAt (for "most recent chats")
```

---

### 6. **reviews** - Ratings & Testimonials
```
/reviews/{reviewId}
  ├─ orderId: string (reference to orders/{orderId})
  ├─ reviewerId: string (reference to users/{reviewerId})
  ├─ targetId: string (cookId or dishId being reviewed)
  ├─ targetType: enum ["cook", "dish"]
  ├─ rating: number (1-5) ⭐
  ├─ title: string
  ├─ text: string (max 500 chars)
  ├─ photos: string[] (optional - screenshot of food)
  ├─ tags: string[] ["fresh", "tasty", "value", "quick", "friendly"]
  ├─ helpful: number (count of upvotes)
  ├─ reportCount: number (for moderation)
  ├─ createdAt: timestamp
  ├─ updatedAt: timestamp
  └─ isVerified: boolean (buyer actually completed order)

Indexes:
- targetId (for "cook reviews" or "dish reviews")
- targetType + targetId
- rating (for filtering 1-5 stars)
- createdAt (for "newest reviews")
- helpful (for "most helpful")
- isVerified
```

---

### 7. **verification_queue** - Cook Verification Workflow
```
/verification_queue/{submissionId}
  ├─ cookId: string
  ├─ fullName: string
  ├─ email: string
  ├─ phone: string
  ├─ idDocument: string (URL)
  ├─ idType: enum ["nric", "passport", "fp_book"]
  ├─ businessLicense: string (URL, optional)
  ├─ foodHandlingSertificate: string (URL, optional)
  ├─ status: enum ["pending", "approved", "rejected"]
  ├─ rejectionReason: string (if rejected)
  ├─ submittedAt: timestamp
  ├─ reviewedAt: timestamp
  ├─ reviewedBy: string (admin userId)
  └─ notes: string (internal admin notes)

Indexes:
- status (for admin review queue)
- submittedAt
```

---

### 8. **admin_reports** - User Reports & Moderation
```
/admin_reports/{reportId}
  ├─ reporterId: string
  ├─ reportedUserId: string (cook or buyer)
  ├─ reportType: enum ["fraud", "unsafe_food", "harassment", "fake_profile", "other"]
  ├─ description: string
  ├─ evidence: string[] (URLs for photos/screenshots)
  ├─ relatedOrderId: string (optional)
  ├─ status: enum ["open", "investigating", "resolved", "dismissed"]
  ├─ resolution: string
  ├─ actionTaken: enum ["none", "warning", "suspension", "ban"]
  ├─ createdAt: timestamp
  ├─ resolvedAt: timestamp
  └─ resolvedBy: string (admin userId)

Indexes:
- status
- reportedUserId
- reportType
- createdAt
```

---

### 9. **notifications** - In-App Notifications (Optional)
```
/notifications/{userId}/messages/{notificationId}
  ├─ type: enum ["order_status", "payment_reminder", "new_nearby_cook", "review_received"]
  ├─ title: string
  ├─ message: string
  ├─ link: string (deep link to relevant page)
  ├─ read: boolean
  ├─ createdAt: timestamp
  └─ expiresAt: timestamp (auto-delete after 30 days)

Indexes:
- read + createdAt (for unread notifications)
```

---

### 10. **analytics** - Usage Metrics
```
/analytics/{date}
  ├─ totalOrders: number
  ├─ totalRevenue: number (user-to-user, not platform revenue)
  ├─ activeCooks: number
  ├─ newCooks: number
  ├─ topDishes: [{ dishId, orderCount }]
  ├─ topCooks: [{ cookId, orderCount }]
  ├─ avgRating: number
  ├─ locationHotspots: [{ block, orderCount }]
  └─ date: date

Indexes:
- date (for trends)
```

---

## Security Rules (Firestore)

### Key Principles:
1. Users can only read/write their own data
2. Cooks can only edit their own listings
3. Reviews cannot be modified after 7 days
4. Admins have full access
5. Payment details encrypted and admin-only

### Example Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write only their own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId || isAdmin();
      allow write: if request.auth.uid == userId;
    }

    // Cooks collection
    match /cooks/{cookId} {
      allow read: if true; // Public profile
      allow write: if request.auth.uid == resource.data.userId || isAdmin();
    }

    // Listings are public to browse
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth.uid != null;
      allow update, delete: if request.auth.uid == resource.data.cookId || isAdmin();
    }

    // Orders - buyer/cook can see their own orders
    match /orders/{orderId} {
      allow read: if request.auth.uid == resource.data.buyerId || 
                      request.auth.uid == resource.data.cookId || isAdmin();
      allow create: if request.auth.uid == request.resource.data.buyerId;
      allow update: if request.auth.uid in [resource.data.buyerId, resource.data.cookId] || isAdmin();
    }

    // Helper function
    function isAdmin() {
      return request.auth.token.admin == true;
    }
  }
}
```

---

## Storage Structure

### Firebase Storage Folders:
```
/user-profiles/{userId}/             → Profile photos
/cook-documents/verification/         → ID documents
/cook-documents/certificates/         → Food handling certs
/listings/{listingId}/                → Dish photos
/orders/{orderId}/                    → Payment proof screenshots
/reviews/{reviewId}/                  → Review photos
/admin/reports/                       → Report evidence
```

---

## Indexes to Create in Firebase Console

Run these in Firebase Console under Firestore → Indexes:

| Collection | Fields | Status |
|-----------|--------|--------|
| listings | status, expiresAt | Needed |
| listings | location, createdAt | Needed |
| cooks | isActive, location | Needed |
| orders | buyerId, orderStatus | Needed |
| orders | cookId, orderStatus | Needed |
| reviews | targetId, createdAt | Needed |
| reviews | targetType, rating | Needed |

---

## Migration Checklist

- [ ] Create Firestore collections
- [ ] Set up security rules
- [ ] Create storage folders
- [ ] Build composite indexes
- [ ] Seed initial admin user
- [ ] Set up Cloud Functions for notifications
- [ ] Configure email/SMS templates
