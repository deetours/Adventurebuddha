import { lazy } from 'react';

// Lazy load dashboard components for better performance
export const AdminDashboard = lazy(() => import('../components/dashboard/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
export const UserDashboard = lazy(() => import('../components/dashboard/UserDashboard').then(module => ({ default: module.UserDashboard })));

// Lazy load other heavy components
export const TripDetailsPage = lazy(() => import('../pages/TripDetailsPage'));
export const BookingPage = lazy(() => import('../pages/BookingConfirmationPage'));
export const PaymentPage = lazy(() => import('../pages/PaymentPage'));