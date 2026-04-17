# CookNextDoor API Documentation

**Base URL:** `http://localhost:3001/api` (Development)

**Authentication:** All protected endpoints require Firebase ID Token in `Authorization` header:
```
Authorization: Bearer <Firebase ID Token>
```

---

## 🔐 Authentication Endpoints

### `POST /api/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "buyer@example.sg",
  "password": "securePassword123",
  "name": "John Tan",
  "phone": "+6581234567",
  "userType": "buyer"  // "buyer", "cook", or "both"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "firebaseUID123",
  "message": "User registered successfully"
}
```

**Errors:**
- `400`: Missing required fields
- `400`: Email already exists

---

### `GET /api/auth/profile` ⭐ Protected
Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Response:**
```json
{
  "userId": "firebaseUID123",
  "email": "buyer@example.sg",
  "name": "John Tan",
  "phone": "+6581234567",
  "userType": "buyer",
  "profilePhoto": "https://...",
  "location": {
    "latitude": 1.3521,
    "longitude": 103.8198,
    "address": "123 Clementi Road",
    "block": "123",
    "postal": "123456"
  },
  "rating": 4.8,
  "reviewCount": 15,
  "verified": true,
  "createdAt": "2026-04-10T...",
  "preferences": {
    "allowNotifications": true,
    "favoriteCategories": ["Chinese", "Indian"],
    "maxDistance": 1000
  }
}
```

---

## 👤 User Management

### `GET /api/users/:userId`
Get any user's public profile (no auth required).

**Response:**
```json
{
  "userId": "firebaseUID123",
  "name": "John Tan",
  "profilePhoto": "https://...",
  "rating": 4.8,
  "reviewCount": 15,
  "bio": "Loves cooking homemade Asian food",
  "verified": true
}
```

---

### `PUT /api/users/:userId` ⭐ Protected
Update user profile (self only).

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Request:**
```json
{
  "name": "John Tan",
  "phone": "+6581234567",
  "bio": "Home cook from Clementi",
  "location": {
    "latitude": 1.3521,
    "longitude": 103.8198,
    "address": "123 Clementi Road",
    "block": "123",
    "postal": "123456"
  },
  "preferences": {
    "allowNotifications": true,
    "favoriteCategories": ["Chinese", "Indian"],
    "maxDistance": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated"
}
```

---

## 👨‍🍳 Cook Management

### `POST /api/cooks/register` ⭐ Protected
Register as a cook (seller).

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Request:**
```json
{
  "businessName": "Aunty Lim's Kitchen",
  "description": "Traditional Singaporean home cooking",
  "cuisineTypes": ["Chinese", "Malay", "Peranakan"],
  "averagePrice": 8.50,
  "location": {
    "latitude": 1.3521,
    "longitude": 103.8198,
    "address": "123 Clementi Road",
    "block": "123",
    "postal": "123456"
  },
  "operatingHours": {
    "monday": { "open": "10:00", "close": "18:00" },
    "tuesday": { "open": "10:00", "close": "18:00" }
  },
  "maxOrdersPerDay": 10,
  "prepTimeMinutes": 30
}
```

**Response:**
```json
{
  "success": true,
  "cookId": "cook123",
  "message": "Cook profile created. Pending verification."
}
```

---

### `GET /api/cooks/:cookId`
Get cook's public profile.

**Response:**
```json
{
  "cookId": "cook123",
  "userId": "firebaseUID123",
  "businessName": "Aunty Lim's Kitchen",
  "description": "Traditional Singaporean home cooking",
  "cuisineTypes": ["Chinese", "Malay"],
  "location": { ... },
  "rating": 4.9,
  "reviewCount": 45,
  "isActive": true,
  "verificationStatus": "verified",
  "operatingHours": { ... },
  "totalOrdersFulfilled": 128,
  "foodSafetyScore": 95
}
```

---

### `GET /api/cooks/nearby?latitude=1.3521&longitude=103.8198&radiusMeters=1000`
Find active verified cooks within radius.

**Query Parameters:**
- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `radiusMeters` (optional): Search radius in meters (default: 1000 = 1km)

**Response:**
```json
{
  "count": 5,
  "cooks": [
    {
      "cookId": "cook123",
      "businessName": "Aunty Lim's Kitchen",
      "location": { ... },
      "rating": 4.9,
      "reviewCount": 45
    }
  ]
}
```

---

## 🍽️ Listings (Food Dishes)

### `POST /api/listings` ⭐ Protected
Create a new food listing.

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Request:**
```json
{
  "dishName": "Chicken Rice",
  "description": "Fragrant jasmine rice with poached chicken",
  "cuisine": "Chinese",
  "category": "main",
  "price": 5.50,
  "portionSize": "3-5 servings",
  "totalPortions": 5,
  "images": [
    "https://firebasestorage.com/dish-photo-1.jpg"
  ],
  "ingredients": ["gluten", "sesame"],
  "dietary": ["halal"],
  "pickupTime": {
    "startTime": "17:00",
    "endTime": "19:00",
    "date": "2026-04-11"
  },
  "location": {
    "latitude": 1.3521,
    "longitude": 103.8198,
    "address": "123 Clementi Road, Block 123"
  },
  "pickupInstructions": "Press door bell at gate. 5th floor"
}
```

**Response:**
```json
{
  "success": true,
  "listingId": "listing123",
  "message": "Listing created successfully"
}
```

---

### `GET /api/listings`
Browse all active listings (paginated).

**Query Parameters:**
- `cuisine` (optional): Filter by cuisine type
- `status` (optional): "available", "limited", "sold_out" (default: "available")
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```
GET /api/listings?cuisine=Chinese&status=available&limit=10&offset=0
```

**Response:**
```json
{
  "count": 10,
  "listings": [
    {
      "listingId": "listing123",
      "cookId": "cook123",
      "dishName": "Chicken Rice",
      "price": 5.50,
      "portionsAvailable": 3,
      "totalPortions": 5,
      "rating": 4.8,
      "reviewCount": 12,
      "pickupTime": { ... },
      "location": { ... },
      "createdAt": "2026-04-10T..."
    }
  ]
}
```

---

### `GET /api/listings/nearby?latitude=1.3521&longitude=103.8198&radiusMeters=1000`
Find food listings within 1km radius (location-based search).

**Query Parameters:**
- `latitude` (required): User's latitude
- `longitude` (required): User's longitude
- `radiusMeters` (optional): Search radius in meters (default: 1000)

**Response:**
```json
{
  "count": 12,
  "listings": [ ... ]
}
```

---

### `GET /api/listings/:listingId`
Get single listing details.

**Response:**
```json
{
  "listingId": "listing123",
  "cookId": "cook123",
  "dishName": "Chicken Rice",
  "description": "Fragrant jasmine rice with poached chicken",
  "price": 5.50,
  "portionsAvailable": 3,
  "totalPortions": 5,
  "rating": 4.8,
  "reviewCount": 12,
  "images": [ "https://..." ],
  "ingredients": ["gluten", "sesame"],
  "dietary": ["halal"],
  "pickupTime": { ... },
  "pickupInstructions": "Press door bell at gate. 5th floor"
}
```

---

### `PUT /api/listings/:listingId` ⭐ Protected
Update listing (cook owner only).

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Request:**
```json
{
  "portionsAvailable": 2,
  "status": "limited",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing updated"
}
```

---

## 📦 Orders (Tracking Only)

### `POST /api/orders` ⭐ Protected
Create a new order. **NOTE: Payment handled offline (PayNow/PayLah/Cash).**

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Request:**
```json
{
  "cookId": "cook123",
  "listingId": "listing123",
  "quantity": 2,
  "paymentMethod": "paynow",
  "buyerNotes": "Please pack extra sauce",
  "specialRequests": ["no onions", "extra spice"]
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order123",
  "message": "Order created. Payment pending."
}
```

---

### `GET /api/orders/:orderId` ⭐ Protected
Get order details (buyer/cook/admin only).

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Response:**
```json
{
  "orderId": "order123",
  "buyerId": "buyer123",
  "cookId": "cook123",
  "listingId": "listing123",
  "dishName": "Chicken Rice",
  "quantity": 2,
  "unitPrice": 5.50,
  "totalPrice": 11.00,
  "paymentMethod": "paynow",
  "paymentStatus": "pending",
  "orderStatus": "pending",
  "pickupTime": {
    "startTime": "17:00",
    "endTime": "19:00",
    "date": "2026-04-11"
  },
  "timeline": {
    "createdAt": "2026-04-10T10:30:00Z"
  }
}
```

---

### `GET /api/users/:userId/orders` ⭐ Protected
Get buyer's order history.

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Response:**
```json
{
  "count": 5,
  "orders": [
    {
      "orderId": "order123",
      "dishName": "Chicken Rice",
      "orderStatus": "completed",
      "totalPrice": 11.00,
      "timeline": { ... }
    }
  ]
}
```

---

### `GET /api/cooks/:cookId/orders` ⭐ Protected
Get cook's incoming orders dashboard.

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Response:**
```json
{
  "count": 3,
  "orders": [
    {
      "orderId": "order123",
      "buyerId": "buyer123",
      "quantity": 2,
      "orderStatus": "pending",
      "timeline": { ... }
    }
  ]
}
```

---

### `PUT /api/orders/:orderId` ⭐ Protected
Update order status.

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Request:**
```json
{
  "orderStatus": "confirmed",
  "paymentStatus": "confirmed",
  "paymentProof": "https://storage.firebase.com/order123-proof.jpg"
}
```

Allowed `orderStatus` values:
- `pending` → Buyer placed order
- `confirmed` → Cook confirmed, preparing
- `ready` → Ready for pickup
- `picked_up` → Buyer collected
- `completed` → Order fulfilled
- `cancelled` → Cancelled by buyer
- `expired` → Not picked up in time

**Response:**
```json
{
  "success": true,
  "message": "Order updated"
}
```

---

## ⭐ Reviews & Ratings

### `POST /api/reviews` ⭐ Protected
Submit a review/rating for cook or dish.

**Headers:**
```
Authorization: Bearer <ID Token>
```

**Request:**
```json
{
  "orderId": "order123",
  "targetId": "cook123",
  "targetType": "cook",
  "rating": 5,
  "title": "Amazing home-cooked food!",
  "text": "Fresh ingredients, generous portions, very friendly cook",
  "tags": ["fresh", "tasty", "friendly"]
}
```

**Response:**
```json
{
  "success": true,
  "reviewId": "review123",
  "message": "Review submitted"
}
```

---

### `GET /api/reviews?targetId=cook123&targetType=cook`
Get reviews for a cook or dish.

**Query Parameters:**
- `targetId` (required): cookId or listingId
- `targetType` (required): "cook" or "dish"

**Response:**
```json
{
  "count": 8,
  "reviews": [
    {
      "reviewId": "review123",
      "reviewerId": "buyer123",
      "rating": 5,
      "title": "Amazing home-cooked food!",
      "text": "Fresh ingredients, generous portions...",
      "tags": ["fresh", "tasty", "friendly"],
      "createdAt": "2026-04-09T14:30:00Z",
      "helpful": 3
    }
  ]
}
```

---

## 🔧 Error Responses

All endpoints follow standard HTTP error codes:

```json
{
  "error": "Error message",
  "details": "Additional context (development only)"
}
```

| Code | Meaning |
|------|---------|
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (no permission) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## 🧪 Quick Test Examples

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "buyer@example.sg",
    "password": "test123",
    "name": "John",
    "userType": "buyer"
  }'
```

**Get Nearby Listings:**
```bash
curl "http://localhost:3001/api/listings/nearby?latitude=1.3521&longitude=103.8198&radiusMeters=1000"
```

**Get All Listings:**
```bash
curl "http://localhost:3001/api/listings?cuisine=Chinese&status=available&limit=10"
```

**Create Order (with token):**
```bash
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cookId": "cook123",
    "listingId": "listing123",
    "quantity": 2,
    "paymentMethod": "paynow"
  }'
```

---

## 🔐 Security Notes

1. **All `PUT` operations require authentication** and user ownership verification
2. **Passwords are never returned** in any response
3. **Bank details are encrypted** at rest
4. **Payment proofs are stored separately** with access controls
5. **Users can only see their own sensitive data** (orders, messages, reviews)
6. **Firestore security rules enforce these restrictions** at database level

---

## 📊 Rate Limiting (Future)

Currently no rate limiting. Recommend implementing:
- 100 requests/minute per user
- 1000 requests/minute per IP
- Exponential backoff on 429 responses

---

## 🚀 Deployment Notes

### Environment Variables Required:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
API_PORT=3001
NODE_ENV=production
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/service-key.json
```

### Firebase Rules:
Set `security rules` in Firebase Console (see FIRESTORE_SCHEMA.md for details)

### CORS:
Currently allows all origins. In production, restrict to your domain:
```javascript
app.use(cors({
  origin: 'https://cooknextdoor.sg',
  credentials: true
}));
```

---

## 📝 API Versioning

Current version: **v1**

Future versions will maintain backward compatibility. Breaking changes will be under `/api/v2/`.
