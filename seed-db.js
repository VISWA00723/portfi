// seed-db.js - Script to create initial admin user and sample data
import { MongoClient } from 'mongodb';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/like-us-tshirts';

// Match the hashing method used in the application
async function hashPassword(password) {
  // Using Node.js crypto since we can't use Web Crypto API in Node
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    
    const db = client.db();
    
    // Check if admin user already exists
    const existingAdmin = await db.collection('users').findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      // Create admin user
      const hashedPassword = await hashPassword('admin123');
      
      await db.collection('users').insertOne({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date()
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
    // Check if regular user already exists
    const existingUser = await db.collection('users').findOne({ email: 'user@example.com' });
    
    if (!existingUser) {
      // Create regular user
      const hashedPassword = await hashPassword('user123');
      
      await db.collection('users').insertOne({
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Regular User',
        role: 'user',
        createdAt: new Date()
      });
      
      console.log('Regular user created successfully');
    } else {
      console.log('Regular user already exists');
    }
    
    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Run the seed function
seedDatabase();
