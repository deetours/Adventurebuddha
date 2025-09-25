import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { Button } from '../ui/button';
import PerformanceMonitor from '../ui/PerformanceMonitor';

// Lazy load heavy components for better performance
const FloatingElementsSystem = lazy(() => import('./FloatingElementsSystem'));
const DestinationOrbs = lazy(() => import('./DestinationOrbs'));
const OrangeParticleSystem = lazy(() => import('./OrangeParticleSystem'));
// const MorphingCTAButtons = lazy(() => import('./MorphingCTAButtons'));
import MorphingCTAButtons from './MorphingCTAButtons';

export function Hero() {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [stats, setStats] = useState({
    travelers: 0,
    destinations: 0,
    experience: 0,
    rating: 4.9
  });

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Performance-optimized animated counters
  useEffect(() => {
    if (prefersReducedMotion) {
      // Skip animations for users who prefer reduced motion
      setStats({
        travelers: 10000,
        destinations: 50,
        experience: 15,
        rating: 4.9
      });
      return;
    }

    const animateCounter = (target: number, setter: (val: number) => void, duration: number = 2000) => {
      let startTime: number | null = null;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Optimized easing function
        const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
        const currentCount = Math.floor(easeOutCubic * target);

        setter(currentCount);

        if (percentage < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    };

    // Stagger animations for performance
    const timeouts = [
      setTimeout(() => animateCounter(10000, (val) => setStats(prev => ({ ...prev, travelers: val })), 1800), 500),
      setTimeout(() => animateCounter(50, (val) => setStats(prev => ({ ...prev, destinations: val })), 1600), 800),
      setTimeout(() => animateCounter(15, (val) => setStats(prev => ({ ...prev, experience: val })), 1400), 1100)
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [prefersReducedMotion]);

  const statsData = [
    { label: 'Happy Travelers', value: `${stats.travelers.toLocaleString()}+` },
    { label: 'Destinations', value: `${stats.destinations}+` },
    { label: 'Years Experience', value: `${stats.experience}` },
    { label: 'Customer Rating', value: `${stats.rating}`, icon: Star },
  ];

  return (
    <PerformanceMonitor onPerformanceIssue={(fps) => console.warn(`Performance issue: ${fps} FPS`)}>
      <section className="relative min-h-screen flex items-center justify-center bg-white">
        {/* Performance-optimized background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-orange-50 to-white" />

        {/* Layered interactive systems - ordered by z-index for performance */}
        <Suspense fallback={<div />}>
          <OrangeParticleSystem />
        </Suspense>
        <Suspense fallback={<div />}>
          <DestinationOrbs />
        </Suspense>
        <Suspense fallback={<div />}>
          <FloatingElementsSystem />
        </Suspense>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto">
          {/* Revolutionary hero content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl sm:text-7xl lg:text-8xl font-black leading-tight mb-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.3
                  }
                }
              }}
            >
              {["Discover", "Your", "Next"].map((word) => (
                <motion.span
                  key={word}
                  className="inline-block mr-4"
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 120,
                        damping: 20
                      }
                    }
                  }}
                  style={{ willChange: 'transform' }}
                >
                  {word === "Next" ? (
                    <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
                      {word}
                    </span>
                  ) : word}
                </motion.span>
              ))}
              <motion.span
                className="block bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
                style={{ willChange: 'transform' }}
              >
                Adventure
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              From breathtaking mountain treks to serene beach getaways,
              embark on carefully curated journeys that create{' '}
              <motion.span
                className="text-orange-600 font-semibold"
                animate={prefersReducedMotion ? {} : {
                  color: ['#ea580c', '#dc2626', '#ea580c'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                memories for a lifetime
              </motion.span>
              .
            </motion.p>

            {/* Revolutionary morphing CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mb-12"
            >
              <MorphingCTAButtons />
            </motion.div>

            {/* Legacy video button for compatibility */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.8 }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVideoPlaying(true)}
                className="text-xl px-10 py-4 border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-bold rounded-full shadow-xl transition-all duration-300"
              >
                <Play className="mr-3 h-6 w-6" />
                Watch Story
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced stats with optimized effects */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t-2 border-orange-200"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 2.5 + index * 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 25
                }}
                whileHover={prefersReducedMotion ? {} : {
                  scale: 1.05,
                  y: -5
                }}
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-300 cursor-pointer transform-gpu"
                style={{ willChange: 'transform' }}
              >
                <motion.div
                  className="flex items-center justify-center mb-3"
                  whileHover={prefersReducedMotion ? {} : { rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                  style={{ willChange: 'transform' }}
                >
                  <span className="text-3xl sm:text-4xl font-black text-orange-500">
                    {stat.value}
                  </span>
                  {stat.icon && (
                    <stat.icon className="h-6 w-6 text-orange-400 ml-2 fill-current" />
                  )}
                </motion.div>
                <p className="text-gray-600 text-sm sm:text-base font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Enhanced Video Modal */}
      {videoPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setVideoPlaying(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white p-8 rounded-3xl max-w-2xl mx-4 relative shadow-2xl border-2 border-orange-200 transform-gpu"
            onClick={(e) => e.stopPropagation()}
            style={{ willChange: 'transform' }}
          >
            <motion.button
              onClick={() => setVideoPlaying(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-orange-500 transition-colors"
              whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{ willChange: 'transform' }}
            >
              ✕
            </motion.button>
            <motion.h3
              className="text-2xl font-bold mb-6 text-center text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Our Adventure Story
            </motion.h3>
            <motion.div
              className="aspect-video bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                animate={prefersReducedMotion ? {} : {
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ willChange: 'transform' }}
              >
                <Play className="w-20 h-20 text-orange-500" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent" />
            </motion.div>
            <motion.p
              className="text-gray-600 mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Experience the magic of Adventure Buddha through our lens.
              Watch real travelers embark on life-changing journeys.
            </motion.p>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => setVideoPlaying(false)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold"
              >
                Close & Explore
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </section>
    </PerformanceMonitor>
  );
}