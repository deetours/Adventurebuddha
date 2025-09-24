// ...existing code...
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Toaster } from '../ui/toaster';
import { ErrorBoundary } from '../ui/error-boundary';
import { AdventureChatbot } from '../ui/AdventureChatbot';
import { useState } from 'react';

export function AppShell() {
  const location = useLocation();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get context based on current route
  const getPageContext = () => {
    const path = location.pathname;

    if (path.includes('/trips/') && path.split('/').length > 2) {
      return {
        page: 'trip_details',
        tripId: path.split('/trips/')[1].split('/')[0]
      };
    } else if (path.includes('/book/') && path.includes('/seat-selection')) {
      return {
        page: 'seat_selection',
        slotId: path.split('/book/')[1].split('/')[0]
      };
    } else if (path.includes('/payment')) {
      return {
        page: 'payment',
        bookingId: path.split('/book/')[1].split('/')[0]
      };
    } else if (path.includes('/dashboard')) {
      return { page: 'dashboard' };
    } else if (path.includes('/admin')) {
      return { page: 'admin' };
    } else if (path === '/trips') {
      return { page: 'trips' };
    } else if (path === '/about') {
      return { page: 'about' };
    } else if (path === '/contact') {
      return { page: 'contact' };
    } else if (path === '/help' || path === '/support') {
      return { page: 'support' };
    } else {
      return { page: 'general' };
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ErrorBoundary>
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <Toaster />

        {/* Global Chatbot */}
        <AdventureChatbot
          isOpen={isChatOpen}
          onToggle={() => setIsChatOpen(!isChatOpen)}
          context={getPageContext()}
        />
      </ErrorBoundary>
    </div>
  );
}