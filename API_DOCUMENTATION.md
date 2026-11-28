# CookNextDoor API Documentation

This document describes what `backend-server.js` actually does. Where the code has a known bug or a gap, it says so; see **⚠️ Known Issues** near the end.

**Base URL:**
- Development: `http://localhost:3001/api`
- Production: `https://api.cooknextdoor.org/api` (from the deployment notes; the server code itself doesn't set a domain)

**Authentication:** Protected endpoints (marked ⭐) need a Firebase ID token in the `Authorization` header:
```
Authorization: Bearer <Firebase ID Token>
```
- No token: `401 {"error": "Missing token"}`
- Bad or expired token: `401 {"error": "Invalid token", "details": "<Firebase error message>"}`

"Admin" below means a Firebase token carrying the custom claim `admin: true`.

**General behaviour:**
- Request bodies can be JSON or URL-encoded, up to **2 MB**. A Firestore document can't exceed 1 MB anyway, so keep images as compact data-URLs.
- Every `/api` route except `/api/health` is rate-limited per IP (see Rate Limiting).
- Firestore timestamps (`createdAt`, `updatedAt`, `timeline.*`) come back as Firestore Timestamp objects, which serialize as `{"_seconds": 1775817000, "_nanoseconds": 0}`, not ISO strings. Only `/api/health` returns an ISO string.
- Most read endpoints return the **whole Firestore document** plus its ID. The examples below show the full stored shape.
- Routes have no version prefix (no `/v1`).

---

## 💚 Health

### `GET /api/health`
Liveness check. No auth.

**Response:**
```json
{ "status": "OK", "timestamp": "2026-11-28T06:00:00.000Z" }
```

---

## 🔐 Authentication Endpoints

### `POST /api/auth/register`
Creates a Firebase Auth user and a `users/{uid}` document. No auth.

**Request:**
```json
{
  "email": "buyer@example.sg",
  "password": "securePassword123",
  "name": "John Tan",
  "phone": "+6581234567",
  "userType": "buyer"
}
```
- Required: `email`, `password`, `name`.
- `phone` defaults to `""`. `userType` defaults to `"buyer"` and must be `"buyer"`, `"cook"` or `"both"`.

**What gets stored** in `users/{uid}`: `email`, `name`, `phone`, `userType`, `profilePhoto: ""`, `location: {latitude: null, longitude: null, address: "", block: "", postal: ""}`, `rating: 0`, `reviewCount: 0`, `bio: ""`, `verified: false`, `createdAt`, `updatedAt`, `preferences: {allowNotifications: true, favoriteCategories: [], maxDistance: 1000}`. The password goes to Firebase Auth only; it's never stored in Firestore.

**Response:**
```json
{
  "success": true,
  "userId": "firebaseUID123",
  "message": "User registered successfully"
}
```

**Errors:**
- `400 {"error": "Missing required fields"}`
- `400 {"error": "userType must be one of: buyer, cook, both"}`
- `400 {"error": "Email already exists"}`
- `400 {"error": "Invalid email address"}`
- `400 {"error": "Password must be at least 6 characters"}`
- `400 {"error": "Invalid name"}`
- `500 {"error": "Internal server error"}` for any other failure (the details are logged on the server)

---

### `GET /api/auth/profile` ⭐ Protected
Returns the signed-in user's full `users/{uid}` document.

**Response:**
```json
{
  "userId": "firebaseUID123",
  "email": "buyer@example.sg",
  "name": "John Tan",
  "phone": "+6581234567",
  "userType": "buyer",
  "profilePhoto": "",
  "location": {
    "latitude": 1.3521,
    "longitude": 103.8198,
    "address": "123 Clementi Road",
    "block": "123",
    "postal": "123456"
  },
  "rating": 0,
  "reviewCount": 0,
  "bio": "",
  "verified": false,
  "createdAt": { "_seconds": 1775817000, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1775817000, "_nanoseconds": 0 },
  "preferences": {
    "allowNotifications": true,
    "favoriteCategories": ["Chinese", "Indian"],
    "maxDistance": 1000
  }
}
```

**Errors:** `404 {"error": "User not found"}` if there's no `users/{uid}` document.

---

## 👤 User Management

### `GET /api/users/:userId`
Returns a user's **public** profile. **No auth required.** Only these fields are returned; email, phone, address, location and preferences never are.

**Response:**
```json
{
  "userId": "firebaseUID123",
  "name": "John Tan",
  "profilePhoto": "",
  "rating": 4.8,
  "reviewCount": 15,
  "bio": "Loves cooking homemade Asian food",
  "verified": true
}
```

**Errors:** `404 {"error": "User not found"}`

---

### `PUT /api/users/:userId` ⭐ Protected
Updates a profile. Allowed for the user themself or an admin; anyone else gets `403 {"error": "Unauthorized"}`.

**Request** (all fields optional):
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
- Only these five fields can be changed. Other fields (`userType`, `verified`, `email` and so on) are ignored.
- Only the fields you send are changed. A field you send is saved even when empty, so `"phone": ""` or `"bio": ""` clears it.
- `name` must be non-empty text and is trimmed. `phone` and `bio` must be text. `location` and `preferences` must be objects.
- `location` and `preferences` **replace** the whole stored object; they aren't merged.

**Response:**
```json
{ "success": true, "message": "Profile updated" }
```

**Errors:** `400` for an invalid field, `403 {"error": "Unauthorized"}`, `404 {"error": "User not found"}` if there's no `users/{userId}` document

---

## 👨‍🍳 Cook Management

### `POST /api/cooks/register` ⭐ Protected
Creates a new cook profile in `cooks/{autoId}` that belongs to the signed-in user.

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
- Required: `businessName`, and `location` with numeric `latitude` and `longitude`.
- **One cook profile per user.** If the user already has one, you get `409` with its `cookId`.
- Defaults: `description: ""`, `cuisineTypes: []`, `averagePrice: 0`, `operatingHours: {}`, `maxOrdersPerDay: 10`, `prepTimeMinutes: 30`.
- The server also stores `userId`, `rating: 0`, `reviewCount: 0`, `isActive: true`, `verificationStatus: "pending"`, `verificationDocuments: []`, `bankDetails: {accountHolder: "", bankCode: "", accountNumber: "", verified: false}`, `totalOrdersFulfilled: 0`, `foodSafetyScore: 0`, `createdAt` and `updatedAt`.
- New cooks start as `"pending"` and don't appear in `GET /api/cooks/nearby` until an admin verifies them with `PUT /api/cooks/:cookId/verification`.

**Response:**
```json
{
  "success": true,
  "cookId": "cook123",
  "message": "Cook profile created. Pending verification."
}
```

**Errors:**
- `400 {"error": "Missing required fields"}`
- `400 {"error": "location.latitude and location.longitude must be valid numbers"}`
- `409 {"error": "You already have a cook profile", "cookId": "cook123"}`

---

### `PUT /api/cooks/:cookId/verification` ⭐ Protected (admin only)
Sets a cook's verification status. Only `"verified"` cooks appear in nearby search.

**Request:**
```json
{ "verificationStatus": "verified" }
```
`verificationStatus` must be `"pending"`, `"verified"` or `"rejected"`. The server also stores `verificationUpdatedAt` and `verificationUpdatedBy` (the admin's uid).

**Response:**
```json
{ "success": true, "message": "Cook verified" }
```

**Errors:** `403 {"error": "Admin only"}`, `400` for a bad value, `404 {"error": "Cook not found"}`

---

### `GET /api/cooks/:cookId`
Returns the cook document **without** `bankDetails` and `verificationDocuments` (those two are never sent by public endpoints). No auth.

**Response:**
```json
{
  "cookId": "cook123",
  "userId": "firebaseUID123",
  "businessName": "Aunty Lim's Kitchen",
  "description": "Traditional Singaporean home cooking",
  "cuisineTypes": ["Chinese", "Malay"],
  "averagePrice": 8.5,
  "location": { "latitude": 1.3521, "longitude": 103.8198, "address": "...", "block": "...", "postal": "..." },
  "rating": 4.9,
  "reviewCount": 45,
  "isActive": true,
  "verificationStatus": "verified",
  "operatingHours": { "...": "..." },
  "maxOrdersPerDay": 10,
  "prepTimeMinutes": 30,
  "totalOrdersFulfilled": 128,
  "foodSafetyScore": 95,
  "createdAt": { "_seconds": 1775817000, "_nanoseconds": 0 },
  "updatedAt": { "_seconds": 1775817000, "_nanoseconds": 0 }
}
```

**Errors:** `404 {"error": "Cook not found"}`

---

### `GET /api/cooks/nearby?latitude=1.3521&longitude=103.8198&radiusMeters=1000`

Finds active, **verified** cooks near a point. No auth. (In the code this route must stay registered above `/api/cooks/:cookId`, or `nearby` gets treated as a cook ID.)

**Query parameters:**
- `latitude` (required)
- `longitude` (required)
- `radiusMeters` (optional, default `1000`). **Capped at 1000** (the 1km product rule): a larger or invalid value is treated as 1000.

**How the search works:** it's a square bounding box, not a circle: latitude ± `radiusMeters / 111000` and longitude ± `radiusMeters / (111000 × cos(latitude))`, filtered to `isActive == true` and `verificationStatus == "verified"`. It needs a Firestore composite index (see Firestore Indexes).

**Response:** `{"count": <n>, "cooks": [<cook documents with cookId, without bankDetails and verificationDocuments>]}`

**Errors:** `400 {"error": "Missing latitude/longitude"}`, `400 {"error": "Invalid latitude/longitude"}`

---

## 🍽️ Listings (Food Dishes)

### `POST /api/listings` ⭐ Protected
Creates a listing in `listings/{autoId}` for the signed-in user's cook profile.

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
  "images": ["data:image/jpeg;base64,..."],
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
- **Required:** `dishName` (text), `price` (a number, 0 or more), `totalPortions` (a whole number, at least 1), `pickupTime` (an object), and `location` with numeric `latitude` and `longitude`.
- `images` are stored as given. The project has no Cloud Storage bucket, so images are sent as compact data-URLs (or other URLs).
- Defaults: `description: ""`, `cuisine: ""`, `category: "main"`, `portionSize: "3-5 servings"`, `images: []`, `ingredients: []`, `dietary: []`, `pickupInstructions: ""`.
- The server also stores `cookId`, `portionsAvailable` (= `totalPortions`), `rating: 0`, `reviewCount: 0`, `isActive: true`, `status: "available"`, `createdAt`, `updatedAt` and `expiresAt` (now + 7 days). `expiresAt` is for information only: listings don't expire or hide automatically. A cook hides one with `isActive: false`.

**Response:**
```json
{
  "success": true,
  "listingId": "listing123",
  "message": "Listing created successfully"
}
```

**Errors:**
- `400` naming the missing or invalid field, for example `{"error": "price must be a number of 0 or more"}`
- `400 {"error": "User is not a registered cook"}` if the user has no cook profile

---

### `GET /api/listings`
Lists active listings (`isActive == true`), newest first. No auth.

**Query parameters:**
- `cuisine` (optional): exact match.
- `status` (optional, default `"available"`): exact match. Listing statuses are `"available"`, `"limited"` and `"sold_out"`. Passing an empty value (`?status=`) turns the status filter off.
- `limit` (optional, default `20`, between 1 and **100**; larger values are treated as 100).
- `offset` (optional, default `0`).

**Example:**
```
GET /api/listings?cuisine=Chinese&status=available&limit=10&offset=0
```

**Response:** `{"count": <n>, "listings": [<full listing documents with listingId>]}`. Each listing has every stored field listed under `POST /api/listings`.

---

### `GET /api/listings/nearby?latitude=1.3521&longitude=103.8198&radiusMeters=1000`
Finds listings near a point, newest first. No auth.

**Query parameters:**
- `latitude` (required)
- `longitude` (required)
- `radiusMeters` (optional, default `1000`, **capped at 1000**).

Uses the same square bounding box as nearby cooks, filtered to `status == "available"` and `isActive == true`. It needs a Firestore composite index.

**Response:** `{"count": <n>, "listings": [<full listing documents with listingId>]}`

**Errors:** `400 {"error": "Missing latitude/longitude"}`, `400 {"error": "Invalid latitude/longitude"}`

---

### `GET /api/listings/:listingId`
Returns the whole listing document. No auth.

**Errors:** `404 {"error": "Listing not found"}`

---

### `PUT /api/listings/:listingId` ⭐ Protected
Updates a listing. Only the owner can do this: the caller's first cook profile must match the listing's `cookId`.

**Request** (all optional):
```json
{
  "portionsAvailable": 2,
  "status": "limited",
  "isActive": true
}
```
Only these three fields can change:
- `portionsAvailable`: a whole number, 0 or more
- `status`: `"available"`, `"limited"` or `"sold_out"`
- `isActive`: `true` or `false`

**Response:**
```json
{ "success": true, "message": "Listing updated" }
```

**Errors:** `400` for an invalid value, `404 {"error": "Listing not found"}`, `403 {"error": "Unauthorized"}`

---

## 📦 Orders (Tracking Only)

The platform only tracks orders. **Payment happens directly between buyer and cook (PayNow / PayLah / cash)**, and there's no payment gateway, fee or commission. **Pickup only; no delivery.**

### `POST /api/orders` ⭐ Protected
Creates an order in `orders/{autoId}` and takes the portions off the listing.

**Request:**
```json
{
  "listingId": "listing123",
  "quantity": 2,
  "paymentMethod": "paynow",
  "buyerNotes": "Please pack extra sauce",
  "specialRequests": ["no onions", "extra spice"]
}
```
- `listingId`: required.
- `quantity`: required, a whole number of at least 1.
- `paymentMethod`: required, `"paynow"`, `"paylah"` or `"cash"`.
- `cookId` is **not** needed: the order always uses the listing's cook. A `cookId` in the request is ignored.
- The listing must be active and not `"sold_out"`, with enough portions left.

**What gets stored:** `buyerId`, `cookId` (from the listing), `listingId`, `dishName`, `quantity`, `unitPrice` (the listing's price), `totalPrice` (= `unitPrice × quantity`, no fees), `paymentMethod`, `paymentStatus: "pending"`, `paymentProof: ""`, `orderStatus: "pending"`, `pickupLocation` (the listing's location), `pickupTime`, `buyerNotes`, `cookResponse: ""`, `specialRequests`, `timeline: {createdAt}`.

**Side effect:** in the same transaction, the listing's `portionsAvailable` goes down by `quantity`, and its `status` becomes `"sold_out"` when it reaches 0. Two orders placed at the same moment can't oversell.

**Response:**
```json
{
  "success": true,
  "orderId": "order123",
  "message": "Order created. Payment pending."
}
```

**Errors:**
- `400` for an invalid `listingId`, `quantity` or `paymentMethod`
- `404 {"error": "Listing not found"}`
- `400 {"error": "Listing is not available"}` (inactive or sold out)
- `400 {"error": "Not enough portions available"}`

---

### `GET /api/orders/:orderId` ⭐ Protected
Returns the whole order document.

**Who can read it:** the buyer, the cook (the owner of the listing's cook profile), or an admin.

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
  "paymentProof": "",
  "orderStatus": "pending",
  "pickupLocation": { "latitude": 1.3521, "longitude": 103.8198, "address": "..." },
  "pickupTime": {
    "startTime": "17:00",
    "endTime": "19:00",
    "date": "2026-04-11"
  },
  "buyerNotes": "Please pack extra sauce",
  "cookResponse": "",
  "specialRequests": ["no onions", "extra spice"],
  "timeline": {
    "createdAt": { "_seconds": 1775817000, "_nanoseconds": 0 }
  }
}
```

**Errors:** `404 {"error": "Order not found"}`, `403 {"error": "Unauthorized"}`

---

### `GET /api/users/:userId/orders` ⭐ Protected
A buyer's orders, newest first (`timeline.createdAt` descending). Allowed for that user or an admin.

**Response:** `{"count": <n>, "orders": [<full order documents with orderId>]}`

**Errors:** `403 {"error": "Unauthorized"}`

---

### `GET /api/cooks/:cookId/orders` ⭐ Protected
A cook's incoming orders, newest first. Allowed when the cook profile's `userId` matches the caller, or for an admin. (This route checks cook ownership correctly.)

**Response:** `{"count": <n>, "orders": [<full order documents with orderId>]}`

**Errors:** `404 {"error": "Cook not found"}`, `403 {"error": "Unauthorized"}`

---

### `PUT /api/orders/:orderId` ⭐ Protected
Updates an order. Same access rule as `GET /api/orders/:orderId`: buyer, cook or admin.

**Request** (all optional):
```json
{
  "orderStatus": "confirmed",
  "paymentStatus": "confirmed",
  "paymentProof": "data:image/jpeg;base64,..."
}
```

**`orderStatus` values:**
- `pending`: buyer placed the order
- `confirmed`: cook confirmed and is preparing
- `ready`: ready for pickup
- `picked_up`: buyer collected it
- `completed`: order fulfilled
- `cancelled`: cancelled by the buyer
- `expired`: not picked up in time

**Who may change the status, and from which status:**

| New `orderStatus` | Who | Allowed from |
|---|---|---|
| `confirmed` | cook | `pending` |
| `ready` | cook | `pending`, `confirmed` |
| `picked_up` | cook | `confirmed`, `ready` |
| `completed` | cook | `ready`, `picked_up` |
| `expired` | cook | `pending`, `confirmed`, `ready` |
| `cancelled` | buyer | `pending`, `confirmed` |

Admins may set any valid status from any status.

**Payment (paid directly between buyer and cook):**
- `paymentStatus` values: `pending`, `paid`, `confirmed`.
- The **buyer** may set `paid` ("I've paid") and upload `paymentProof` (a data-URL or link, under about 900 KB).
- Only the **cook** may set `confirmed` ("I received it"). Admins may set any value.

**What happens:**
- Each status change records a timestamp: `timeline.confirmedAt`, `readyAt`, `pickedUpAt`, `completedAt`, `cancelledAt` or `expiredAt`. Existing timeline entries are kept.
- **Cancelling or expiring** an order gives its portions back to the listing in the same transaction. A `sold_out` listing becomes `available` again. Portions are returned only once, even if the order is later changed between `cancelled` and `expired`.

**Response:**
```json
{ "success": true, "message": "Order updated" }
```

**Errors:**
- `400` for an unknown `orderStatus` or `paymentStatus`, or a `paymentProof` that's too large
- `403 {"error": "Unauthorized"}` if you're not the buyer, the cook or an admin
- `403` if your role can't make that change, for example `{"error": "You can't set orderStatus to \"confirmed\""}`
- `409` if the order's current status doesn't allow it, for example `{"error": "Order is \"pending\" and can't be changed to \"completed\""}`
- `404 {"error": "Order not found"}`

---

## ⭐ Reviews & Ratings

### `POST /api/reviews` ⭐ Protected
Submits a review of a cook or a dish. **Only the order's buyer can review**; anyone else gets `403 {"error": "Only buyer can review"}`.

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
- `targetType`: `"cook"` reviews the order's cook; `"dish"` reviews the order's listing.
- `targetId` is optional. The target is always the order's own cook or listing, and a `targetId` that doesn't match gets `400`.
- `rating`: a whole number from 1 to 5 (`"4"` as text is accepted).
- **The order must be collected first:** its `orderStatus` must be `picked_up` or `completed`.
- **One review per order per target type.** A second one gets `409`.
- Stored in `reviews/{orderId}_{targetType}`: `orderId`, `reviewerId`, `targetId`, `targetType`, `rating`, `title`, `text`, `photos: []`, `tags`, `helpful: 0`, `reportCount: 0`, `isVerified: true`, `createdAt`, `updatedAt`.

**Side effect:** recomputes `rating` (the average of all the target's verified reviews, rounded to 1 decimal) and `reviewCount` on the target's `cooks` or `listings` document. Errors in this step are logged, not returned.

**Response:**
```json
{
  "success": true,
  "reviewId": "review123",
  "message": "Review submitted"
}
```

**Errors:**
- `400` for a missing `orderId`, a bad `targetType` or `rating`, or a `targetId` that doesn't match the order
- `404 {"error": "Order not found"}`
- `403 {"error": "Only buyer can review"}`
- `409 {"error": "You can review an order once it has been picked up"}`
- `409 {"error": "You have already reviewed this order"}`

---

### `GET /api/reviews?targetId=cook123&targetType=cook`
Returns reviews for a cook or dish (`isVerified == true` only), newest first. No auth.

**Query parameters:**
- `targetId` (required): cookId or listingId
- `targetType` (required): `"cook"` or `"dish"`

**Response:**
```json
{
  "count": 8,
  "reviews": [
    {
      "reviewId": "review123",
      "orderId": "order123",
      "reviewerId": "buyer123",
      "targetId": "cook123",
      "targetType": "cook",
      "rating": 5,
      "title": "Amazing home-cooked food!",
      "text": "Fresh ingredients, generous portions...",
      "photos": [],
      "tags": ["fresh", "tasty", "friendly"],
      "helpful": 0,
      "reportCount": 0,
      "isVerified": true,
      "createdAt": { "_seconds": 1775745000, "_nanoseconds": 0 },
      "updatedAt": { "_seconds": 1775745000, "_nanoseconds": 0 }
    }
  ]
}
```

**Errors:** `400 {"error": "Missing targetId or targetType"}`

---

## 📸 Instagram Feed

### `GET /api/instagram/recent?limit=6`
Read-only proxy for the CookNextDoor Instagram account's recent posts, used on the homepage. No auth. It keeps the Meta access token on the server.

- `limit` (optional): default `6`, maximum `12`. Only `IMAGE` and `CAROUSEL_ALBUM` posts are kept, so you can get fewer than `limit`.
- Results are cached in memory for **20 minutes**. The `image` URLs are signed Instagram CDN links that expire.
- Calls the Meta Graph API `v22.0` (`/{INSTAGRAM_ACCOUNT_ID}/media`).

**Response:**
```json
{
  "posts": [
    {
      "id": "1789...",
      "hook": "First line of the caption (max 140 characters)",
      "image": "https://scontent.cdninstagram.com/...",
      "permalink": "https://www.instagram.com/p/...",
      "timestamp": "2026-11-27T08:00:00+0000"
    }
  ],
  "cached": false
}
```
If Meta fails and there's an older cached copy, it returns that copy with `"cached": true, "stale": true`.

**Errors:**
- `503 {"error": "Instagram feed not configured"}`: `META_PAGE_ACCESS_TOKEN` or `INSTAGRAM_ACCOUNT_ID` isn't set
- `502 {"error": "Could not load Instagram feed"}`: Meta failed and there's no cache

---

## 🤖 Chatbot ("Kopi")

### `POST /api/chat/message`
Sends a message to the Kopi assistant. **Public: no auth.** Each call is a paid Anthropic API request, so it's **rate-limited to 20 messages per 10 minutes per IP address**.

**Request:**
```json
{
  "message": "Got chicken rice near me?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello lah! 🍜" }
  ]
}
```
- `message` is required: a non-empty string of at most 2,000 characters.
- `history` is optional. Items whose `role` isn't `"user"` or `"assistant"`, or whose `content` isn't a non-empty string, are dropped. The last 20 valid items are sent, each cut to 2,000 characters.
- Other body fields (such as `systemPrompt` from the widget) are ignored.
- The rate limit is kept in memory, so it resets when the server restarts. Behind nginx it uses the client IP from `X-Forwarded-For`, which is trusted only from the local proxy.
- Calls Anthropic `claude-sonnet-4-20250514` with `max_tokens: 512` and a fixed system prompt (a friendly Singlish persona with the platform facts: free, zero commission, direct payment, 1km).

**Response:**
```json
{ "success": true, "message": "Wah, got a few nearby lah! 🍗 ..." }
```

**Side effect:** each exchange is saved to the `chat_messages` collection (`userMessage`, `assistantMessage`, `createdAt`). No user ID or IP is stored. If the save fails, the error is logged on the server and the chat still answers.

**Errors:**
- `400 {"error": "Message cannot be empty"}`
- `400 {"error": "Message too long (max 2000 characters)"}`
- `429 {"error": "Too many messages. Please try again later."}`, with a `Retry-After` header in seconds
- `500 {"error": "AI service not configured"}`: `ANTHROPIC_API_KEY` isn't set
- `502 {"error": "The assistant is unavailable right now. Please try again later."}` if the Anthropic API fails. Anthropic's own message is logged on the server, and only returned when `NODE_ENV=development`.

---

## 🔧 Error Responses

Every error body has an `error` field, but the shape and detail differ by source:

| Source | Status | Body |
|--------|--------|------|
| Missing token | `401` | `{"error": "Missing token"}` |
| Invalid token | `401` | `{"error": "Invalid token", "details": "<Firebase message>"}`, in every environment |
| Validation | `400` | `{"error": "<what's wrong>"}` |
| Malformed JSON body | `400` | `{"error": "Invalid JSON body"}` |
| Body over 2 MB | `413` | `{"error": "Request body too large"}` |
| Permission | `403` | `{"error": "Unauthorized"}`, `{"error": "Admin only"}`, `{"error": "Only buyer can review"}` or a message naming the change your role can't make |
| Browser origin not allowed (CORS) | `403` | `{"error": "Origin not allowed"}` |
| Not found | `404` | `{"error": "<Thing> not found"}` |
| Conflict with current state | `409` | for example a duplicate cook profile or review, or an order status change that isn't allowed from the current status |
| General rate limit | `429` | `{"error": "Too many requests. Please slow down and try again shortly."}`, with `Retry-After` |
| Chat rate limit | `429` | `{"error": "Too many messages. Please try again later."}`, with `Retry-After` |
| Chat AI failure | `502` | `{"error": "The assistant is unavailable right now. Please try again later."}` |
| Any other server error | `500` | `{"error": "Internal server error"}`. The full error is logged on the server (`pm2 logs cooknextdoor-backend`). With `NODE_ENV=development`, `error` holds the real message instead, for example Firestore's "The query requires an index" link. |

---

## 🗂️ Firestore Collections

| Collection | Written by |
|------------|-----------|
| `users` | `POST /api/auth/register`, `PUT /api/users/:userId` |
| `cooks` | `POST /api/cooks/register`; `rating`/`reviewCount` by `POST /api/reviews` |
| `listings` | `POST /api/listings`, `PUT /api/listings/:listingId`; portions/status by `POST /api/orders`; `rating`/`reviewCount` by `POST /api/reviews` |
| `orders` | `POST /api/orders`, `PUT /api/orders/:orderId` |
| `reviews` | `POST /api/reviews` |
| `chat_messages` | `POST /api/chat/message` |

All writes go through the Firebase Admin SDK on the server.

## 🗂️ Firestore Indexes

These queries need composite indexes in the Firebase project. The repo has no `firestore.indexes.json`, so they're managed in the Firebase Console. If one is missing, the endpoint returns `500` with Firestore's "requires an index" message.

| Endpoint | Query |
|----------|-------|
| `GET /api/listings` | `status ==`, (`cuisine ==`), `isActive ==`, order by `createdAt` desc |
| `GET /api/listings/nearby` | `status ==`, `isActive ==`, range on `location.latitude` and `location.longitude`, order by `createdAt` desc |
| `GET /api/cooks/nearby` | `isActive ==`, `verificationStatus ==`, range on `location.latitude` and `location.longitude` |
| `GET /api/users/:userId/orders` | `buyerId ==`, order by `timeline.createdAt` desc |
| `GET /api/cooks/:cookId/orders` | `cookId ==`, order by `timeline.createdAt` desc |
| `GET /api/reviews` | `targetId ==`, `targetType ==`, `isVerified ==`, order by `createdAt` desc |

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

1. **Every `PUT` needs a token.** Users and listings check ownership. Orders allow the buyer, the order's cook or an admin.
2. **Passwords** go only to Firebase Auth. They're never stored in Firestore or returned.
3. **Public endpoints filter private fields.** `GET /api/users/:userId` returns only name, photo, rating, review count, bio and verified. The public cook endpoints never return `bankDetails` or `verificationDocuments`; they do return `userId`, the cook's location and the other profile fields. Listings and reviews still return whole documents.
4. **`bankDetails` isn't encrypted by the app.** It's a plain object on the cook document, protected only by Google's default disk encryption. The API never fills it in or returns it, so it's empty unless something else writes to it.
5. **`paymentProof`** is a plain string on the order, readable by anyone who can read that order.
6. **Firestore security rules don't protect this API.** The server uses the Firebase Admin SDK, which bypasses security rules. Rules only apply to frontend pages that talk to Firestore directly with the client SDK. The checks in each route are the API's only access control.

---

## 📊 Rate Limiting

- **All `/api` routes except `/api/health`:** 300 requests per minute per IP.
- **`POST /api/chat/message`:** additionally 20 messages per 10 minutes per IP.
- Both return `429` with a `Retry-After` header (in seconds) and keep CORS headers, so browsers can read the error.
- The counters live in memory, so they reset when the server restarts. Behind nginx the client IP comes from `X-Forwarded-For`, which is trusted only from the local proxy.
- Clients should wait for `Retry-After` before retrying.

---

## 🚀 Deployment Notes

### Configuration files (both gitignored, never commit them)
- **`.env.local`**: environment variables, loaded with `dotenv` from the working directory the server is started in.
- **`firebase-service-key.json`**: the Firebase Admin service account, loaded with `require('./firebase-service-key.json')` from the same folder as `backend-server.js`. The path is fixed in the code; there's no environment variable for it.

### Environment variables the server reads
```
API_PORT=3001                         # optional, default 3001
NEXT_PUBLIC_FIREBASE_PROJECT_ID       # Firebase project ID
META_PAGE_ACCESS_TOKEN                # Instagram feed (optional; feed returns 503 without it)
INSTAGRAM_ACCOUNT_ID                  # Instagram feed (optional)
ANTHROPIC_API_KEY                     # Kopi chatbot (optional; chat returns 500 without it)
NODE_ENV                              # "development" returns real error messages instead of "Internal server error"
```
The server doesn't read `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` or `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` (frontend values), or `FIREBASE_SERVICE_ACCOUNT_KEY`.

### Firebase rules
Firestore security rules are set in the Firebase Console (see `FIRESTORE_SCHEMA.md`). They don't apply to this server (see Security Note 6).

### CORS
Only these browser origins are allowed (with credentials):
```
https://cooknextdoor.org
https://www.cooknextdoor.org
http://localhost:8080
http://127.0.0.1:8080
http://localhost:3000
```
Requests with no `Origin` header (curl, mobile apps, Postman) are allowed. A blocked origin gets `403 {"error": "Origin not allowed"}`.

### Docs
There's no `/api/docs` route. These docs live in this file only, and the startup log points here.

---

## ⚠️ Known Issues

None known as of 2026-11-28. If you find the code doing something this document doesn't describe, add it here.

Fixed on 2026-11-28:
- **High:** the unreachable `GET /api/cooks/nearby`; the public user profile exposing email, phone and address; the public cook endpoints returning `bankDetails`; cooks being locked out of their own orders; the chat endpoint having no rate limit or input checks and never saving its log.
- **Medium:** the 1km radius cap; order status and payment role rules, with portions returned on cancel or expire; order validation and the oversell transaction; the review double-count and review checks; listing validation and the `limit` cap; one cook profile per user and the admin verification endpoint; internal error messages no longer sent to clients; clear register errors; CORS rejections returning 403.
- **Low:** profile fields can be cleared, with type checks and a 404 for a missing user; a general rate limit on all routes; the request body cap lowered from 50 MB to 2 MB; the startup log no longer advertises the non-existent `/api/docs`.
