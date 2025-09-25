import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from './components/layout/AppShell';
import { ChainPromptingProvider } from './contexts/ChainPromptingContext';
import { AuthProvider } from './contexts/AuthContext';

// Import all components directly for instant loading
import LandingPage from './pages/LandingPage';
import TripsPage from './pages/TripsPage';
import TripDetailsPage from './pages/TripDetailsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import HelpPage from './pages/HelpPage';
import ContactPage from './pages/ContactPage';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import SupportPage from './pages/SupportPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChainPromptingProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<AppShell />}>
                <Route index element={<LandingPage />} />
                <Route path="trips" element={<TripsPage />} />
                <Route path="trips/:id" element={<TripDetailsPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="blog/:id" element={<BlogPostPage />} />
                <Route path="terms" element={<TermsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="refund" element={<RefundPage />} />
                <Route path="help" element={<HelpPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="auth">
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="google/callback" element={<GoogleCallbackPage />} />
                </Route>
                <Route path="home" element={<DashboardPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="dashboard/bookings" element={<BookingsPage />} />
                <Route path="dashboard/profile" element={<ProfilePage />} />
                <Route path="dashboard/settings" element={<SettingsPage />} />
                <Route path="book/:slotId/seat-selection" element={<SeatSelectionPage />} />
                <Route path="book/:bookingId/payment" element={<PaymentPage />} />
                <Route path="book/:bookingId/confirmation" element={<BookingConfirmationPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ChainPromptingProvider>
    </QueryClientProvider>
  );
}

export default App;