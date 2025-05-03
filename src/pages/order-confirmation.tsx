import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderConfirmation() {
  const navigate = useNavigate();

  // This would typically check for an order ID in the URL or state
  // For our mock implementation, we'll just show a generic confirmation
  useEffect(() => {
    // If there's no order data, redirect to home
    const hasOrderData = sessionStorage.getItem('orderCompleted');
    if (!hasOrderData) {
      navigate('/');
    }

    // Clean up session storage
    return () => {
      sessionStorage.removeItem('orderCompleted');
    };
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-sm text-center"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Thank you for your purchase. Your order has been received and is being processed.
          You will receive an email confirmation shortly.
        </p>
        
        <div className="border-t border-b border-gray-200 py-6 mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium">#ORD-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Delivery:</span>
            <span className="font-medium">
              {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/shop" className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
          
          <Link to="/" className="flex items-center justify-center border border-gray-300 px-4 py-2 rounded-md">
            Go to Homepage
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
