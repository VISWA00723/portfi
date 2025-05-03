// update-users.js - Script to update existing users with correctly hashed passwords
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

async function updateUsers() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    
    const db = client.db();
    
    // Update admin user
    const adminPassword = await hashPassword('admin123');
    const adminResult = await db.collection('users').updateOne(
      { email: 'admin@example.com' },
      { $set: { password: adminPassword } }
    );
    
    console.log(`Admin user updated: ${adminResult.modifiedCount > 0 ? 'success' : 'no changes needed'}`);
    
    // Update regular user
    const userPassword = await hashPassword('user123');
    const userResult = await db.collection('users').updateOne(
      { email: 'user@example.com' },
      { $set: { password: userPassword } }
    );
    
    console.log(`Regular user updated: ${userResult.modifiedCount > 0 ? 'success' : 'no changes needed'}`);
    
    console.log('User password updates completed');
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await client.close();
  }
}

// Run the update function
updateUsers();
