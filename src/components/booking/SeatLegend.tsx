import { motion } from 'framer-motion';
import { Crown, Star, Zap, Check, X, Clock, Ban } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SeatLegendProps {
  className?: string;
}

export function SeatLegend({ className }: SeatLegendProps) {
  const legendItems = [
    {
      status: 'available',
      label: 'Available',
      description: 'Ready to book',
      icon: Check,
      colors: 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-green-800',
      glow: 'shadow-green-500/20'
    },
    {
      status: 'selected',
      label: 'Your Selection',
      description: 'Seats you chose',
      icon: Check,
      colors: 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 text-white',
      glow: 'shadow-orange-500/50'
    },
    {
      status: 'locked',
      label: 'Temporarily Held',
      description: 'Someone else is booking',
      icon: Clock,
      colors: 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-300 text-white',
      glow: 'shadow-yellow-500/50'
    },
    {
      status: 'booked',
      label: 'Already Booked',
      description: 'Not available',
      icon: X,
      colors: 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white',
      glow: 'shadow-red-500/50'
    },
    {
      status: 'blocked',
      label: 'Not Available',
      description: 'Out of service',
      icon: Ban,
      colors: 'bg-gradient-to-br from-gray-600 to-gray-700 border-gray-500 text-white',
      glow: 'shadow-gray-500/50'
    }
  ];

  const categoryItems = [
    {
      category: 'premium',
      label: 'Premium',
      description: 'Extra legroom & priority',
      icon: Crown,
      colors: 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-purple-800',
      glow: 'shadow-purple-500/20'
    },
    {
      category: 'standard',
      label: 'Standard',
      description: 'Window seats available',
      icon: Star,
      colors: 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-blue-800',
      glow: 'shadow-blue-500/20'
    },
    {
      category: 'budget',
      label: 'Budget',
      description: 'Economy seating',
      icon: Zap,
      colors: 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-green-800',
      glow: 'shadow-green-500/20'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-6", className)}
    >
      {/* Seat Status Legend */}
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-6 border border-orange-100 shadow-lg">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-bold text-gray-900 mb-4 flex items-center"
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse" />
          Seat Availability
        </motion.h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {legendItems.map((item, index) => (
            <motion.div
              key={item.status}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-200">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center shadow-lg",
                    item.colors,
                    item.glow
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm group-hover:text-orange-600 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.description}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seat Categories */}
      <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-6 border border-orange-100 shadow-lg">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg font-bold text-gray-900 mb-4 flex items-center"
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse" />
          Seat Categories
        </motion.h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categoryItems.map((item, index) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="group"
            >
              <div className="text-center p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-white/20 hover:bg-white/80 transition-all duration-200">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className={cn(
                    "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg border-2",
                    item.colors,
                    item.glow
                  )}
                >
                  <item.icon className="h-6 w-6" />
                </motion.div>

                <div className="font-bold text-gray-900 text-sm mb-1 group-hover:text-orange-600 transition-colors">
                  {item.label}
                </div>
                <div className="text-xs text-gray-600 leading-tight">
                  {item.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Tips */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg"
      >
        <div className="flex items-center space-x-2 mb-2">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💡
          </motion.div>
          <span className="font-bold text-sm">Pro Tips</span>
        </div>
        <ul className="text-xs space-y-1 opacity-90">
          <li>• Hover over seats to see details and pricing</li>
          <li>• Premium seats offer extra comfort and priority</li>
          <li>• Window seats provide stunning mountain views</li>
          <li>• Seats are held for 5 minutes after selection</li>
        </ul>
      </motion.div>
    </motion.div>
  );
}