import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cartStore';
import { stripeCreatePaymentIntent } from '@/lib';
import { mongodb } from '@/lib/mongodb';
import { useAuth } from '@/contexts/mongo-auth-context';

interface CheckoutFormProps {
  onSuccess?: () => void;
}

export default function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { user } = useAuth();
  const { items, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in to complete your purchase');
      return;
    }
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create a payment intent with Stripe
      const paymentIntent = await stripeCreatePaymentIntent(total, user.email);
      
      // In a real app, you would use Stripe Elements to collect and validate payment info
      // For our mock implementation, we'll just simulate a successful payment
      // We would normally use the client_secret for Stripe.js confirmCardPayment()
      
      // Create an order in our database
      const orderData = {
        userId: user._id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          color: item.color || item.selectedColor || '',
          size: item.size || item.selectedSize || '',
          price: item.price,
          name: item.name,
          image: item.image
        })),
        total: total,
        status: 'processing' as const,
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        paymentMethod: 'stripe',
        paymentStatus: 'paid' as const,
        paymentIntentId: paymentIntent.id
      };
      
      await mongodb.orders.insertOne(orderData);
      
      // Store order completion in session storage for order confirmation page
      sessionStorage.setItem('orderCompleted', 'true');
      
      // Clear the cart
      clearCart();
      
      // Show success message
      setSuccess(true);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Redirect to order confirmation page after a delay
      setTimeout(() => {
        navigate('/order-confirmation');
      }, 2000);
      
    } catch (error) {
      console.error('Checkout error:', error);
      setError('An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 p-6 rounded-lg text-center"
      >
        <h2 className="text-2xl font-semibold text-green-700 mb-2">Payment Successful!</h2>
        <p className="text-green-600 mb-4">Your order has been placed successfully.</p>
        <p className="text-gray-600">Redirecting to order confirmation...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-sm"
    >
      <h2 className="text-2xl font-semibold mb-6">Checkout</h2>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input
                type="text"
                name="address1"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.address1}
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="address2"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.address2}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.postalCode}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                name="country"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="USA">United States</option>
                <option value="CAN">Canada</option>
                <option value="GBR">United Kingdom</option>
                <option value="AUS">Australia</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  className="w-full p-2 pl-10 border border-gray-300 rounded-md"
                  placeholder="4242 4242 4242 4242"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  required
                />
                <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input
                type="text"
                name="cardExpiry"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="MM/YY"
                value={formData.cardExpiry}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input
                type="text"
                name="cardCvc"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="123"
                value={formData.cardCvc}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
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
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader className="animate-spin mr-2 h-4 w-4" />
              Processing...
            </span>
          ) : (
            'Complete Purchase'
          )}
        </Button>
      </form>
    </motion.div>
  );
}
