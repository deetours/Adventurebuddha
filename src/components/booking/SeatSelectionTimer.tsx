import { useEffect, useState } from 'react';
import { AlertTriangle, Zap, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '../../stores/bookingStore';
import { apiClient } from '../../lib/api';

export function SeatSelectionTimer() {
  const { lockToken, lockExpiry, clearLockToken } = useBookingStore();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!lockExpiry) {
      setTimeLeft(0);
      setIsWarning(false);
      setIsCritical(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(lockExpiry).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));

      setTimeLeft(remaining);
      setIsWarning(remaining <= 60); // Last minute warning
      setIsCritical(remaining <= 30); // Last 30 seconds critical

      if (remaining === 0 && lockToken) {
        // Auto-unlock seats when timer expires
        apiClient.unlockSeats(lockToken).catch(console.error);
        clearLockToken();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockExpiry, lockToken, clearLockToken]);

  if (!lockToken || timeLeft === 0) {
    return null;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = (timeLeft / 300) * 100; // Assuming 5min = 300s total

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className={`relative overflow-hidden rounded-2xl shadow-2xl border-2 ${
        isCritical
          ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-400'
          : isWarning
          ? 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400'
          : 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="w-full h-full opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            backgroundSize: '50% 50%',
          }}
        />
      </div>

      {/* Pulsing Border Effect */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border-4 border-red-300"
          />
        )}
      </AnimatePresence>

      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={isCritical ? { scale: [1, 1.2, 1] } : { rotate: 360 }}
              transition={{
                duration: isCritical ? 0.3 : 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`flex-shrink-0 ${
                isCritical ? 'text-red-200' : isWarning ? 'text-orange-200' : 'text-blue-200'
              }`}
            >
              {isCritical ? (
                <Zap className="h-6 w-6" />
              ) : isWarning ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <Timer className="h-6 w-6" />
              )}
            </motion.div>

            <div>
              <div className="text-lg font-bold">
                {isCritical ? 'CRITICAL: Time Running Out!' : 'Seats Reserved For You'}
              </div>
              <div className="text-sm opacity-90">
                {isCritical
                  ? 'Complete booking immediately!'
                  : isWarning
                  ? 'Hurry! Your seats will be released soon'
                  : 'Your selected seats are safely held'
                }
              </div>
            </div>
          </div>

          {/* Digital Timer Display */}
          <motion.div
            animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
            className="text-right"
          >
            <div className="text-3xl font-bold tabular-nums font-mono bg-white/20 rounded-lg px-3 py-1 backdrop-blur-sm">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs opacity-80 mt-1">remaining</div>
          </motion.div>
        </div>

        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <motion.div
              className={`h-full rounded-full ${
                isCritical
                  ? 'bg-gradient-to-r from-red-300 to-red-400'
                  : isWarning
                  ? 'bg-gradient-to-r from-orange-300 to-orange-400'
                  : 'bg-gradient-to-r from-blue-300 to-blue-400'
              }`}
              initial={{ width: "100%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {/* Animated Progress Indicator */}
            <motion.div
              className="absolute top-0 h-full w-1 bg-white rounded-full"
              animate={{ x: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Progress Markers */}
          <div className="flex justify-between mt-2 text-xs opacity-70">
            <span>5:00</span>
            <span>2:30</span>
            <span>0:00</span>
          </div>
        </div>

        {/* Critical Warning Message */}
        <AnimatePresence>
          {isCritical && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-red-600/50 rounded-lg border border-red-400/50 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <AlertTriangle className="h-4 w-4 text-red-200" />
                </motion.div>
                <span className="text-sm font-bold text-red-100">
                  ⚠️ CRITICAL: Your seats will be released in {timeLeft} seconds!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning Message */}
        {isWarning && !isCritical && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-orange-600/50 rounded-lg border border-orange-400/50 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-200" />
              <span className="text-sm font-bold text-orange-100">
                ⏰ Only {timeLeft} seconds left! Complete your booking now.
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Particles Effect */}
      <AnimatePresence>
        {isCritical && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
                className="absolute w-2 h-2 bg-red-300 rounded-full"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}