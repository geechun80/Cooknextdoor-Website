/**
 * CookNextDoor Frontend API Client
 * Easy-to-use SDK for interacting with backend
 * 
 * Usage:
 * import { CookNextDoorAPI } from './api-client.js'
 * const api = new CookNextDoorAPI('https://cooknextdoor.org')
 * const user = await api.auth.register({...})
 */

export class CookNextDoorAPI {
  constructor(baseUrl = 'https://cooknextdoor.org') {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem('firebaseToken') || null;
  }

  // Set auth token after Firebase login
  setAuthToken(token) {
    this.authToken = token;
    localStorage.setItem('firebaseToken', token);
  }

  // Helper: Make API requests
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}/api${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // ========================================
  // AUTHENTICATION
  // ========================================
  auth = {
    // Register new user
    register: async (email, password, name, phone = '', userType = 'buyer') => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone, userType }),
      });
    },

    // Get current user profile
    profile: async () => {
      return this.request('/auth/profile');
    },

    // Logout (frontend only)
    logout: () => {
      this.authToken = null;
      localStorage.removeItem('firebaseToken');
    },
  };

  // ========================================
  // USERS
  // ========================================
  users = {
    // Get user profile
    getProfile: async (userId) => {
      return this.request(`/users/${userId}`);
    },

    // Update user profile
    updateProfile: async (userId, data) => {
      return this.request(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // Update location
    setLocation: async (userId, latitude, longitude, address = '', block = '', postal = '') => {
      return this.users.updateProfile(userId, {
        location: { latitude, longitude, address, block, postal },
      });
    },

    // Update preferences
    setPreferences: async (userId, preferences) => {
      return this.users.updateProfile(userId, { preferences });
    },
  };

  // ========================================
  // COOKS
  // ========================================
  cooks = {
    // Register as a cook
    register: async (cookData) => {
      return this.request('/cooks/register', {
        method: 'POST',
        body: JSON.stringify(cookData),
      });
    },

    // Get cook profile
    getProfile: async (cookId) => {
      return this.request(`/cooks/${cookId}`);
    },

    // Find nearby cooks
    nearby: async (latitude, longitude, radiusMeters = 1000) => {
      return this.request(
        `/cooks/nearby?latitude=${latitude}&longitude=${longitude}&radiusMeters=${radiusMeters}`
      );
    },

    // Get cook's orders (dashboard)
    getOrders: async (cookId) => {
      return this.request(`/cooks/${cookId}/orders`);
    },
  };

  // ========================================
  // LISTINGS
  // ========================================
  listings = {
    // Create new listing
    create: async (listingData) => {
      return this.request('/listings', {
        method: 'POST',
        body: JSON.stringify(listingData),
      });
    },

    // Get all listings
    getAll: async (options = {}) => {
      const { cuisine = '', status = 'available', limit = 20, offset = 0 } = options;
      return this.request(
        `/listings?cuisine=${cuisine}&status=${status}&limit=${limit}&offset=${offset}`
      );
    },

    // Get single listing
    getById: async (listingId) => {
      return this.request(`/listings/${listingId}`);
    },

    // Find nearby listings (1km radius)
    nearby: async (latitude, longitude, radiusMeters = 1000) => {
      return this.request(
        `/listings/nearby?latitude=${latitude}&longitude=${longitude}&radiusMeters=${radiusMeters}`
      );
    },

    // Update listing
    update: async (listingId, data) => {
      return this.request(`/listings/${listingId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // Mark as sold out
    markSoldOut: async (listingId) => {
      return this.listings.update(listingId, { status: 'sold_out' });
    },

    // Mark as unavailable
    deactivate: async (listingId) => {
      return this.listings.update(listingId, { isActive: false });
    },
  };

  // ========================================
  // ORDERS
  // ========================================
  orders = {
    // Create order
    create: async (orderData) => {
      return this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    // Get order details
    getById: async (orderId) => {
      return this.request(`/orders/${orderId}`);
    },

    // Get buyer's orders
    getBuyerOrders: async (userId) => {
      return this.request(`/users/${userId}/orders`);
    },

    // Update order status
    updateStatus: async (orderId, orderStatus) => {
      return this.request(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus }),
      });
    },

    // Confirm payment
    confirmPayment: async (orderId, paymentStatus, paymentProof = '') => {
      return this.request(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus, paymentProof }),
      });
    },

    // Mark as ready for pickup
    markReady: async (orderId) => {
      return this.orders.updateStatus(orderId, 'ready');
    },

    // Mark as picked up
    markPickedUp: async (orderId) => {
      return this.orders.updateStatus(orderId, 'picked_up');
    },

    // Complete order
    complete: async (orderId) => {
      return this.orders.updateStatus(orderId, 'completed');
    },

    // Cancel order
    cancel: async (orderId, reason = '') => {
      return this.request(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ orderStatus: 'cancelled', cancelReason: reason }),
      });
    },
  };

  // ========================================
  // REVIEWS
  // ========================================
  reviews = {
    // Submit review
    create: async (reviewData) => {
      return this.request('/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
    },

    // Get reviews for cook/dish
    get: async (targetId, targetType = 'cook') => {
      return this.request(`/reviews?targetId=${targetId}&targetType=${targetType}`);
    },

    // Quick review submission
    reviewCook: async (orderId, cookId, rating, text = '', tags = []) => {
      return this.reviews.create({
        orderId,
        targetId: cookId,
        targetType: 'cook',
        rating,
        text,
        tags,
      });
    },

    // Quick review submission for dish
    reviewDish: async (orderId, listingId, rating, text = '', tags = []) => {
      return this.reviews.create({
        orderId,
        targetId: listingId,
        targetType: 'dish',
        rating,
        text,
        tags,
      });
    },
  };
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get user's current location
 * Returns: { latitude, longitude, address }
 */
export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      }
    );
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns: distance in kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Format currency for Singapore (SGD)
 */
export function formatSGD(amount) {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount);
}

/**
 * Format date to readable format
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp.toDate?.() || timestamp);
  return date.toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time (HH:MM)
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr;
}

/**
 * Generate star rating HTML
 */
export function generateStars(rating, maxRating = 5, size = 20) {
  const filled = Math.floor(rating);
  const decimal = rating - filled;
  let stars = '';

  for (let i = 0; i < maxRating; i++) {
    if (i < filled) {
      stars += '⭐';
    } else if (i === filled && decimal > 0) {
      stars += '✨'; // Half star
    } else {
      stars += '☆';
    }
  }

  return stars;
}

// ========================================
// EXAMPLE USAGE
// ========================================
/*

import { CookNextDoorAPI, getUserLocation, calculateDistance } from './api-client.js'

const api = new CookNextDoorAPI('https://cooknextdoor.org')

// 1. Register as buyer
const user = await api.auth.register(
  'buyer@example.sg',
  'password123',
  'John Tan',
  '+6581234567',
  'buyer'
)

// 2. Set location
const location = await getUserLocation()
await api.users.setLocation(user.userId, location.latitude, location.longitude)

// 3. Find nearby listings
const nearby = await api.listings.nearby(location.latitude, location.longitude)
console.log('Found', nearby.count, 'listings nearby')

// 4. Place order
const order = await api.orders.create({
  cookId: 'cook123',
  listingId: 'listing123',
  quantity: 2,
  paymentMethod: 'paynow'
})

// 5. Leave review
const review = await api.reviews.reviewCook(
  order.orderId,
  'cook123',
  5,
  'Amazing food!'
)

*/
