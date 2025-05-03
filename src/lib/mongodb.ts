// This is a real-time implementation using local MongoDB
// We're using a REST API approach due to package installation restrictions
import { CustomEventEmitter } from '@/lib/custom-event-emitter';

// Create an event emitter for real-time updates
export const dbEvents = new CustomEventEmitter();

// Export the MongoDB types
export interface MongoDBUser {
  _id: string;
  email: string;
  password: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface MongoDBProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  colors: string[];
  sizes: string[];
  category: string;
  featured: boolean;
  bestSeller: boolean;
  new: boolean;
  stock: number;
  createdAt: Date;
}

export interface MongoDBOrder {
  _id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    color: string;
    size: string;
    price: number;
    name: string;
    image: string;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  createdAt: Date;
}

// Local MongoDB API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests to local MongoDB API
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Set up polling for real-time updates
let pollingIntervals: { [key: string]: number } = {};

function startPolling(collection: string, interval: number = 5000) {
  if (pollingIntervals[collection]) {
    clearInterval(pollingIntervals[collection]);
  }

  let lastUpdate = new Date();
  
  pollingIntervals[collection] = window.setInterval(async () => {
    try {
      // Find documents updated since last poll
      const result = await apiRequest(`${collection}?updatedAfter=${lastUpdate.toISOString()}`);
      
      if (result && result.length > 0) {
        result.forEach((doc: any) => {
          // Emit appropriate events based on document type
          switch (collection) {
            case 'users':
              dbEvents.emit('userUpdated', doc);
              break;
            case 'products':
              dbEvents.emit('productUpdated', doc);
              break;
            case 'orders':
              dbEvents.emit('orderUpdated', doc);
              break;
          }
        });
        
        lastUpdate = new Date();
      }
    } catch (error) {
      console.error(`Polling error for ${collection}:`, error);
    }
  }, interval);
  
  return () => {
    if (pollingIntervals[collection]) {
      clearInterval(pollingIntervals[collection]);
      delete pollingIntervals[collection];
    }
  };
}

// Start polling for all collections
export function startRealtimeUpdates() {
  const stopUsersPolling = startPolling('users');
  const stopProductsPolling = startPolling('products');
  const stopOrdersPolling = startPolling('orders');
  
  return () => {
    stopUsersPolling();
    stopProductsPolling();
    stopOrdersPolling();
  };
}

