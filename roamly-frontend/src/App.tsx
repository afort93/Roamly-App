import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ItineraryPage from './pages/ItineraryPage';
import AccountPage from './pages/AccountPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useAuthStore } from './store/authStore';

function App() {
  const loadFromStorage = useAuthStore(state => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/itinerary/:zip" element={<ItineraryPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal />
      </div>
    </Router>
  );
}

export default App;
