import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCartStore();
  const navigate = useNavigate();
  
  // Close cart when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleBackdropClick}
          />
          
          {/* Cart drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-medium">Your Cart ({getTotalItems()})</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Cart content */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
                  <Button onClick={onClose}>Continue Shopping</Button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.size}-${item.color}`} className="py-4">
                      <div className="flex items-start">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              <Link to={`/product/${item.productId}`} onClick={onClose}>
                                {item.name}
                              </Link>
                            </h3>
                            <p className="text-sm font-medium text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                          
                          <p className="mt-1 text-sm text-gray-500">
                            {item.color} / {item.size}
                          </p>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center border rounded">
                              <button
                                onClick={() => updateQuantity(item.productId, item.size, item.color, Math.max(1, item.quantity - 1))}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="px-2 py-1 text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.productId, item.size, item.color)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Remove ${item.name} from cart`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatPrice(getTotalPrice())}</p>
                </div>
                <p className="text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                <div className="space-y-2">
                  <Button 
                    className="w-full flex items-center justify-center"
                    onClick={handleCheckout}
                  >
                    Checkout <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
