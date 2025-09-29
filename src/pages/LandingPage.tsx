import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Phone, MessageCircle, TrendingUp, MapPin, Users, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Hero } from '../components/home/Hero';
import { TripStats } from '../components/home/TripStats';
import { TripCard } from '../components/trips/TripCard';
import { InteractiveSearch } from '../components/home/InteractiveSearch';
import { FeaturedDestinations } from '../components/home/FeaturedDestinations';
import { NewsletterSignup } from '../components/home/NewsletterSignup';
import { TestimonialsCarousel } from '../components/home/TestimonialsCarousel';
import { LeadCaptureModal } from '../components/home/LeadCaptureModal';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { toast } from '../components/ui/use-toast';

// Performance monitoring hook
const usePerformanceMonitor = () => {
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        if (currentFps < 50) {
          console.warn(`Performance issue detected: ${currentFps} FPS`);
        }
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    animationFrameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return fps;
};

export default function LandingPage() {
  const fps = usePerformanceMonitor();
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  // Performance-based rendering decisions
  const enableHeavyAnimations = fps >= 50;
  const enableBackgroundAnimations = fps >= 40;

  // Auto-open lead modal after user engagement (scroll or time)
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('leadModalShown');
    if (!hasSeenModal) {
      let scrollTriggered = false;
      
      const handleScroll = () => {
        if (window.scrollY > 800 && !scrollTriggered) { // After hero section
          scrollTriggered = true;
          setIsLeadModalOpen(true);
          localStorage.setItem('leadModalShown', 'true');
          window.removeEventListener('scroll', handleScroll);
        }
      };
      
      // Fallback timer - show after 15 seconds if user hasn't scrolled
      const timer = setTimeout(() => {
        if (!scrollTriggered) {
          setIsLeadModalOpen(true);
          localStorage.setItem('leadModalShown', 'true');
          window.removeEventListener('scroll', handleScroll);
        }
      }, 15000); // 15 seconds fallback
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Fetch featured trips
  const { data: featuredTrips = [] } = useQuery({
    queryKey: ['featured-trips'],
    queryFn: () => apiClient.getTrips({ featured: 'featured,both' }),
  });

  // Safe array handling for featured trips
  const safeFeaturedTrips = useMemo(() => {
    if (!Array.isArray(featuredTrips)) {
      console.warn('Featured trips data is not an array:', featuredTrips);
      return [];
    }
    return featuredTrips;
  }, [featuredTrips]);

  const handleSearch = (query: string) => {
    // In a real app, this would trigger a search
    toast({
      title: "Search Submitted",
      description: `Searching for trips related to "${query}"`,
    });
  };

  const features = [
    {
      title: "Expert Guides",
      description: "Local guides with years of experience and deep knowledge of destinations",
      icon: <CheckCircle className="h-8 w-8 text-primary" />
    },
    {
      title: "Small Groups",
      description: "Maximum 12 travelers per trip for a more personalized experience",
      icon: <Users className="h-8 w-8 text-primary" />
    },
    {
      title: "Safety First",
      description: "Comprehensive safety measures and emergency protocols in place",
      icon: <TrendingUp className="h-8 w-8 text-primary" />
    },
    {
      title: "Best Value",
      description: "Transparent pricing with no hidden costs, best value guaranteed",
      icon: <MapPin className="h-8 w-8 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen">


      {/* Hero Section */}
      <Hero />

      {/* Interactive Search Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Find Your Perfect Adventure
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Discover amazing trips tailored to your interests and travel style
            </motion.p>
          </div>

          <InteractiveSearch onSearch={handleSearch} />
        </div>
      </section>

      {/* Enhanced Trip Stats Section */}
      <TripStats />

      {/* Featured Trips */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Featured Adventures
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Handpicked destinations that offer unforgettable experiences and memories that last a lifetime.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {safeFeaturedTrips.slice(0, 3).map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild className="rounded-full px-8 py-3">
              <Link to="/trips" className="inline-flex items-center">
                View All Trips
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <FeaturedDestinations />

      {/* Features Section - Gamified */}
      <section className="py-20 bg-gradient-to-br from-white via-orange-50/50 to-white relative overflow-hidden">
        {/* Animated Background Elements */}
        {enableBackgroundAnimations && (
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 left-20 w-32 h-32 bg-orange-200/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-20 w-40 h-40 bg-orange-300/15 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg"
            >
              <CheckCircle className="h-8 w-8 text-white" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Why Choose{' '}
              <motion.span
                className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Adventure Buddha
              </motion.span>
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide exceptional travel experiences with unmatched quality and service.
              Discover what makes us the preferred choice for adventure travelers worldwide.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          {/* Interactive Trust Indicators */}
          <motion.div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            {[
              { value: '98%', label: 'Satisfaction Rate', icon: '🎯', color: 'from-green-400 to-green-600' },
              { value: '24/7', label: 'Support Available', icon: '🛟', color: 'from-blue-400 to-blue-600' },
              { value: '50+', label: 'Expert Guides', icon: '👥', color: 'from-purple-400 to-purple-600' },
              { value: '15+', label: 'Years Experience', icon: '🏆', color: 'from-yellow-400 to-yellow-600' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                className="group relative p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Animated Background */}
                {enableHeavyAnimations && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }}
                  />
                )}

                {/* Floating Icon */}
                <motion.div
                  className="text-3xl mb-2 relative"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                >
                  {stat.icon}
                </motion.div>

                {/* Animated Counter */}
                <motion.div
                  className="text-2xl font-bold text-orange-600 mb-1"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 300 }}
                >
                  {stat.value}
                </motion.div>

                <div className="text-gray-600 text-sm font-medium">{stat.label}</div>

                {/* Progress Bar for Visual Appeal */}
                <motion.div
                  className="mt-3 h-1 bg-orange-100 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 1 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.color}`}
                    initial={{ width: "0%" }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 1.5, ease: "easeOut" }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Achievement Badges Section */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">🏆 Recognized Excellence</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { badge: 'TripAdvisor Certificate of Excellence', year: '2023' },
                { badge: 'Best Adventure Travel Company', year: '2022' },
                { badge: 'Customer Choice Award', year: '2021' },
                { badge: 'Sustainable Tourism Leader', year: '2020' }
              ].map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                >
                  {achievement.badge} {achievement.year}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Interactive Feature Demo Section */}
          <motion.div
            className="mt-16 bg-gradient-to-r from-white to-orange-50/50 rounded-3xl p-8 border border-orange-100"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6 }}
          >
            <div className="text-center mb-8">
              <motion.h3
                className="text-2xl font-bold text-gray-900 mb-4"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  backgroundImage: 'linear-gradient(45deg, #FF6B35, #FF8C42, #FFA366)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Experience Our Features in Action
              </motion.h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Click on any feature card above to see interactive demos and real-time previews of how our services work.
              </p>
            </div>

            {/* Mini Demo Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Live Booking System',
                  description: 'Real-time availability and instant confirmation',
                  demo: '🗓️ → ✅',
                  color: 'from-blue-400 to-blue-600'
                },
                {
                  title: 'Expert Guide Matching',
                  description: 'AI-powered guide selection based on your preferences',
                  demo: '🎯 → 👨‍🏫',
                  color: 'from-green-400 to-green-600'
                },
                {
                  title: '24/7 Support Chat',
                  description: 'Instant responses from our travel experts',
                  demo: '💬 → ⚡',
                  color: 'from-purple-400 to-purple-600'
                },
                {
                  title: 'Safety Monitoring',
                  description: 'GPS tracking and emergency response system',
                  demo: '📍 → 🛡️',
                  color: 'from-red-400 to-red-600'
                }
              ].map((demo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.8 + index * 0.1, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">{demo.title}</h4>
                    <motion.div
                      className={`text-2xl bg-gradient-to-r ${demo.color} bg-clip-text text-transparent`}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                      }}
                    >
                      {demo.demo}
                    </motion.div>
                  </div>
                  <p className="text-gray-600 text-sm">{demo.description}</p>
                  <motion.div
                    className={`mt-4 h-2 bg-gradient-to-r ${demo.color} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 2 + index * 0.1, duration: 1 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* Newsletter Signup */}
      <NewsletterSignup />

      {/* Enhanced Lead Capture CTA */}
      <section className="relative py-20 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white overflow-hidden">
        {/* Animated Background Elements */}
        {enableBackgroundAnimations && (
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            {/* Floating Icons */}
            <motion.div
              className="absolute top-20 right-20 text-6xl opacity-10"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✈️
            </motion.div>
            <motion.div
              className="absolute bottom-20 left-20 text-5xl opacity-10"
              animate={{
                y: [0, 15, 0],
                rotate: [0, -15, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              🏔️
            </motion.div>
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <motion.h2
              className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Ready for Your Next Adventure?
            </motion.h2>
            <motion.div
              className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <span className="animate-pulse mr-2">🔥</span>
              Limited Time: 25% Off First Booking
            </motion.div>
          </motion.div>

          {/* Enhanced Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <p className="text-xl md:text-2xl text-orange-100 mb-4 max-w-3xl mx-auto leading-relaxed">
              Join <strong className="text-white">15,000+ adventurers</strong> who trust us for unforgettable experiences.
              Get exclusive access to early bird discounts, insider travel tips, and personalized recommendations.
            </p>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {[
                { value: '15K+', label: 'Happy Travelers', icon: '👥' },
                { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
                { value: '98%', label: 'Satisfaction', icon: '🎯' },
                { value: '24/7', label: 'Support', icon: '🛟' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-orange-200">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-6 justify-center items-center max-w-2xl mx-auto"
          >
            {/* Primary CTA - Open Lead Modal */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 max-w-sm"
            >
              <Button
                size="lg"
                onClick={() => setIsLeadModalOpen(true)}
                className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg py-4 px-8 rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 group flex items-center justify-center gap-3"
              >
                <span>📧 Get Exclusive Travel Updates</span>
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-2xl px-4 py-3 font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <Phone className="h-4 w-4 group-hover:animate-pulse" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">📞 Call Now</span>
                    <span className="text-xs opacity-70 font-normal">Free Consultation</span>
                  </div>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-green-600/20 backdrop-blur-sm border-green-400/50 text-white hover:bg-green-600/30 hover:border-green-400/70 rounded-2xl px-4 py-3 font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <MessageCircle className="h-4 w-4 group-hover:animate-pulse" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">💬 WhatsApp</span>
                    <span className="text-xs opacity-70 font-normal">Instant Reply</span>
                  </div>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Urgency Timer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8"
          >
            <div className="inline-flex items-center bg-red-600/20 backdrop-blur-sm rounded-full px-6 py-3 border border-red-400/30">
              <motion.span
                className="text-red-300 mr-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⏰
              </motion.span>
              <span className="text-white font-medium">
                Offer expires in: <strong className="text-red-300">23:47:12</strong>
              </span>
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-6 opacity-75"
          >
            {[
              '🔒 SSL Secured',
              '🛡️ Safe Payments',
              '📞 24/7 Support',
              '🎯 Verified Reviews',
              '🏆 Award Winning'
            ].map((badge, index) => (
              <motion.span
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                transition={{ duration: 0.2 }}
              >
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onLeadCaptured={(leadData) => {
          console.log('Lead captured:', leadData);
          // You can add additional logic here like analytics tracking
        }}
      />
    </div>
  );
}

interface FeatureCardProps {
  feature: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating Particles */}
      <motion.div
        className="absolute top-4 right-4 w-2 h-2 bg-orange-400 rounded-full"
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: index * 0.2,
        }}
      />
      <motion.div
        className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-orange-500 rounded-full"
        animate={{
          y: [0, 8, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: index * 0.3,
        }}
      />

      <div className="relative z-10">
        {/* Icon with Enhanced Animation */}
        <motion.div
          className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        >
          <motion.div
            animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {feature.icon}
          </motion.div>
        </motion.div>

        {/* Title with Gradient Text */}
        <motion.h3
          className="text-xl font-bold text-gray-900 mb-4 group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-orange-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300"
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
        >
          {feature.title}
        </motion.h3>

        {/* Description */}
        <motion.p
          className="text-gray-600 leading-relaxed"
          animate={isExpanded ? { height: "auto", opacity: 1 } : { height: "auto", opacity: 0.8 }}
        >
          {feature.description}
        </motion.p>

        {/* Interactive Hint */}
        <motion.div
          className="mt-4 flex items-center text-orange-600 text-sm font-medium"
          animate={isHovered ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
        >
          <motion.span
            animate={isHovered ? { rotate: 90 } : { rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            →
          </motion.span>
          <span className="ml-2">Click to explore</span>
        </motion.div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-6 border-t border-orange-100"
            >
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>Verified by 10,000+ travelers</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500 mr-2" />
                  <span>4.9/5 average rating</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                  <span>Trending feature</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}