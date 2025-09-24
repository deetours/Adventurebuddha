import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Suspense, lazy } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ChainPromptingProvider } from './contexts/ChainPromptingContext';

// Lazy load heavy components for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const TripsPage = lazy(() => import('./pages/TripsPage'));
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage'));
const SeatSelectionPage = lazy(() => import('./pages/SeatSelectionPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const BookingConfirmationPage = lazy(() => import('./pages/BookingConfirmationPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
import { config } from './lib/config';

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
        <Router>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
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
          </Suspense>
        </Router>
        {!config.STORYBOOK_MODE && <ReactQueryDevtools initialIsOpen={false} />}
      </ChainPromptingProvider>
    </QueryClientProvider>
  );
}

export default App;