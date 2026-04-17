# CookNextDoor - Quick Reference & Code Snippets

Fast lookup guide with copy-paste code examples.

---

## 🚀 Getting Started (5 min)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend
```bash
npm run backend:dev
```
→ `http://localhost:3001/api`

### 3. Import API Client
```html
<script src="./lib/api-client.js" type="module"></script>
<script>
  import { CookNextDoorAPI } from './lib/api-client.js'
  const api = new CookNextDoorAPI('http://localhost:3001')
</script>
```

---

## 👤 User Registration & Auth

### Register Buyer
```javascript
const api = new CookNextDoorAPI('http://localhost:3001')

const user = await api.auth.register(
  'buyer@example.sg',
  'securePassword123',
  'John Tan',
  '+6581234567',
  'buyer'
)

console.log('User ID:', user.userId)
// Response: { success: true, userId: 'uid123', message: '...' }
```

### Set User Location
```javascript
// Option A: Manual location
await api.users.setLocation(
  userId,
  1.3521,      // latitude (Singapore center)
  103.8198,    // longitude
  '123 Clementi Road',
  '123',       // block
  '123456'     // postal
)

// Option B: Get location from browser
const { latitude, longitude } = await getUserLocation()
await api.users.setLocation(userId, latitude, longitude)
```

### Get Current User Profile
```javascript
const profile = await api.auth.profile()
console.log(profile.name, profile.rating)
```

### Update Profile
```javascript
await api.users.updateProfile(userId, {
  name: 'John Tan Boon Huat',
  bio: 'Food lover from Clementi',
  preferences: {
    favoriteCategories: ['Chinese', 'Indian'],
    maxDistance: 2000 // 2km
  }
})
```

---

## 👨‍🍳 Cook Registration & Listings

### Register as Cook
```javascript
const cook = await api.cooks.register({
  businessName: 'Aunty Lim\'s Kitchen',
  description: 'Traditional Singaporean home cooking',
  cuisineTypes: ['Chinese', 'Malay', 'Peranakan'],
  averagePrice: 8.50,
  location: {
    latitude: 1.3521,
    longitude: 103.8198,
    address: '123 Clementi Road',
    block: '123',
    postal: '123456'
  },
  operatingHours: {
    monday: { open: '10:00', close: '18:00' },
    tuesday: { open: '10:00', close: '18:00' },
    wednesday: { open: '10:00', close: '18:00' },
    thursday: { open: '10:00', close: '18:00' },
    friday: { open: '10:00', close: '20:00' },
    saturday: { open: '11:00', close: '20:00' },
    sunday: { open: 'CLOSED' }
  },
  maxOrdersPerDay: 15,
  prepTimeMinutes: 30
})

console.log('Cook ID:', cook.cookId)
```

### Create Food Listing
```javascript
const listing = await api.listings.create({
  dishName: 'Hainanese Chicken Rice',
  description: 'Traditional Hainanese chicken rice with fragrant jasmine rice',
  cuisine: 'Chinese',
  category: 'main',
  price: 6.50,
  portionSize: '3-5 servings',
  totalPortions: 10,
  images: [
    'https://firebasestorage.com/listings/chicken-rice-1.jpg'
  ],
  ingredients: ['gluten', 'soy', 'sesame'],
  dietary: ['halal'],
  pickupTime: {
    startTime: '17:00',
    endTime: '19:00',
    date: new Date().toISOString().split('T')[0]
  },
  location: {
    latitude: 1.3521,
    longitude: 103.8198,
    address: '123 Clementi Road, Block 123'
  },
  pickupInstructions: 'Press door bell at gate. 5th floor, unit 23.'
})

console.log('Listing ID:', listing.listingId)
```

### Get Your Listings (as cook)
```javascript
// Get all orders for this cook
const orders = await api.cooks.getOrders(cookId)
console.log(`You have ${orders.count} pending orders`)

orders.orders.forEach(order => {
  console.log(`Order #${order.orderId}: ${order.quantity} x ${order.dishName}`)
})
```

### Update Listing
```javascript
// Mark 3 portions sold
await api.listings.update(listingId, {
  portionsAvailable: 7  // Was 10, sold 3
})

// Mark as sold out
await api.listings.markSoldOut(listingId)

// Deactivate listing
await api.listings.deactivate(listingId)
```

---

## 🍽️ Browse & Search Food

### Get All Listings (Paginated)
```javascript
// Get first 20 available listings
const page1 = await api.listings.getAll({
  status: 'available',
  limit: 20,
  offset: 0
})

console.log(`Found ${page1.count} listings`)
page1.listings.forEach(listing => {
  console.log(`${listing.dishName} - $${listing.price} by ${listing.cookId}`)
})

