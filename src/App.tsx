import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/mongo-auth-context';
import Header from './components/layout/header';
import Footer from './components/layout/footer';
import HomePage from './pages/home-page';
import ShopPage from './pages/shop-page';
import LoginPage from './pages/auth/login';
import SignUpPage from './pages/auth/signup';
import AdminDashboard from './pages/admin/dashboard';
import ProductDetail from './pages/product-detail';
import CheckoutPage from './pages/checkout-page';
import OrderConfirmation from './pages/order-confirmation';
import { StripeProvider } from '@/lib/stripe-mock';

const stripePromise = StripeProvider.loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <StripeProvider stripe={stripePromise}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route
                  path="/admin/*"
                  element={
                    <PrivateRoute adminOnly>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </StripeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;