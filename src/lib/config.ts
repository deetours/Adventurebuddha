export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://68.233.115.38:8000/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://68.233.115.38:8000/ws',
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_key',
  USE_MOCK_API: false, // Use real API
  STORYBOOK_MODE: import.meta.env.STORYBOOK === 'true',
  // Fallback URLs for when VM is down
  FALLBACK_API_URL: 'http://127.0.0.1:3001/api',
} as const;

export const routes = {
  home: '/',
  trips: '/trips',
  tripDetails: '/trips/:slug',
  seatSelection: '/book/:slotId/seat-selection',
  payment: '/book/:bookingId/payment',
  confirmation: '/book/:bookingId/confirmation',
  login: '/auth/login',
  signup: '/auth/signup',
  dashboard: '/dashboard',
  bookings: '/dashboard/bookings',
  admin: '/admin',
  support: '/support',
} as const;