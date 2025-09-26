export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://your-backend-api.com/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'wss://your-backend-api.com/ws',
  RAZORPAY_KEY: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_key',
  USE_MOCK_API: import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.DEV,
  STORYBOOK_MODE: import.meta.env.STORYBOOK === 'true',
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