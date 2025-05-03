import { createContext, useContext, useEffect, useState } from 'react';
import { mongodb, comparePassword, generateToken, verifyToken, MongoDBUser, hashPassword } from '@/lib/mongodb';

interface AuthContextType {
  user: MongoDBUser | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MongoDBUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const decoded = verifyToken(token);
          if (decoded) {
            const userData = await mongodb.users.findOne({ _id: decoded.userId });
            if (userData) {
              setUser(userData);
            } else {
              // Invalid user, clear token
              localStorage.removeItem('auth_token');
            }
          } else {
            // Invalid token, clear it
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userData = await mongodb.users.findOne({ email });
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      const isPasswordValid = await comparePassword(password, userData.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
      
      // Generate token and store it
      const token = generateToken(userData._id);
      localStorage.setItem('auth_token', token);
      
      setUser(userData);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const existingUser = await mongodb.users.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const result = await mongodb.users.insertOne({
        email,
        password: hashedPassword,
        name,
        role: 'user'
      });
      
      // Get the created user
      const newUser = await mongodb.users.findOne({ _id: result.insertedId });
      
      if (newUser) {
        // Generate token and store it
        const token = generateToken(newUser._id);
        localStorage.setItem('auth_token', token);
        
        setUser(newUser);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    isAdmin: user?.role === 'admin',
    signIn,
    signUp,
    signOut,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
