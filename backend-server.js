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
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

const db = admin.firestore();
const storage = admin.storage().bucket();
const auth = admin.auth();

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
// AUTHENTICATION ROUTES
// ============================================================================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, userType } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;
    if (preferences) updateData.preferences = preferences;

    await db.collection('users').doc(req.params.userId).update(updateData);

    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile (public)
app.get('/api/users/:userId', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: req.params.userId,
      ...userDoc.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      cookId: cookRef.id,
      message: 'Cook profile created. Pending verification.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cook profile
app.get('/api/cooks/:cookId', async (req, res) => {
  try {
    const cookDoc = await db.collection('cooks').doc(req.params.cookId).get();
    
    if (!cookDoc.exists) {
      return res.status(404).json({ error: 'Cook not found' });
    }

    res.json({
      cookId: req.params.cookId,
      ...cookDoc.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby active cooks (1km radius)
app.get('/api/cooks/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radiusMeters = 1000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing latitude/longitude' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

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
      ...doc.data()
    }));

    res.json({ count: results.length, cooks: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      dishName,
      description: description || '',
      cuisine: cuisine || '',
      category: category || 'main',
      price: parseFloat(price),
      portionSize: portionSize || '3-5 servings',
      totalPortions: parseInt(totalPortions),
      portionsAvailable: parseInt(totalPortions),
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    res.json({
      success: true,
      listingId: listingRef.id,
      message: 'Listing created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active listings (with filters)
app.get('/api/listings', async (req, res) => {
  try {
    const { cuisine, status = 'available', limit = 20, offset = 0 } = req.query;

    let query = db.collection('listings');

    if (status) query = query.where('status', '==', status);
    if (cuisine) query = query.where('cuisine', '==', cuisine);

    const listings = await query
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const results = listings.docs.map(doc => ({
      listingId: doc.id,
      ...doc.data()
    }));

    res.json({ count: results.length, listings: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby listings (1km radius)
app.get('/api/listings/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radiusMeters = 1000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Missing latitude/longitude' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (portionsAvailable !== undefined) updateData.portionsAvailable = portionsAvailable;
    if (status) updateData.status = status;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.collection('listings').doc(req.params.listingId).update(updateData);

    res.json({ success: true, message: 'Listing updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// ORDERS (TRACKING ONLY)
// ============================================================================

// Create order
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const {
      cookId,
      listingId,
      quantity,
      paymentMethod,
      buyerNotes,
      specialRequests
    } = req.body;

    // Get listing details
    const listingDoc = await db.collection('listings').doc(listingId).get();
    if (!listingDoc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingDoc.data();

    if (listing.portionsAvailable < quantity) {
      return res.status(400).json({ error: 'Not enough portions available' });
    }

    // Create order
    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      buyerId: req.userId,
      cookId,
      listingId,
      dishName: listing.dishName,
      quantity: parseInt(quantity),
      unitPrice: listing.price,
      totalPrice: listing.price * quantity,
      paymentMethod,
      paymentStatus: 'pending',
      paymentProof: '',
      orderStatus: 'pending',
      pickupLocation: listing.location,
      pickupTime: listing.pickupTime,
      buyerNotes: buyerNotes || '',
      cookResponse: '',
      specialRequests: specialRequests || [],
      timeline: {
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    // Update listing portions
    await db.collection('listings').doc(listingId).update({
      portionsAvailable: listing.portionsAvailable - quantity,
      status: listing.portionsAvailable - quantity === 0 ? 'sold_out' : listing.status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      orderId: orderRef.id,
      message: 'Order created. Payment pending.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order details
app.get('/api/orders/:orderId', verifyToken, async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();

    // Verify access (buyer, cook, or admin)
    if (req.userId !== order.buyerId && req.userId !== order.cookId && !req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      orderId: req.params.orderId,
      ...order
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.put('/api/orders/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderStatus, paymentStatus, paymentProof } = req.body;
    const orderDoc = await db.collection('orders').doc(req.params.orderId).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();

    // Verify access
    if (req.userId !== order.cookId && req.userId !== order.buyerId && !req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    if (orderStatus) {
      updateData.orderStatus = orderStatus;
      updateData.timeline = order.timeline || {};
      
      if (orderStatus === 'confirmed') {
        updateData.timeline.confirmedAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (orderStatus === 'ready') {
        updateData.timeline.readyAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (orderStatus === 'picked_up') {
        updateData.timeline.pickedUpAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (orderStatus === 'completed') {
        updateData.timeline.completedAt = admin.firestore.FieldValue.serverTimestamp();
      }
    }

    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (paymentProof) updateData.paymentProof = paymentProof;

    await db.collection('orders').doc(req.params.orderId).update(updateData);

    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// REVIEWS
// ============================================================================

// Submit review
app.post('/api/reviews', verifyToken, async (req, res) => {
  try {
    const { orderId, targetId, targetType, rating, title, text, tags } = req.body;

    // Verify order exists and user participated
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();
    if (req.userId !== order.buyerId) {
      return res.status(403).json({ error: 'Only buyer can review' });
    }

    // Create review
    const reviewRef = db.collection('reviews').doc();
    await reviewRef.set({
      orderId,
      reviewerId: req.userId,
      targetId,
      targetType,
      rating: parseInt(rating),
      title: title || '',
      text: text || '',
      photos: [],
      tags: tags || [],
      helpful: 0,
      reportCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isVerified: true
    });

    // Update target rating (cook or dish)
    if (targetType === 'cook') {
      await updateCookRating(targetId, rating);
    } else if (targetType === 'dish') {
      await updateDishRating(targetId, rating);
    }

    res.json({
      success: true,
      reviewId: reviewRef.id,
      message: 'Review submitted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function updateCookRating(cookId, newRating) {
  try {
    const reviews = await db
      .collection('reviews')
      .where('targetId', '==', cookId)
      .where('targetType', '==', 'cook')
      .where('isVerified', '==', true)
      .get();

    let totalRating = newRating;
    let count = 1;

    reviews.docs.forEach(doc => {
      totalRating += doc.data().rating;
      count++;
    });

    const avgRating = totalRating / count;

    await db.collection('cooks').doc(cookId).update({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: count - 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating cook rating:', error);
  }
}

async function updateDishRating(listingId, newRating) {
  try {
    const reviews = await db
      .collection('reviews')
      .where('targetId', '==', listingId)
      .where('targetType', '==', 'dish')
      .where('isVerified', '==', true)
      .get();

    let totalRating = newRating;
    let count = 1;

    reviews.docs.forEach(doc => {
      totalRating += doc.data().rating;
      count++;
    });

    const avgRating = totalRating / count;

    await db.collection('listings').doc(listingId).update({
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: count - 1,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating dish rating:', error);
  }
}

// ============================================================================
// CHATBOT / AI ASSISTANT
// ============================================================================

// POST /api/chat/message - Send message to Claude AI (secure backend proxy)
app.post('/api/chat/message', verifyToken, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Build conversation history (keep last 20 messages)
    const conversationHistory = history
      .slice(-20)
      .map(msg => ({
        role: msg.role,
        content: msg.content
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
      console.error('Anthropic API error:', errorMsg);
      return res.status(response.status).json({ error: errorMsg });
    }

    const data = await response.json();
    const assistantMessage = data?.content?.[0]?.text || "Sorry, couldn't process that lah! Try again? 🙏";

    // Save chat to Firestore for conversation history (optional)
    try {
      await db.collection('chat_messages').doc().set({
        userId: req.userId,
        userMessage: message,
        assistantMessage: assistantMessage,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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
    console.error('Chat error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Chat failed'
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
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
