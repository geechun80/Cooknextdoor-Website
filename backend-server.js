/**
 * CookNextDoor Backend API Server
 * Express.js + Firebase Admin SDK
 * 
 * Usage: node backend-server.js
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-key.json');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Express
const app = express();
const PORT = process.env.API_PORT || 3001;

// Behind nginx on the same host: trust X-Forwarded-For only from loopback,
// so req.ip is the real client IP (used by the chat rate limit) and can't be spoofed by direct callers.
app.set('trust proxy', 'loopback');

// Middleware — restrict CORS to known origins in production
const allowedOrigins = [
  'https://cooknextdoor.org',
  'https://www.cooknextdoor.org',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize Firebase Admin SDK
// (No Cloud Storage: the project is on the Spark plan with no bucket; images are data-URLs in Firestore.)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

const db = admin.firestore();
const auth = admin.auth();
const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

// ============================================================================
// SHARED HELPERS
// ============================================================================

const IS_DEV = process.env.NODE_ENV === 'development';

// An error with an HTTP status, thrown inside handlers/transactions and turned into a response.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Send an error response. HttpErrors keep their status and message; anything else is a 500
// whose internal detail is logged and only returned in development.
function sendError(res, error, context = 'Server error') {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(`${context}:`, error);
  return res.status(500).json({ error: IS_DEV ? error.message : 'Internal server error' });
}

// Product rule: search radius is at most 1km.
const MAX_RADIUS_METERS = 1000;

function parseRadius(value) {
  const r = Number(value);
  return Number.isFinite(r) && r > 0 ? Math.min(r, MAX_RADIUS_METERS) : MAX_RADIUS_METERS;
}

function isValidLatLng(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function hasLatLng(location) {
  return !!location && typeof location === 'object' &&
    isValidLatLng(location.latitude, location.longitude);
}

// Firestore auto-IDs are letters and digits; reject anything that could form a path.
function isValidId(id) {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(id);
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    
    const decodedToken = await auth.verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ============================================================================
// INSTAGRAM FEED (read-only proxy — keeps the Meta access token server-side)
// ============================================================================

// In-memory cache: Instagram's media_url is a signed CDN link that expires,
// and we don't want every homepage visit hitting the Graph API directly.
let igFeedCache = { data: null, fetchedAt: 0 };
const IG_FEED_TTL_MS = 20 * 60 * 1000; // 20 minutes

app.get('/api/instagram/recent', async (req, res) => {
  try {
    const now = Date.now();
    if (igFeedCache.data && (now - igFeedCache.fetchedAt) < IG_FEED_TTL_MS) {
      return res.json({ posts: igFeedCache.data, cached: true });
    }

    const token = process.env.META_PAGE_ACCESS_TOKEN;
    const acct = process.env.INSTAGRAM_ACCOUNT_ID;
    if (!token || !acct) {
      return res.status(503).json({ error: 'Instagram feed not configured' });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 6, 12);
    const url = `https://graph.facebook.com/v22.0/${acct}/media`;
    const resp = await fetch(`${url}?fields=id,caption,media_type,media_url,permalink,timestamp&limit=${limit}&access_token=${token}`);
    const data = await resp.json();
    if (!resp.ok || !Array.isArray(data.data)) {
      throw new Error((data.error && data.error.message) || 'Unexpected Instagram API response');
    }

    const posts = data.data
      .filter(p => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
      .map(p => {
        const caption = (p.caption || '').split('\n')[0].slice(0, 140); // first line as the "hook"
        return {
          id: p.id,
          hook: caption,
          image: p.media_url,
          permalink: p.permalink,
          timestamp: p.timestamp
        };
      });

    igFeedCache = { data: posts, fetchedAt: now };
    res.json({ posts, cached: false });
  } catch (error) {
    console.error('Instagram feed error:', error.message);
    // Serve stale cache rather than an empty feed if Meta's API hiccups
    if (igFeedCache.data) return res.json({ posts: igFeedCache.data, cached: true, stale: true });
    res.status(502).json({ error: 'Could not load Instagram feed' });
  }
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

const USER_TYPES = ['buyer', 'cook', 'both'];

// Firebase Auth error codes shown to the client as a clear 400; anything else is a 500.
const REGISTER_ERRORS = {
  'auth/email-already-exists': 'Email already exists',
  'auth/invalid-email': 'Invalid email address',
  'auth/invalid-password': 'Password must be at least 6 characters',
  'auth/invalid-display-name': 'Invalid name'
};

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, userType } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (userType !== undefined && !USER_TYPES.includes(userType)) {
      return res.status(400).json({ error: `userType must be one of: ${USER_TYPES.join(', ')}` });
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    // Create user profile in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      phone: phone || '',
      userType: userType || 'buyer',
      profilePhoto: '',
      location: {
        latitude: null,
        longitude: null,
        address: '',
        block: '',
        postal: ''
      },
      rating: 0,
      reviewCount: 0,
      bio: '',
      verified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        allowNotifications: true,
        favoriteCategories: [],
        maxDistance: 1000
      }
    });

    res.json({
      success: true,
      userId: userRecord.uid,
      message: 'User registered successfully'
    });
  } catch (error) {
    const known = REGISTER_ERRORS[error.code];
    if (known) {
      return res.status(400).json({ error: known });
    }
    sendError(res, error, 'Registration error');
  }
});

// Get current user profile
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: req.userId,
      ...userDoc.data()
    });
  } catch (error) {
    sendError(res, error);
  }
});

// ============================================================================
// USER MANAGEMENT ROUTES
// ============================================================================

// Update user profile
app.put('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, phone, bio, location, preferences } = req.body;

    const updateData = {
      updatedAt: serverTimestamp()
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (preferences) updateData.preferences = preferences;

    await db.collection('users').doc(req.params.userId).update(updateData);

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    sendError(res, error);
  }
});

// Get user profile (public)
app.get('/api/users/:userId', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Public view: never expose email, phone, address/location or preferences
    const { name, profilePhoto, rating, reviewCount, bio, verified } = userDoc.data();
    res.json({
      userId: req.params.userId,
      name: name || '',
      profilePhoto: profilePhoto || '',
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      bio: bio || '',
      verified: !!verified
    });
  } catch (error) {
    sendError(res, error);
  }
});

// ============================================================================
// COOK REGISTRATION & MANAGEMENT
// ============================================================================

// Cook registration/onboarding
app.post('/api/cooks/register', verifyToken, async (req, res) => {
  try {
    const {
      businessName,
      description,
      cuisineTypes,
      averagePrice,
      location,
      operatingHours,
      maxOrdersPerDay,
      prepTimeMinutes
    } = req.body;

    // Validate
    if (!businessName || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!hasLatLng(location)) {
      return res.status(400).json({ error: 'location.latitude and location.longitude must be valid numbers' });
    }

    // One cook profile per user
    const existing = await db.collection('cooks').where('userId', '==', req.userId).limit(1).get();
    if (!existing.empty) {
      return res.status(409).json({
        error: 'You already have a cook profile',
        cookId: existing.docs[0].id
      });
    }

    // Create cook profile
    const cookRef = db.collection('cooks').doc();
    await cookRef.set({
      userId: req.userId,
      businessName,
      description: description || '',
      cuisineTypes: cuisineTypes || [],
      averagePrice: averagePrice || 0,
      location,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      verificationStatus: 'pending',
      verificationDocuments: [],
      bankDetails: {
        accountHolder: '',
        bankCode: '',
        accountNumber: '',
        verified: false
      },
      operatingHours: operatingHours || {},
      maxOrdersPerDay: maxOrdersPerDay || 10,
      prepTimeMinutes: prepTimeMinutes || 30,
      totalOrdersFulfilled: 0,
      foodSafetyScore: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    res.json({
      success: true,
      cookId: cookRef.id,
      message: 'Cook profile created. Pending verification.'
    });
  } catch (error) {
    sendError(res, error, 'Cook registration error');
  }
});

// Set a cook's verification status (admin only).
// Only "verified" cooks appear in GET /api/cooks/nearby.
const VERIFICATION_STATUSES = ['pending', 'verified', 'rejected'];

app.put('/api/cooks/:cookId/verification', verifyToken, async (req, res) => {
  try {
    if (!req.user.admin) {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { verificationStatus } = req.body;
    if (!VERIFICATION_STATUSES.includes(verificationStatus)) {
      return res.status(400).json({
        error: `verificationStatus must be one of: ${VERIFICATION_STATUSES.join(', ')}`
      });
    }

    const cookRef = db.collection('cooks').doc(req.params.cookId);
    const cookDoc = await cookRef.get();
    if (!cookDoc.exists) {
      return res.status(404).json({ error: 'Cook not found' });
    }

    await cookRef.update({
      verificationStatus,
      verificationUpdatedAt: serverTimestamp(),
      verificationUpdatedBy: req.userId,
      updatedAt: serverTimestamp()
    });

    res.json({ success: true, message: `Cook ${verificationStatus}` });
  } catch (error) {
    sendError(res, error, 'Cook verification error');
  }
});

// Fields of a cook document that must never be sent by public endpoints
function publicCookData(data) {
  const { bankDetails, verificationDocuments, ...rest } = data;
  return rest;
}

// Get nearby active cooks (1km radius)
// NOTE: must stay ABOVE '/api/cooks/:cookId', or Express treats "nearby" as a cookId.
app.get('/api/cooks/nearby', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing latitude/longitude' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isValidLatLng(lat, lng)) {
      return res.status(400).json({ error: 'Invalid latitude/longitude' });
    }
    const radiusMeters = parseRadius(req.query.radiusMeters); // capped at 1km

    // Approximate bounds for 1km radius
    const latDelta = radiusMeters / 111000;
    const lngDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

    const cooks = await db
      .collection('cooks')
      .where('isActive', '==', true)
      .where('verificationStatus', '==', 'verified')
      .where('location.latitude', '>=', lat - latDelta)
      .where('location.latitude', '<=', lat + latDelta)
      .where('location.longitude', '>=', lng - lngDelta)
      .where('location.longitude', '<=', lng + lngDelta)
      .get();

    const results = cooks.docs.map(doc => ({
      cookId: doc.id,
      ...publicCookData(doc.data())
    }));

    res.json({ count: results.length, cooks: results });
  } catch (error) {
    sendError(res, error);
  }
});

// Get cook profile (public)
app.get('/api/cooks/:cookId', async (req, res) => {
  try {
    const cookDoc = await db.collection('cooks').doc(req.params.cookId).get();

    if (!cookDoc.exists) {
      return res.status(404).json({ error: 'Cook not found' });
    }

    res.json({
      cookId: req.params.cookId,
      ...publicCookData(cookDoc.data())
    });
  } catch (error) {
    sendError(res, error);
  }
});

// ============================================================================
// LISTINGS (FOOD DISHES)
// ============================================================================

// Create new food listing
app.post('/api/listings', verifyToken, async (req, res) => {
  try {
    const {
      dishName,
      description,
      cuisine,
      category,
      price,
      portionSize,
      totalPortions,
      images,
      ingredients,
      dietary,
      pickupTime,
      location,
      pickupInstructions
    } = req.body;

    // Validate required fields (Firestore also rejects undefined values, which used to surface as a 500)
    const priceNum = Number(price);
    const portionsNum = Number(totalPortions);
    if (typeof dishName !== 'string' || dishName.trim().length === 0) {
      return res.status(400).json({ error: 'dishName is required' });
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return res.status(400).json({ error: 'price must be a number of 0 or more' });
    }
    if (!Number.isInteger(portionsNum) || portionsNum < 1) {
      return res.status(400).json({ error: 'totalPortions must be a whole number of at least 1' });
    }
    if (!pickupTime || typeof pickupTime !== 'object') {
      return res.status(400).json({ error: 'pickupTime is required' });
    }
    if (!hasLatLng(location)) {
      return res.status(400).json({ error: 'location.latitude and location.longitude must be valid numbers' });
    }

    // Get cook profile for this user
    const cookQuery = await db
      .collection('cooks')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (cookQuery.empty) {
      return res.status(400).json({ error: 'User is not a registered cook' });
    }

    const cookId = cookQuery.docs[0].id;

    // Create listing
    const listingRef = db.collection('listings').doc();
    await listingRef.set({
      cookId,
      dishName: dishName.trim(),
      description: description || '',
      cuisine: cuisine || '',
      category: category || 'main',
      price: priceNum,
      portionSize: portionSize || '3-5 servings',
      totalPortions: portionsNum,
      portionsAvailable: portionsNum,
      images: images || [],
      ingredients: ingredients || [],
      dietary: dietary || [],
      pickupTime,
      location,
      pickupInstructions: pickupInstructions || '',
      rating: 0,
      reviewCount: 0,
      isActive: true,
      status: 'available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.json({
      success: true,
      listingId: listingRef.id,
      message: 'Listing created successfully'
    });
  } catch (error) {
    sendError(res, error);
  }
});

const MAX_LISTINGS_LIMIT = 100;
const LISTING_STATUSES = ['available', 'limited', 'sold_out'];

// Get all active listings (with filters)
app.get('/api/listings', async (req, res) => {
  try {
    const { cuisine, status = 'available' } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), MAX_LISTINGS_LIMIT);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    let query = db.collection('listings');

    if (status) query = query.where('status', '==', status);
    if (cuisine) query = query.where('cuisine', '==', cuisine);

    const listings = await query
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const results = listings.docs.map(doc => ({
      listingId: doc.id,
      ...doc.data()
    }));

    res.json({ count: results.length, listings: results });
  } catch (error) {
    sendError(res, error);
  }
});

// Get nearby listings (1km radius)
app.get('/api/listings/nearby', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing latitude/longitude' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isValidLatLng(lat, lng)) {
      return res.status(400).json({ error: 'Invalid latitude/longitude' });
    }
    const radiusMeters = parseRadius(req.query.radiusMeters); // capped at 1km

    // Approximate bounds for 1km radius
    const latDelta = radiusMeters / 111000;
    const lngDelta = radiusMeters / (111000 * Math.cos((lat * Math.PI) / 180));

    const listings = await db
      .collection('listings')
      .where('status', '==', 'available')
      .where('isActive', '==', true)
      .where('location.latitude', '>=', lat - latDelta)
      .where('location.latitude', '<=', lat + latDelta)
      .where('location.longitude', '>=', lng - lngDelta)
      .where('location.longitude', '<=', lng + lngDelta)
      .orderBy('createdAt', 'desc')
      .get();

    const results = listings.docs.map(doc => ({
      listingId: doc.id,
      ...doc.data()
    }));

    res.json({ count: results.length, listings: results });
  } catch (error) {
    sendError(res, error);
  }
});

// Get single listing
app.get('/api/listings/:listingId', async (req, res) => {
  try {
    const listingDoc = await db.collection('listings').doc(req.params.listingId).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({
      listingId: req.params.listingId,
      ...listingDoc.data()
    });
  } catch (error) {
    sendError(res, error);
  }
});

// Update listing (cook only)
app.put('/api/listings/:listingId', verifyToken, async (req, res) => {
  try {
    const listingDoc = await db.collection('listings').doc(req.params.listingId).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Verify ownership
    const cookQuery = await db
      .collection('cooks')
      .where('userId', '==', req.userId)
      .limit(1)
      .get();

    if (cookQuery.empty || cookQuery.docs[0].id !== listingDoc.data().cookId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { portionsAvailable, status, isActive } = req.body;
    const updateData = { updatedAt: serverTimestamp() };

    if (portionsAvailable !== undefined) {
      if (!Number.isInteger(portionsAvailable) || portionsAvailable < 0) {
        return res.status(400).json({ error: 'portionsAvailable must be a whole number of 0 or more' });
      }
      updateData.portionsAvailable = portionsAvailable;
    }
    if (status !== undefined) {
      if (!LISTING_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${LISTING_STATUSES.join(', ')}` });
      }
      updateData.status = status;
    }
    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be true or false' });
      }
      updateData.isActive = isActive;
    }

    await db.collection('listings').doc(req.params.listingId).update(updateData);

    res.json({ success: true, message: 'Listing updated' });
  } catch (error) {
    sendError(res, error);
  }
});

// ============================================================================
// ORDERS (TRACKING ONLY)
// ============================================================================

// Payment is direct between buyer and cook; these are just the recorded methods.
const PAYMENT_METHODS = ['paynow', 'paylah', 'cash'];

// Create order
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    // cookId from the request is ignored: the order always uses the listing's cook.
    const { listingId, paymentMethod, buyerNotes, specialRequests } = req.body;
    const quantity = Number(req.body.quantity);

    if (!isValidId(listingId)) {
      return res.status(400).json({ error: 'listingId is required' });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be a whole number of at least 1' });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: `paymentMethod must be one of: ${PAYMENT_METHODS.join(', ')}` });
    }

    const listingRef = db.collection('listings').doc(listingId);
    const orderRef = db.collection('orders').doc();

    // Read the listing and take the portions in one transaction, so two orders can't oversell.
    await db.runTransaction(async tx => {
      const listingDoc = await tx.get(listingRef);
      if (!listingDoc.exists) {
        throw new HttpError(404, 'Listing not found');
      }

      const listing = listingDoc.data();
      if (!listing.isActive || listing.status === 'sold_out') {
        throw new HttpError(400, 'Listing is not available');
      }
      const available = Number(listing.portionsAvailable) || 0;
      if (available < quantity) {
        throw new HttpError(400, 'Not enough portions available');
      }

      const remaining = available - quantity;

      tx.set(orderRef, {
        buyerId: req.userId,
        cookId: listing.cookId,
        listingId,
        dishName: listing.dishName,
        quantity,
        unitPrice: listing.price,
        totalPrice: listing.price * quantity, // zero commission: no fees added
        paymentMethod,
        paymentStatus: 'pending',
        paymentProof: '',
        orderStatus: 'pending',
        pickupLocation: listing.location || null,
        pickupTime: listing.pickupTime || null,
        buyerNotes: typeof buyerNotes === 'string' ? buyerNotes : '',
        cookResponse: '',
        specialRequests: Array.isArray(specialRequests) ? specialRequests : [],
        timeline: {
          createdAt: serverTimestamp()
        }
      });

      tx.update(listingRef, {
        portionsAvailable: remaining,
        status: remaining === 0 ? 'sold_out' : listing.status,
        updatedAt: serverTimestamp()
      });
    });

    res.json({
      success: true,
      orderId: orderRef.id,
      message: 'Order created. Payment pending.'
    });
  } catch (error) {
    sendError(res, error, 'Create order error');
  }
});

// order.cookId is a cooks-collection document ID, not a user uid.
// Resolve the cook profile and compare its owner's uid with the caller.
async function isOrderCook(order, uid) {
  if (!order.cookId) return false;
  const cookDoc = await db.collection('cooks').doc(order.cookId).get();
  return cookDoc.exists && cookDoc.data().userId === uid;
}

async function canAccessOrder(order, req) {
  if (req.userId === order.buyerId || req.user.admin) return true;
  return isOrderCook(order, req.userId);
}

// Get order details
app.get('/api/orders/:orderId', verifyToken, async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();

    // Verify access (buyer, cook, or admin)
    if (!(await canAccessOrder(order, req))) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      orderId: req.params.orderId,
      ...order
    });
  } catch (error) {
    sendError(res, error);
  }
});

// Get buyer's orders
app.get('/api/users/:userId/orders', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orders = await db
      .collection('orders')
      .where('buyerId', '==', req.params.userId)
      .orderBy('timeline.createdAt', 'desc')
      .get();

    const results = orders.docs.map(doc => ({
      orderId: doc.id,
      ...doc.data()
    }));

    res.json({ count: results.length, orders: results });
  } catch (error) {
    sendError(res, error);
  }
});

// Get cook's orders
app.get('/api/cooks/:cookId/orders', verifyToken, async (req, res) => {
  try {
    // Verify cook owns this profile
    const cookDoc = await db.collection('cooks').doc(req.params.cookId).get();
    if (!cookDoc.exists) {
      return res.status(404).json({ error: 'Cook not found' });
    }

    if (cookDoc.data().userId !== req.userId && !req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orders = await db
      .collection('orders')
      .where('cookId', '==', req.params.cookId)
      .orderBy('timeline.createdAt', 'desc')
      .get();

    const results = orders.docs.map(doc => ({
      orderId: doc.id,
      ...doc.data()
    }));

    res.json({ count: results.length, orders: results });
  } catch (error) {
    sendError(res, error);
  }
});

// Order status rules.
// Key = new status, value = the statuses it may be changed FROM, per role. Admins may set any valid value.
const ORDER_STATUSES = ['pending', 'confirmed', 'ready', 'picked_up', 'completed', 'cancelled', 'expired'];
const COOK_TRANSITIONS = {
  confirmed: ['pending'],
  ready: ['pending', 'confirmed'],
  picked_up: ['confirmed', 'ready'],
  completed: ['ready', 'picked_up'],
  expired: ['pending', 'confirmed', 'ready']
};
const BUYER_TRANSITIONS = {
  cancelled: ['pending', 'confirmed']
};
const TIMELINE_KEYS = {
  confirmed: 'confirmedAt',
  ready: 'readyAt',
  picked_up: 'pickedUpAt',
  completed: 'completedAt',
  cancelled: 'cancelledAt',
  expired: 'expiredAt'
};
// Cancelled/expired orders give their portions back to the listing.
const RELEASED_STATUSES = ['cancelled', 'expired'];
// Buyer says "I paid" (paid); only the cook confirms receiving it (confirmed).
const PAYMENT_STATUSES = ['pending', 'paid', 'confirmed'];
const MAX_PAYMENT_PROOF_CHARS = 900000; // keeps the order under Firestore's 1 MB document limit

// Update order status
app.put('/api/orders/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, paymentProof } = req.body;
    const orderRef = db.collection('orders').doc(req.params.orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();
    const isAdmin = !!req.user.admin;
    const isBuyer = req.userId === order.buyerId;
    const isCook = await isOrderCook(order, req.userId);

    // Verify access (buyer, cook, or admin)
    if (!isAdmin && !isBuyer && !isCook) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = { updatedAt: serverTimestamp() };
    const currentStatus = order.orderStatus || 'pending';

    if (orderStatus !== undefined) {
      if (!ORDER_STATUSES.includes(orderStatus)) {
        return res.status(400).json({ error: `orderStatus must be one of: ${ORDER_STATUSES.join(', ')}` });
      }
      if (!isAdmin) {
        const allowedFrom = [
          isCook && COOK_TRANSITIONS[orderStatus],
          isBuyer && BUYER_TRANSITIONS[orderStatus]
        ].filter(Boolean);
        if (allowedFrom.length === 0) {
          return res.status(403).json({ error: `You can't set orderStatus to "${orderStatus}"` });
        }
        if (!allowedFrom.some(from => from.includes(currentStatus))) {
          return res.status(409).json({
            error: `Order is "${currentStatus}" and can't be changed to "${orderStatus}"`
          });
        }
      }
      updateData.orderStatus = orderStatus;
      if (TIMELINE_KEYS[orderStatus]) {
        updateData[`timeline.${TIMELINE_KEYS[orderStatus]}`] = serverTimestamp();
      }
    }

    if (paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(paymentStatus)) {
        return res.status(400).json({ error: `paymentStatus must be one of: ${PAYMENT_STATUSES.join(', ')}` });
      }
      const allowed = isAdmin ||
        (isBuyer && paymentStatus === 'paid') ||
        (isCook && paymentStatus === 'confirmed');
      if (!allowed) {
        return res.status(403).json({
          error: 'The buyer can set paymentStatus to "paid"; only the cook can set it to "confirmed"'
        });
      }
      updateData.paymentStatus = paymentStatus;
    }

    // lib/api-client.js confirmPayment() always sends paymentProof: '' — ignore an empty value from the cook.
    if (paymentProof !== undefined && !(paymentProof === '' && !isBuyer && !isAdmin)) {
      if (!isAdmin && !isBuyer) {
        return res.status(403).json({ error: 'Only the buyer can upload payment proof' });
      }
      if (typeof paymentProof !== 'string' || paymentProof.length > MAX_PAYMENT_PROOF_CHARS) {
        return res.status(400).json({ error: 'paymentProof must be text (a data-URL or link) under about 900 KB' });
      }
      updateData.paymentProof = paymentProof;
    }

    const releasesPortions = RELEASED_STATUSES.includes(orderStatus) &&
      !RELEASED_STATUSES.includes(currentStatus);

    if (releasesPortions && order.listingId) {
      // Cancel/expire and give the portions back in one transaction, so they're returned only once.
      await db.runTransaction(async tx => {
        const listingRef = db.collection('listings').doc(order.listingId);
        const freshOrder = await tx.get(orderRef);
        const listingDoc = await tx.get(listingRef);

        if (RELEASED_STATUSES.includes(freshOrder.data().orderStatus)) {
          throw new HttpError(409, 'Order is already cancelled or expired');
        }

        if (listingDoc.exists) {
          const listing = listingDoc.data();
          const portions = (Number(listing.portionsAvailable) || 0) + (Number(order.quantity) || 0);
          tx.update(listingRef, {
            portionsAvailable: portions,
            status: listing.status === 'sold_out' && portions > 0 ? 'available' : listing.status,
            updatedAt: serverTimestamp()
          });
        }
        tx.update(orderRef, updateData);
      });
    } else {
      await orderRef.update(updateData);
    }

    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    sendError(res, error, 'Update order error');
  }
});

// ============================================================================
// REVIEWS
// ============================================================================

// targetType -> collection whose rating/reviewCount the review updates
const REVIEW_TARGETS = { cook: 'cooks', dish: 'listings' };
const REVIEWABLE_ORDER_STATUSES = ['picked_up', 'completed'];

// Submit review
app.post('/api/reviews', verifyToken, async (req, res) => {
  try {
    const { orderId, targetType, title, text, tags } = req.body;
    const rating = Number(req.body.rating);

    if (!isValidId(orderId)) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    if (!Object.hasOwn(REVIEW_TARGETS, targetType)) {
      return res.status(400).json({ error: 'targetType must be "cook" or "dish"' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be a whole number from 1 to 5' });
    }

    // Verify order exists and user participated
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();
    if (req.userId !== order.buyerId) {
      return res.status(403).json({ error: 'Only buyer can review' });
    }
    if (!REVIEWABLE_ORDER_STATUSES.includes(order.orderStatus)) {
      return res.status(409).json({ error: 'You can review an order once it has been picked up' });
    }

    // The target is always the order's own cook or dish. A targetId that doesn't match is rejected.
    const expectedTargetId = targetType === 'cook' ? order.cookId : order.listingId;
    if (req.body.targetId !== undefined && req.body.targetId !== expectedTargetId) {
      return res.status(400).json({ error: 'targetId does not match this order' });
    }

    // One review per order per target type: a fixed document ID + create() fails if it already exists.
    const reviewRef = db.collection('reviews').doc(`${orderId}_${targetType}`);
    try {
      await reviewRef.create({
        orderId,
        reviewerId: req.userId,
        targetId: expectedTargetId,
        targetType,
        rating,
        title: typeof title === 'string' ? title : '',
        text: typeof text === 'string' ? text : '',
        photos: [],
        tags: Array.isArray(tags) ? tags : [],
        helpful: 0,
        reportCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isVerified: true
      });
    } catch (error) {
      if (error.code === 6) { // ALREADY_EXISTS
        return res.status(409).json({ error: 'You have already reviewed this order' });
      }
      throw error;
    }

    // Update target rating (cook or dish)
    await updateTargetRating(REVIEW_TARGETS[targetType], expectedTargetId, targetType);

    res.json({
      success: true,
      reviewId: reviewRef.id,
      message: 'Review submitted'
    });
  } catch (error) {
    sendError(res, error, 'Submit review error');
  }
});

// Get reviews for target
app.get('/api/reviews', async (req, res) => {
  try {
    const { targetId, targetType } = req.query;

    if (!targetId || !targetType) {
      return res.status(400).json({ error: 'Missing targetId or targetType' });
    }

    const reviews = await db
      .collection('reviews')
      .where('targetId', '==', targetId)
      .where('targetType', '==', targetType)
      .where('isVerified', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const results = reviews.docs.map(doc => ({
      reviewId: doc.id,
      ...doc.data()
    }));

    res.json({ count: results.length, reviews: results });
  } catch (error) {
    sendError(res, error);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Recompute a cook's or dish's average rating from its saved reviews.
// Called after the new review is saved, so the query already includes it (count it once).
async function updateTargetRating(collectionName, targetId, targetType) {
  try {
    const reviews = await db
      .collection('reviews')
      .where('targetId', '==', targetId)
      .where('targetType', '==', targetType)
      .where('isVerified', '==', true)
      .get();

    const ratings = reviews.docs
      .map(doc => Number(doc.data().rating))
      .filter(r => Number.isFinite(r));
    const avgRating = ratings.length
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    await db.collection(collectionName).doc(targetId).update({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating ${targetType} rating:`, error);
  }
}

// ============================================================================
// CHATBOT / AI ASSISTANT
// ============================================================================

// Simple in-memory per-IP rate limit for the public, paid chat endpoint.
// Resets on server restart; good enough for a single PM2 process.
const CHAT_RATE_LIMIT = 20;                    // messages per window per IP
const CHAT_RATE_WINDOW_MS = 10 * 60 * 1000;    // 10 minutes
const CHAT_MAX_CHARS = 2000;                   // per message / history item
const chatHits = new Map();                    // ip -> [timestamps]

function chatRateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || 'unknown';
  const hits = (chatHits.get(key) || []).filter(t => now - t < CHAT_RATE_WINDOW_MS);
  if (hits.length >= CHAT_RATE_LIMIT) {
    chatHits.set(key, hits);
    res.set('Retry-After', String(Math.ceil((CHAT_RATE_WINDOW_MS - (now - hits[0])) / 1000)));
    return res.status(429).json({ error: 'Too many messages. Please try again later.' });
  }
  hits.push(now);
  chatHits.set(key, hits);
  next();
}

// Drop stale entries so the map doesn't grow forever
setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of chatHits) {
    if (!hits.some(t => now - t < CHAT_RATE_WINDOW_MS)) chatHits.delete(key);
  }
}, CHAT_RATE_WINDOW_MS).unref();

// POST /api/chat/message - Send message to Claude AI (public endpoint — no auth required, rate-limited)
app.post('/api/chat/message', chatRateLimit, async (req, res) => {
  try {
    const { message } = req.body;
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (message.length > CHAT_MAX_CHARS) {
      return res.status(400).json({ error: `Message too long (max ${CHAT_MAX_CHARS} characters)` });
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Build conversation history (keep last 20 valid messages; only user/assistant roles)
    const conversationHistory = history
      .filter(msg => msg && (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string' && msg.content.trim().length > 0)
      .slice(-20)
      .map(msg => ({
        role: msg.role,
        content: msg.content.slice(0, CHAT_MAX_CHARS)
      }));

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message.trim()
    });

    const systemPrompt = `You are "Kopi", a friendly AI assistant for CookNextDoor, a hyperlocal food marketplace where neighbors sell homemade food within 1km radius.

Your personality:
- Warm, community-driven, use Singlish (Singapore English)
- Friendly and helpful, with food/cooking emojis
- Keep responses 3-5 sentences max
- Use "lah", "lor", "meh" naturally in responses

You help users with:
1. Finding nearby homemade food (browse, search, discover)
2. Selling dishes (register as cook, post menu, manage orders)
3. Pickup & payment (direct transfer: PayNow/PayLah/Cash - NO platform fees)
4. Food mood matching (taste preferences)
5. General platform questions

Important facts:
- CookNextDoor is FREE with ZERO commission
- Users pay each other directly (peer-to-peer)
- Search radius: 1km neighborhood
- All food is homemade/hyperlocal
- No restaurants, only home cooks

Tone examples:
- "Wah, so many choices nearby! 🍜 Want me to filter by cuisine?"
- "Aiyah, first time listing food? No worries lor, very simple lah!"
- "Eh, you found something? Just PayNow directly to the cook lor! 💚"

If user mentions: feedback, suggestion, rating, improve → acknowledge and continue normally (feedback form is on frontend).
If user asks technical questions outside your scope → suggest they check the how-it-works guide.`;

    // Call Anthropic API (secret kept on backend)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: systemPrompt,
        messages: conversationHistory
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMsg = error?.error?.message || `API error: ${response.status}`;
      console.error('Anthropic API error:', response.status, errorMsg);
      // Don't pass Anthropic's own message (billing, keys, limits) to the public
      return res.status(502).json({
        error: IS_DEV ? errorMsg : 'The assistant is unavailable right now. Please try again later.'
      });
    }

    const data = await response.json();
    const assistantMessage = data?.content?.[0]?.text || "Sorry, couldn't process that lah! Try again? 🙏";

    // Save chat to Firestore for conversation history (optional).
    // No userId: this route is unauthenticated, and an undefined field makes Firestore reject the write.
    try {
      await db.collection('chat_messages').doc().set({
        userMessage: message,
        assistantMessage: assistantMessage,
        createdAt: serverTimestamp()
      });
    } catch (dbError) {
      console.error('Error saving chat history:', dbError);
      // Don't fail the request if logging fails
    }

    res.json({
      success: true,
      message: assistantMessage
    });
  } catch (error) {
    sendError(res, error, 'Chat error');
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  // Browser origin not on the CORS allowlist
  if (err && typeof err.message === 'string' && err.message.startsWith('Not allowed by CORS')) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  // Malformed JSON body or body too large (from express.json)
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    return res.status(err.status || 400).json({ error: err.type === 'entity.too.large' ? 'Request body too large' : 'Invalid JSON body' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: IS_DEV ? err.message : undefined
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`🚀 CookNextDoor Backend running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
