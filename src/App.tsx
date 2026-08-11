import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Collections } from './pages/Collections';
import { ProductDetails } from './pages/ProductDetails';
import { Bag } from './pages/Bag';
import { Admin } from './pages/Admin';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/bag" element={<Bag />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
