import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Logo Tee',
    description: 'Our signature t-shirt with the Like Us logo. Made from 100% organic cotton for maximum comfort and durability.',
    price: 29.99,
    images: [
      'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    colors: ['#000000', '#FFFFFF', '#6B7280'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    category: 'basics',
    featured: true,
    bestSeller: true,
    new: false,
    stock: 100,
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Minimalist Tee',
    description: 'A clean, minimal design for those who appreciate simplicity. This premium t-shirt features a subtle embroidered detail.',
    price: 34.99,
    images: [
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    colors: ['#000000', '#FFFFFF', '#E5E7EB'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'premium',
    featured: false,
    bestSeller: false,
    new: true,
    stock: 75,
    createdAt: '2023-02-15T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Artist Collab Tee',
    description: 'A special edition t-shirt featuring artwork from our collaboration with renowned artist Jane Doe.',
    price: 39.99,
    images: [
      'https://images.pexels.com/photos/6003188/pexels-photo-6003188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6003188/pexels-photo-6003188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6003188/pexels-photo-6003188.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    colors: ['#000000', '#4B5563', '#9CA3AF'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    category: 'limited',
    featured: true,
    bestSeller: false,
    new: true,
    stock: 50,
    createdAt: '2023-03-10T00:00:00.000Z',
  },
  {
    id: '4',
    name: 'Vintage Washed Tee',
    description: 'A pre-washed t-shirt with a vintage feel. Extremely soft and comfortable for everyday wear.',
    price: 32.99,
    images: [
      'https://images.pexels.com/photos/6347919/pexels-photo-6347919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6347919/pexels-photo-6347919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6347919/pexels-photo-6347919.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    colors: ['#4B5563', '#9CA3AF', '#F3F4F6'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'basics',
    featured: false,
    bestSeller: true,
    new: false,
    stock: 120,
    createdAt: '2023-01-20T00:00:00.000Z',
  },
  {
    id: '5',
    name: 'Eco-Friendly Tee',
    description: 'Made with 100% recycled materials, this t-shirt helps reduce environmental impact without compromising on style or comfort.',
    price: 36.99,
    images: [
      'https://images.pexels.com/photos/6311329/pexels-photo-6311329.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6311329/pexels-photo-6311329.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/6311329/pexels-photo-6311329.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    colors: ['#059669', '#10B981', '#D1FAE5'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    category: 'sustainable',
    featured: true,
    bestSeller: false,
    new: true,
    stock: 85,
    createdAt: '2023-04-01T00:00:00.000Z',
  },
  {
    id: '6',
    name: 'Graphic Print Tee',
    description: 'A bold graphic t-shirt featuring our signature design. Stand out from the crowd with this eye-catching piece.',
    price: 31.99,
    images: [
      'https://images.pexels.com/photos/8460098/pexels-photo-8460098.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/8460098/pexels-photo-8460098.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
      'https://images.pexels.com/photos/8460098/pexels-photo-8460098.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
    ],
    colors: ['#000000', '#1F2937', '#374151'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'graphic',
    featured: false,
    bestSeller: true,
    new: false,
    stock: 95,
    createdAt: '2023-02-05T00:00:00.000Z',
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find(product => product.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(product => product.featured);
}

export function getBestSellerProducts(): Product[] {
  return products.filter(product => product.bestSeller);
}

export function getNewProducts(): Product[] {
  return products.filter(product => product.new);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(product => product.category === category);
}