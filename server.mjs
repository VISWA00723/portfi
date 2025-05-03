// server.mjs - Using ES modules syntax and built-in Node.js modules
import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

// In-memory database for development (since we can't connect to MongoDB)
const db = {
  users: [],
  products: [],
  orders: []
};

// Load mock data if available
try {
  const mockDataPath = './src/lib/mock-data.ts';
  if (fs.existsSync(mockDataPath)) {
    console.log('Loading mock data...');
    // This is just a placeholder - we can't actually import TS files directly
    // In a real scenario, you'd convert the mock data to JSON
  }
} catch (error) {
  console.error('Error loading mock data:', error);
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

// Parse request body
const parseBody = async (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
};

// Send JSON response
const sendJSON = (res, data, status = 200) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...corsHeaders
  });
  res.end(JSON.stringify(data));
};

// Handle API routes
const handleRequest = async (req, res) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Parse URL
  const baseURL = `http://${req.headers.host}`;
  const url = new URL(req.url, baseURL);
  const pathname = url.pathname;
  
  console.log(`${req.method} ${pathname}`);

  // Health check
  if (pathname === '/api/health') {
    return sendJSON(res, { status: 'ok', message: 'Server is running' });
  }

  // Users API
  if (pathname === '/api/users' && req.method === 'GET') {
    return sendJSON(res, db.users);
  }
  
  if (pathname === '/api/users' && req.method === 'POST') {
    try {
      const userData = await parseBody(req);
      const newUser = {
        _id: `user_${Date.now()}`,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      db.users.push(newUser);
      return sendJSON(res, newUser, 201);
    } catch (error) {
      return sendJSON(res, { error: error.message }, 500);
    }
  }
  
  if (pathname.startsWith('/api/users/') && req.method === 'GET') {
    const id = pathname.split('/').pop();
    const user = db.users.find(u => u._id === id);
    if (!user) {
      return sendJSON(res, { error: 'User not found' }, 404);
    }
    return sendJSON(res, user);
  }

  // Products API
  if (pathname === '/api/products' && req.method === 'GET') {
    return sendJSON(res, db.products);
  }
  
  if (pathname === '/api/products' && req.method === 'POST') {
    try {
      const productData = await parseBody(req);
      const newProduct = {
        _id: `product_${Date.now()}`,
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      db.products.push(newProduct);
      return sendJSON(res, newProduct, 201);
    } catch (error) {
      return sendJSON(res, { error: error.message }, 500);
    }
  }
  
  if (pathname.startsWith('/api/products/') && req.method === 'GET') {
    const id = pathname.split('/').pop();
    const product = db.products.find(p => p._id === id);
    if (!product) {
      return sendJSON(res, { error: 'Product not found' }, 404);
    }
    return sendJSON(res, product);
  }

  // Orders API
  if (pathname === '/api/orders' && req.method === 'GET') {
    return sendJSON(res, db.orders);
  }
  
  if (pathname === '/api/orders' && req.method === 'POST') {
    try {
      const orderData = await parseBody(req);
      const newOrder = {
        _id: `order_${Date.now()}`,
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      db.orders.push(newOrder);
      return sendJSON(res, newOrder, 201);
    } catch (error) {
      return sendJSON(res, { error: error.message }, 500);
    }
  }
  
  if (pathname.startsWith('/api/orders/') && req.method === 'GET') {
    const id = pathname.split('/').pop();
    const order = db.orders.find(o => o._id === id);
    if (!order) {
      return sendJSON(res, { error: 'Order not found' }, 404);
    }
    return sendJSON(res, order);
  }

  // Stripe payment API
  if (pathname === '/api/payment/create-intent' && req.method === 'POST') {
    try {
      const { amount, currency } = await parseBody(req);
      const paymentIntent = {
        id: `pi_${Math.random().toString(36).substring(2, 15)}`,
        client_secret: `pi_${Math.random().toString(36).substring(2, 15)}_secret_${Math.random().toString(36).substring(2, 15)}`,
        amount,
        currency,
        status: 'requires_payment_method'
      };
      return sendJSON(res, paymentIntent);
    } catch (error) {
      return sendJSON(res, { error: error.message }, 500);
    }
  }
  
  if (pathname === '/api/payment/success' && req.method === 'POST') {
    try {
      const { paymentIntentId } = await parseBody(req);
      return sendJSON(res, {
        id: paymentIntentId,
        status: 'succeeded'
      });
    } catch (error) {
      return sendJSON(res, { error: error.message }, 500);
    }
  }

  // Not found
  sendJSON(res, { error: 'Not found' }, 404);
};

// Create and start server
const PORT = 5000;
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`API available at http://localhost:${PORT}/api/health`);
});
