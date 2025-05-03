import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/mongo-auth-context';
import CheckoutForm from '@/components/checkout/checkout-form';

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  if (items.length === 0 || !user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Checkout
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm />
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={`${item.productId}-${item.color}-${item.size}`} className="flex items-center">
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.color} / {item.size} / Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