// Filter by cuisine
const chinese = await api.listings.getAll({
  cuisine: 'Chinese',
  status: 'available'
})
```

### Find Nearby Food (1km radius)
```javascript
import { getUserLocation } from './lib/api-client.js'

// Get user's current location
const location = await getUserLocation()

// Find food within 1km
const nearby = await api.listings.nearby(
  location.latitude,
  location.longitude,
  1000  // 1000 meters = 1km
)

console.log(`Found ${nearby.count} listings nearby`)
nearby.listings.forEach(listing => {
  console.log(`✅ ${listing.dishName} @ ${listing.location.address}`)
  console.log(`   Rating: ⭐${listing.rating} (${listing.reviewCount} reviews)`)
  console.log(`   Price: $${listing.price} | Available: ${listing.portionsAvailable}`)
})
```

### Find Nearby Cooks
```javascript
const nearbyCooks = await api.cooks.nearby(
  1.3521,      // latitude
  103.8198,    // longitude
  1500         // 1.5km radius (optional, default 1km)
)

console.log(`Found ${nearbyCooks.count} active cooks nearby`)
nearbyCooks.cooks.forEach(cook => {
  console.log(`👨‍🍳 ${cook.businessName}`)
  console.log(`   Rating: ⭐${cook.rating} | Orders: ${cook.totalOrdersFulfilled}`)
  console.log(`   Cuisines: ${cook.cuisineTypes.join(', ')}`)
})
```

---

## 📦 Orders

### Place Order
```javascript
const order = await api.orders.create({
  cookId: 'cook123',
  listingId: 'listing456',
  quantity: 2,                    // 2 portions
  paymentMethod: 'paynow',        // or 'paylah', 'cash'
  buyerNotes: 'Please pack extra chili sauce',
  specialRequests: ['no onions', 'extra ginger']
})

console.log(`Order placed! ID: ${order.orderId}`)
console.log(`Total: $${2 * 6.50} SGD`)
console.log(order.message)
```

### Get Order Details
```javascript
const order = await api.orders.getById(orderId)

console.log('Order Status:', order.orderStatus)
// pending → confirmed → ready → picked_up → completed

console.log('Payment Status:', order.paymentStatus)
// pending → confirmed → failed

console.log('Timeline:')
if (order.timeline.confirmedAt) console.log('  ✅ Confirmed:', order.timeline.confirmedAt)
if (order.timeline.readyAt) console.log('  📦 Ready:', order.timeline.readyAt)
if (order.timeline.pickedUpAt) console.log('  🎉 Picked up:', order.timeline.pickedUpAt)
```

### Get Buyer's Order History
```javascript
const myOrders = await api.orders.getBuyerOrders(userId)

console.log(`You have ${myOrders.count} orders`)
myOrders.orders.forEach(order => {
  const date = new Date(order.timeline.createdAt.seconds * 1000)
  console.log(`- ${order.dishName} on ${date.toLocaleDateString()}`)
  console.log(`  Status: ${order.orderStatus} | Total: $${order.totalPrice}`)
})
```

### Update Order (as Cook)
```javascript
// Order received, confirming now
await api.orders.updateStatus(orderId, 'confirmed')

// Finished cooking, ready for pickup
await api.orders.updateStatus(orderId, 'ready')

// Or with payment confirmation
await api.orders.confirmPayment(
  orderId,
  'confirmed',
  'https://firebasestorage.com/payment-proof-123.jpg'
)
```

### Update Order (as Buyer)
```javascript
// Buyer marks as picked up
await api.orders.markPickedUp(orderId)

// Order complete (can now leave review)
await api.orders.complete(orderId)

// Cancel order
await api.orders.cancel(orderId, 'Changed my mind')
```

---

## ⭐ Reviews & Ratings

### Leave Review for Cook
```javascript
const review = await api.reviews.reviewCook(
  orderId,                        // Order must be completed
  cookId,
  5,                              // Rating 1-5 stars
  'Amazing fresh homemade chicken rice! Very friendly cook and quick delivery.',
  ['fresh', 'tasty', 'friendly']  // Tags
)

console.log('Review submitted! ID:', review.reviewId)
```

### Leave Review for Dish
```javascript
const review = await api.reviews.reviewDish(
  orderId,
  listingId,
  4,
  'Portion was generous and tasted authentic. A bit oily but still delicious.',
  ['generous', 'authentic']
)
```

### Get Reviews for Cook
```javascript
const reviews = await api.reviews.get('cook123', 'cook')

console.log(`Cook has ${reviews.count} reviews (avg ⭐${reviews.reviews[0].rating || 4.5})`)

