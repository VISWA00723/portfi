export interface Product {
  id: string;
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
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
  size: string;
  // Add these properties for checkout
  selectedColor?: string;
  selectedSize?: string;
  images?: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface Order {
  id: string;
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
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  createdAt: Date;
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}