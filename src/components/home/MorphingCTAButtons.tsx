import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MapPin, Calendar, Users } from 'lucide-react';
import BookNowModal from '../modals/BookNowModal';

const MorphingCTAButtons: React.FC = () => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const buttons = [
    {
      id: 'explore',
      text: 'Explore Destinations',
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'from-orange-600 to-orange-700',
      features: ['200+ Destinations', 'Local Guides', 'Authentic Experiences']
    },
    {
      id: 'book',
      text: 'Book Your Trip',
      icon: Calendar,
      color: 'from-orange-400 to-orange-500',
      hoverColor: 'from-orange-500 to-orange-600',
      features: ['Instant Booking', 'Best Prices', 'Flexible Dates']
    },
    {
      id: 'join',
      text: 'Join Community',
      icon: Users,
      color: 'from-orange-600 to-orange-700',
      hoverColor: 'from-orange-700 to-orange-800',
      features: ['Travel Stories', 'Photo Sharing', 'Adventure Groups']
    }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {buttons.map((button) => {
          const Icon = button.icon;
          const isHovered = hoveredButton === button.id;

          return (
            <motion.button
              key={button.id}
              className={`relative px-8 py-4 rounded-full font-bold text-white overflow-hidden shadow-lg ${
                isHovered ? 'shadow-2xl' : 'shadow-lg'
              }`}
              onMouseEnter={() => setHoveredButton(button.id)}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (button.id === 'book') {
                  setShowBookingModal(true);
                  return;
                }
                if (button.id === 'explore') {
                  // Smooth scroll to featured destinations section
                  const el = document.getElementById('featured-destinations');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    // Fallback navigate if section not on this page
                    if (window.location.pathname !== '/trips') {
                      window.location.href = '/trips';
                    }
                  }
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Background gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${button.color}`}
                animate={{
                  background: isHovered
                    ? `linear-gradient(to right, ${button.hoverColor.split(' ')[0]}, ${button.hoverColor.split(' ')[1]})`
                    : `linear-gradient(to right, ${button.color.split(' ')[0]}, ${button.color.split(' ')[1]})`
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Morphing background shape */}
              <motion.div
                className="absolute inset-0 bg-white opacity-10 rounded-full"
                animate={{
                  scale: isHovered ? [1, 1.2, 1] : 1,
                  rotate: isHovered ? [0, 180, 360] : 0
                }}
                transition={{
                  duration: 2,
                  repeat: isHovered ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />

              {/* Button content */}
              <div className="relative flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: isHovered ? 360 : 0,
                    scale: isHovered ? 1.2 : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon size={20} />
                </motion.div>

                <span className="text-lg">{button.text}</span>

                <motion.div
                  animate={{
                    x: isHovered ? 5 : 0,
                    opacity: isHovered ? 1 : 0.7
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </div>

              {/* Expanding feature reveal */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl p-3 z-10"
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-gray-800 text-sm space-y-1">
                      {button.features.map((feature, index) => (
                        <motion.div
                          key={feature}
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          <span>{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Ripple effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-white opacity-0"
                animate={isHovered ? {
                  scale: [1, 2],
                  opacity: [0.3, 0]
                } : {}}
                transition={{
                  duration: 0.6,
                  repeat: isHovered ? Infinity : 0,
                  repeatDelay: 1
                }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Book Now Modal */}
      <BookNowModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
};

export default MorphingCTAButtons;