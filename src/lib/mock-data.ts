import { EventEmitter } from 'events';

// Create an event emitter for real-time updates
export const dbEvents = new EventEmitter();

// MongoDB User interface
export interface MongoDBUser {
  _id: string;
  email: string;
  password: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

// MongoDB Product interface
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

// MongoDB Order interface
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

// Mock users data
const users: MongoDBUser[] = [
  {
    _id: '1',
    email: 'admin@example.com',
    password: '$2a$10$XQCRKzA.VwZ4LRz3.zxdz.1yvNiFZG2vxRQfKu7MZ5eYkKBfQgmEO', // hashed 'password123'
    role: 'admin',
    createdAt: new Date('2023-01-01')
  },
  {
    _id: '2',
    email: 'user@example.com',
    password: '$2a$10$XQCRKzA.VwZ4LRz3.zxdz.1yvNiFZG2vxRQfKu7MZ5eYkKBfQgmEO', // hashed 'password123'
    name: 'John Doe',
    role: 'user',
    createdAt: new Date('2023-01-02')
  }
];

// Mock products data - we'll use the existing products from our data file
import { products as existingProducts } from '@/data/products';
const products: MongoDBProduct[] = existingProducts.map(product => ({
  _id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  images: product.images,
  colors: product.colors,
  sizes: product.sizes,
  category: product.category,
  featured: product.featured,
  bestSeller: product.bestSeller,
  new: product.new,
  stock: product.stock,
  createdAt: new Date(product.createdAt)
}));

// Mock orders data
const orders: MongoDBOrder[] = [
  {
    _id: 'order1',
    userId: '2',
    items: [
      {
        productId: '1',
        quantity: 2,
        color: '#000000',
        size: 'M',
        price: 29.99,
        name: 'Classic Logo Tee',
        image: 'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
      }
    ],
    total: 59.98,
    status: 'delivered',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
      phone: '555-123-4567'
    },
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_mock123456',
    createdAt: new Date('2023-05-01')
  }
];

// Mock MongoDB API
export const mongodb = {
  // User operations
  users: {
    findOne: async (query: { email?: string; _id?: string }) => {
      return users.find(user => 
        (query.email && user.email === query.email) || 
        (query._id && user._id === query._id)
      ) || null;
    },
    insertOne: async (userData: Omit<MongoDBUser, '_id' | 'createdAt'>) => {
      const newUser: MongoDBUser = {
        _id: `user${users.length + 1}`,
        ...userData,
        createdAt: new Date()
      };
      users.push(newUser);
      dbEvents.emit('userCreated', newUser);
      return { insertedId: newUser._id };
    },
    updateOne: async (query: { _id: string }, update: { $set: Partial<MongoDBUser> }) => {
      const userIndex = users.findIndex(user => user._id === query._id);
      if (userIndex === -1) return { modifiedCount: 0 };
      
      users[userIndex] = { ...users[userIndex], ...update.$set };
      dbEvents.emit('userUpdated', users[userIndex]);
      return { modifiedCount: 1 };
    },
    find: async (query: { role?: string }) => {
      let result = [...users];
      if (query.role) {
        result = result.filter(user => user.role === query.role);
      }
      return result;
    }
  },
  
  // Product operations
  products: {
    findOne: async (query: { _id?: string }) => {
      return products.find(product => query._id && product._id === query._id) || null;
    },
    find: async (query: { 
      category?: string; 
      featured?: boolean; 
      bestSeller?: boolean; 
      new?: boolean;
    }) => {
      let result = [...products];
      
      if (query.category) {
        result = result.filter(product => product.category === query.category);
      }
      
      if (query.featured !== undefined) {
        result = result.filter(product => product.featured === query.featured);
      }
      
      if (query.bestSeller !== undefined) {
        result = result.filter(product => product.bestSeller === query.bestSeller);
      }
      
      if (query.new !== undefined) {
        result = result.filter(product => product.new === query.new);
      }
      
      return result;
    },
    insertOne: async (productData: Omit<MongoDBProduct, '_id' | 'createdAt'>) => {
      const newProduct: MongoDBProduct = {
        _id: `product${products.length + 1}`,
        ...productData,
        createdAt: new Date()
      };
      products.push(newProduct);
      dbEvents.emit('productCreated', newProduct);
      return { insertedId: newProduct._id };
    },
    updateOne: async (query: { _id: string }, update: { $set: Partial<MongoDBProduct> }) => {
      const productIndex = products.findIndex(product => product._id === query._id);
      if (productIndex === -1) return { modifiedCount: 0 };
      
      products[productIndex] = { ...products[productIndex], ...update.$set };
      dbEvents.emit('productUpdated', products[productIndex]);
      return { modifiedCount: 1 };
    },
    deleteOne: async (query: { _id: string }) => {
      const productIndex = products.findIndex(product => product._id === query._id);
      if (productIndex === -1) return { deletedCount: 0 };
      
      const deletedProduct = products[productIndex];
      products.splice(productIndex, 1);
      dbEvents.emit('productDeleted', deletedProduct);
      return { deletedCount: 1 };
    }
  },
  
  // Order operations
  orders: {
    findOne: async (query: { _id?: string }) => {
      return orders.find(order => query._id && order._id === query._id) || null;
    },
    find: async (query: { userId?: string; status?: string }) => {
      let result = [...orders];
      
      if (query.userId) {
        result = result.filter(order => order.userId === query.userId);
      }
      
      if (query.status) {
        result = result.filter(order => order.status === query.status);
      }
      
      return result;
    },
    insertOne: async (orderData: Omit<MongoDBOrder, '_id' | 'createdAt'>) => {
      const newOrder: MongoDBOrder = {
        _id: `order${orders.length + 1}`,
        ...orderData,
        createdAt: new Date()
      };
      orders.push(newOrder);
      dbEvents.emit('orderCreated', newOrder);
      return { insertedId: newOrder._id };
    },
    updateOne: async (query: { _id: string }, update: { $set: Partial<MongoDBOrder> }) => {
      const orderIndex = orders.findIndex(order => order._id === query._id);
      if (orderIndex === -1) return { modifiedCount: 0 };
      
      orders[orderIndex] = { ...orders[orderIndex], ...update.$set };
      dbEvents.emit('orderUpdated', orders[orderIndex]);
      return { modifiedCount: 1 };
    }
  }
};

// Authentication utilities
export function generateToken(userId: string): string {
  return `token_${userId}_${Date.now()}`;
}

export function verifyToken(token: string): { userId: string } | null {
  if (!token.startsWith('token_')) return null;
  const parts = token.split('_');
  if (parts.length < 2) return null;
  return { userId: parts[1] };
}

export async function hashPassword(_password: string): Promise<string> {
  // Mock implementation - always returns the same hash
  return '$2a$10$XQCRKzA.VwZ4LRz3.zxdz.1yvNiFZG2vxRQfKu7MZ5eYkKBfQgmEO';
}

export async function comparePassword(_password: string, hashedPassword: string): Promise<boolean> {
  // Mock implementation - always returns true if the hash matches our mock hash
  return hashedPassword === '$2a$10$XQCRKzA.VwZ4LRz3.zxdz.1yvNiFZG2vxRQfKu7MZ5eYkKBfQgmEO';
}
