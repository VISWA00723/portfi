import { CardElement, useStripe, useElements } from '@/lib/stripe-mock';
import { createPaymentIntent } from '@/lib/mongodb';

export function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    try {
      const { client_secret } = await createPaymentIntent(amount);
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement('card')!,
        }
      });

      if (error) {
        console.error('Payment failed:', error);
        alert(`Payment failed: ${error.message}`);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!', paymentIntent);
        alert('Payment successful!');
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment processing failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded shadow-sm bg-white">
        <h3 className="text-lg font-medium mb-4">Payment Information</h3>
        <CardElement className="mb-4" />
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={!stripe}
        >
          Pay ${amount.toFixed(2)}
        </button>
      </div>
    </form>
  );
}
