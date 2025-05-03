import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';
import { generateId } from '@/lib/utils';

interface CartState {
  items: CartItem[];
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  updateTotal: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      
      addItem: (item) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          i => i.productId === item.productId && i.size === item.size && i.color === item.color
        );
        
        let updatedItems;
        if (existingItemIndex >= 0) {
          updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += item.quantity;
        } else {
          updatedItems = [...items, item];
        }
        
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items: updatedItems, total });
      },
      
      removeItem: (productId, size, color) => {
        const { items } = get();
        const updatedItems = items.filter(
          i => !(i.productId === productId && i.size === size && i.color === color)
        );
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items: updatedItems, total });
      },
      
      updateQuantity: (productId, size, color, quantity) => {
        const { items } = get();
        const updatedItems = items.map(item => {
          if (item.productId === productId && item.size === size && item.color === color) {
            return { ...item, quantity };
          }
          return item;
        });
        const total = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ items: updatedItems, total });
      },
      
      clearCart: () => set({ items: [], total: 0 }),
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      updateTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        set({ total });
      }
    }),
    {
      name: 'like-us-cart',
    }
  )
);