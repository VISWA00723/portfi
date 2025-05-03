import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Add TypeScript declaration for the global Stripe object
declare global {
  interface Window {
    Stripe: any;
  }
}

// Types for Stripe elements
interface StripeCardElement {
  mount: (element: HTMLElement) => void;
  unmount: () => void;
  update: (options: any) => void;
}

interface StripeElements {
  getElement: (type: string) => StripeCardElement | null;
  create: (type: string, options?: any) => StripeCardElement;
}

// Stripe context
const StripeContext = createContext<{
  stripe: any | null;
  elements: any | null;
}>({
  stripe: null,
  elements: null,
});

// Real loadStripe function that uses the global Stripe object from CDN
export const loadStripe = (apiKey: string): any => {
  if (typeof window === 'undefined' || !window.Stripe) {
    console.error('Stripe.js not loaded. Make sure the script is included in your HTML.');
    return null;
  }
  
  console.log('Loading Stripe with API key:', apiKey);
  return window.Stripe(apiKey);
};

// StripeProvider component
export const StripeProvider: React.FC<{
  children: ReactNode;
  stripe: any | null;
}> & { loadStripe: typeof loadStripe } = ({ children, stripe }) => {
  const [elements, setElements] = useState<any | null>(null);

  useEffect(() => {
    if (stripe) {
      setElements(stripe.elements());
    }
  }, [stripe]);

  return (
    <StripeContext.Provider value={{ stripe, elements }}>
      {children}
    </StripeContext.Provider>
  );
};

// Add loadStripe as a static method
StripeProvider.loadStripe = loadStripe;

// Hook to use Stripe in components
export const useStripe = () => {
  const { stripe } = useContext(StripeContext);
  return stripe;
};

// Hook to use Stripe Elements in components
export const useElements = () => {
  const { elements } = useContext(StripeContext);
  return elements;
};

// CardElement component that uses real Stripe Elements
export const CardElement: React.FC<{
  className?: string;
  options?: any;
}> = ({ className, options }) => {
  const elements = useElements();
  const [mounted, setMounted] = useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elements && elementRef.current && !mounted) {
      const cardElement = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
          ...options?.style,
        },
        ...options,
      });
      
      cardElement.mount(elementRef.current);
      setMounted(true);
      
      return () => {
        cardElement.unmount();
        setMounted(false);
      };
    }
  }, [elements, options, mounted]);

  return (
    <div className={className} ref={elementRef}>
      {!elements && (
        <div className="p-3 border rounded bg-gray-50">
          <p className="text-gray-500">Loading payment form...</p>
        </div>
      )}
    </div>
  );
};