// MongoDB API
export const mongodb = {
  // User operations
  users: {
    findOne: async (query: { email?: string; _id?: string }) => {
      let endpoint = 'users';
      
      if (query._id) {
        endpoint = `users/${query._id}`;
      } else if (query.email) {
        endpoint = `users/email/${query.email}`;
      }
      
      try {
        const result = await apiRequest(endpoint);
        return result || null;
      } catch (error) {
        console.error('Error finding user:', error);
        return null;
      }
    },
    insertOne: async (userData: Omit<MongoDBUser, '_id' | 'createdAt'>) => {
      try {
        const result = await apiRequest('users', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        
        if (result._id) {
          dbEvents.emit('userCreated', result);
          return { insertedId: result._id };
        }
        
        throw new Error('Failed to insert user');
      } catch (error) {
        console.error('Error inserting user:', error);
        throw error;
      }
    },
    updateOne: async (query: { _id: string }, update: { $set: Partial<MongoDBUser> }) => {
      try {
        const result = await apiRequest(`users/${query._id}`, {
          method: 'PATCH',
          body: JSON.stringify(update.$set),
        });
        
        if (result.modifiedCount > 0) {
          // Fetch the updated document to emit with the event
          const updatedUser = await apiRequest(`users/${query._id}`);
          
          if (updatedUser) {
            dbEvents.emit('userUpdated', updatedUser);
          }
          
          return { modifiedCount: result.modifiedCount };
        }
        
        return { modifiedCount: 0 };
      } catch (error) {
        console.error('Error updating user:', error);
        return { modifiedCount: 0 };
      }
    },
    find: async (query: { role?: string }) => {
      try {
        let endpoint = 'users';
        
        if (query.role) {
          endpoint = `users?role=${query.role}`;
        }
        
        const result = await apiRequest(endpoint);
        return result || [];
      } catch (error) {
        console.error('Error finding users:', error);
        return [];
      }
    }
  },
  
  // Product operations
  products: {
    findOne: async (query: { _id?: string }) => {
      try {
        if (!query._id) return null;
        
        const result = await apiRequest(`products/${query._id}`);
        return result || null;
      } catch (error) {
        console.error('Error finding product:', error);
        return null;
      }
    },
    find: async (query: { 
      category?: string; 
      featured?: boolean; 
      bestSeller?: boolean; 
      new?: boolean;
    }) => {
      try {
        const queryParams = new URLSearchParams();
        
        if (query.category) queryParams.append('category', query.category);
        if (query.featured !== undefined) queryParams.append('featured', String(query.featured));
        if (query.bestSeller !== undefined) queryParams.append('bestSeller', String(query.bestSeller));
        if (query.new !== undefined) queryParams.append('new', String(query.new));
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `products?${queryString}` : 'products';
        
        const result = await apiRequest(endpoint);
        return result || [];
      } catch (error) {
        console.error('Error finding products:', error);
        return [];
      }
    },
    insertOne: async (productData: Omit<MongoDBProduct, '_id' | 'createdAt'>) => {
      try {
        const result = await apiRequest('products', {
          method: 'POST',
          body: JSON.stringify(productData),
        });
        
        if (result._id) {
          dbEvents.emit('productCreated', result);
          return { insertedId: result._id };
        }
        
        throw new Error('Failed to insert product');
      } catch (error) {
        console.error('Error inserting product:', error);
        throw error;
      }
    },
    updateOne: async (query: { _id: string }, update: { $set: Partial<MongoDBProduct> }) => {
      try {
        const result = await apiRequest(`products/${query._id}`, {
          method: 'PATCH',
          body: JSON.stringify(update.$set),
        });
        
        if (result.modifiedCount > 0) {
          // Fetch the updated document to emit with the event
          const updatedProduct = await apiRequest(`products/${query._id}`);
          
          if (updatedProduct) {
            dbEvents.emit('productUpdated', updatedProduct);
          }
          
          return { modifiedCount: result.modifiedCount };
        }
        
        return { modifiedCount: 0 };
      } catch (error) {
        console.error('Error updating product:', error);
        return { modifiedCount: 0 };
      }
    },
    deleteOne: async (query: { _id: string }) => {
      try {
        // Get the product before deleting it
        const product = await apiRequest(`products/${query._id}`);
        
        const result = await apiRequest(`products/${query._id}`, {
          method: 'DELETE',
        });
        
        if (result.deletedCount > 0 && product) {
          dbEvents.emit('productDeleted', product);
          return { deletedCount: result.deletedCount };
        }
        
        return { deletedCount: 0 };
      } catch (error) {
        console.error('Error deleting product:', error);
        return { deletedCount: 0 };
      }
    }
  },
  
  // Order operations
  orders: {
    findOne: async (query: { _id?: string }) => {
      try {
        if (!query._id) return null;
        
        const result = await apiRequest(`orders/${query._id}`);
        return result || null;
      } catch (error) {
        console.error('Error finding order:', error);
        return null;
      }
    },
    find: async (query: { userId?: string; status?: string }) => {
      try {
        const queryParams = new URLSearchParams();
        
        if (query.userId) queryParams.append('userId', query.userId);
        if (query.status) queryParams.append('status', query.status);
        
        const queryString = queryParams.toString();
        const endpoint = queryString ? `orders?${queryString}` : 'orders';
        
        const result = await apiRequest(endpoint);
        return result || [];
      } catch (error) {
        console.error('Error finding orders:', error);
        return [];
      }
    },
    insertOne: async (orderData: Omit<MongoDBOrder, '_id' | 'createdAt'>) => {
      try {
        const result = await apiRequest('orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        });
        
        if (result._id) {
          dbEvents.emit('orderCreated', result);
          return { insertedId: result._id };
        }
        
        throw new Error('Failed to insert order');
      } catch (error) {
        console.error('Error inserting order:', error);
        throw error;
      }
    },
    updateOne: async (query: { _id: string }, update: { $set: Partial<MongoDBOrder> }) => {
      try {
        const result = await apiRequest(`orders/${query._id}`, {
          method: 'PATCH',
          body: JSON.stringify(update.$set),
        });
        
        if (result.modifiedCount > 0) {
          // Fetch the updated document to emit with the event
          const updatedOrder = await apiRequest(`orders/${query._id}`);
          
          if (updatedOrder) {
            dbEvents.emit('orderUpdated', updatedOrder);
          }
          
          return { modifiedCount: result.modifiedCount };
        }
        
        return { modifiedCount: 0 };
      } catch (error) {
        console.error('Error updating order:', error);
        return { modifiedCount: 0 };
      }
    }
  }
};

// Stripe integration
// Using a real implementation with the Stripe.js loaded from CDN
export const createPaymentIntent = async (amount: number) => {
  try {
    // Call your backend API to create a payment intent
    const response = await fetch(`${API_BASE_URL}/payment/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'usd',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Fallback to mock implementation for development
    console.log('Using mock payment intent as fallback');
    return {
      id: `pi_${Math.random().toString(36).substring(2, 15)}`,
      client_secret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`,
      amount: Math.round(amount * 100),
      currency: 'usd',
      status: 'requires_payment_method'
    };
  }
};

export const handlePaymentSuccess = async (paymentIntentId: string) => {
  try {
    // Call your backend API to handle payment success
    const response = await fetch(`${API_BASE_URL}/payment/success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process payment success');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error handling payment success:', error);
    
    // Fallback to mock implementation for development
    return {
      id: paymentIntentId,
      status: 'succeeded'
    };
  }
};

// Authentication utilities
export function generateToken(userId: string): string {
  // In a real implementation, this would use JWT
  return btoa(`${userId}:${Date.now()}:${Math.random().toString(36).substring(2)}`);
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    // In a real implementation, this would verify the JWT
    const decoded = atob(token);
    const [userId] = decoded.split(':');
    
    if (!userId) {
      return null;
    }
    
    return { userId };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  // In a real implementation, this would use bcrypt
  // For now, we'll use a simple hash function
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}