reviews.reviews.forEach(review => {
  console.log(`\n⭐ ${review.rating} - "${review.title}"`)
  console.log(`   "${review.text}"`)
  console.log(`   👍 ${review.helpful} found helpful`)
})
```

### Get Reviews for Dish
```javascript
const dishReviews = await api.reviews.get('listing456', 'dish')

console.log(`Dish has ${dishReviews.count} reviews`)
dishReviews.reviews.slice(0, 5).forEach(review => {  // Show top 5
  console.log(`${review.rating}⭐ - ${review.text}`)
})
```

---

## 🛠️ Utility Functions

### Format Currency (SGD)
```javascript
import { formatSGD } from './lib/api-client.js'

console.log(formatSGD(6.50))      // $6.50
console.log(formatSGD(10))        // $10.00
console.log(formatSGD(1234.56))   // $1,234.56
```

### Format Date
```javascript
import { formatDate } from './lib/api-client.js'

const date = new Date()
console.log(formatDate(date))
// "10 Apr 2026, 14:30"
```

### Calculate Distance
```javascript
import { calculateDistance } from './lib/api-client.js'

const dist = calculateDistance(
  1.3521, 103.8198,  // Cook location
  1.3464, 103.7618   // Your location
)

console.log(`${dist.toFixed(2)} km away`)
// "6.42 km away"
```

### Generate Star Rating Display
```javascript
import { generateStars } from './lib/api-client.js'

console.log(generateStars(4.5))    // ⭐⭐⭐⭐✨
console.log(generateStars(3))      // ⭐⭐⭐☆☆
console.log(generateStars(5))      // ⭐⭐⭐⭐⭐
```

---

## 🔑 API Key Setup

### Get Firebase ID Token (After Login)
```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'

const firebaseApp = initializeApp({
  apiKey: "YOUR_PUBLIC_KEY",
  authDomain: "cooknextdoor-eedbe.firebaseapp.com",
  projectId: "cooknextdoor-eedbe",
})

const auth = getAuth(firebaseApp)
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const token = await user.getIdToken()
    
    // Set in API client
    const api = new CookNextDoorAPI('http://localhost:3001')
    api.setAuthToken(token)
    
    console.log('Authenticated! Can now make protected API calls.')
  }
})
```

---

## 🚨 Error Handling

### Try-Catch Pattern
```javascript
try {
  const order = await api.orders.create({
    cookId: 'cook123',
    listingId: 'listing456',
    quantity: 5
  })
  console.log('Order placed:', order.orderId)
  
} catch (error) {
  if (error.message.includes('Not enough portions')) {
    alert('Sorry, not enough portions available. Check back soon!')
  } else if (error.message.includes('not a registered cook')) {
    alert('Please register as a cook first.')
  } else {
    alert('Error: ' + error.message)
  }
}
```

### Check Response Status
```javascript
const response = await fetch('/api/listings/nearby?latitude=1.35&longitude=103.82')

if (!response.ok) {
  const error = await response.json()
  console.error('API Error:', error.error)
  // Handle: 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
} else {
  const data = await response.json()
  console.log('Success:', data)
}
```

---

## 📞 Support Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
# {"status":"OK","timestamp":"2026-04-10T14:30:00Z"}
```

### List All Available Collections
```bash
# Check Firebase Console → Firestore → Collections
# Collections: users, cooks, listings, orders, messages, reviews, verification_queue, admin_reports, notifications, analytics
```

---

## 🎯 Common Use Cases

### 1. "Show me food near me"
```javascript
const location = await getUserLocation()
const nearby = await api.listings.nearby(location.latitude, location.longitude)
// Display nearby.listings on map/list
```

### 2. "Order chicken rice from Aunty Lim"
```javascript
const order = await api.orders.create({
  cookId: 'cook123',
  listingId: 'listing456',
  quantity: 2,
  paymentMethod: 'paynow'
})
// Generate PayNow QR with cook's details
// Buyer scans, pays, uploads screenshot
```

### 3. "I (cook) have 5 pending orders"
```javascript
const myOrders = await api.cooks.getOrders(cookId)
// Mark each as confirmed → ready as you cook
```

### 4. "Show reviews for this dish"
```javascript
const reviews = await api.reviews.get(listingId, 'dish')
// Display reviews.reviews on product page
```

### 5. "Cancel order"
```javascript
await api.orders.cancel(orderId, 'Unexpected guests arrived')
// System refunds portions back to listing
// Buyer can reorder if available
```

---

## 📚 Full Documentation

For detailed API reference:
- **API Endpoints:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Database Schema:** [FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md)
- **Setup Guide:** [BACKEND_SETUP.md](BACKEND_SETUP.md)
- **Operations:** [OPERATIONS_CHECKLIST.md](OPERATIONS_CHECKLIST.md)

---

**Version:** 1.0.0  
**Last Updated:** April 10, 2026  
**Status:** ✅ Production Ready
