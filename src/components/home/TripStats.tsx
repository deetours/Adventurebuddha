import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TrendingUp, Users, MapPin, Award, Target, Zap } from 'lucide-react';

interface TripStatsProps {
  className?: string;
}

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  trend: number;
  target: number;
}

export function TripStats({ className }: TripStatsProps) {
  const [stats, setStats] = useState({
    trips: 0,
    travelers: 0,
    countries: 0,
    rating: 4.9
  });

  const [hoveredStat, setHoveredStat] = useState<string | null>(null);

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const statItems: StatItem[] = [
    {
      label: 'Curated Trips',
      value: stats.trips,
      suffix: '+',
      icon: Target,
      color: 'from-orange-500 to-red-500',
      description: 'Handpicked adventures crafted for unforgettable experiences',
      trend: 12,
      target: 200
    },
    {
      label: 'Happy Travelers',
      value: stats.travelers,
      suffix: '+',
      icon: Users,
      color: 'from-blue-500 to-purple-500',
      description: 'Adventurers who found their perfect journey with us',
      trend: 8,
      target: 10000
    },
    {
      label: 'Countries Explored',
      value: stats.countries,
      suffix: '+',
      icon: MapPin,
      color: 'from-green-500 to-teal-500',
      description: 'Destinations across the globe waiting to be discovered',
      trend: 15,
      target: 50
    },
    {
      label: 'Average Rating',
      value: stats.rating,
      suffix: '',
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      description: 'Trusted by travelers worldwide for exceptional service',
      trend: 2,
      target: 5.0
    }
  ];

  useEffect(() => {
    const animateCounter = (target: number, setter: (val: number) => void, duration: number = 2500) => {
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);

        // Enhanced easing function for more natural animation
        const easeOutCubic = 1 - Math.pow(1 - percentage, 3);
        const currentCount = Math.floor(easeOutCubic * target);

        setter(currentCount);

        if (percentage < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    // Stagger the animations with different durations
    setTimeout(() => animateCounter(150, (val) => setStats(prev => ({ ...prev, trips: val })), 2000), 200);
    setTimeout(() => animateCounter(5000, (val) => setStats(prev => ({ ...prev, travelers: val })), 2500), 400);
    setTimeout(() => animateCounter(25, (val) => setStats(prev => ({ ...prev, countries: val })), 2200), 600);
    setTimeout(() => {
      // Special animation for rating
      let rating = 0;
      const ratingInterval = setInterval(() => {
        rating += 0.1;
        if (rating >= 4.9) {
          rating = 4.9;
          clearInterval(ratingInterval);
        }
        setStats(prev => ({ ...prev, rating: Number(rating.toFixed(1)) }));
      }, 50);
    }, 800);
  }, []);

  return (
    <section className={`py-24 bg-gradient-to-br from-white via-orange-50 to-white relative overflow-hidden ${className}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-orange-200/20 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-16 w-24 h-24 bg-orange-300/20 rounded-full blur-lg"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-400/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <motion.div
        style={{ scale, opacity }}
        className="container mx-auto px-4 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-6 shadow-lg"
          >
            <TrendingUp className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Adventure by the{' '}
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
              Numbers
            </motion.span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of travelers who've discovered their perfect adventure with us.
            Every number represents a story, a memory, and a dream fulfilled.
          </p>
        </motion.div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statItems.map((stat, index) => {
            const progressPercentage = (stat.value / stat.target) * 100;
            const isHovered = hoveredStat === stat.label;

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{
                  scale: 1.05,
                  y: -10,
                  transition: { type: "spring", stiffness: 300 }
                }}
                onHoverStart={() => setHoveredStat(stat.label)}
                onHoverEnd={() => setHoveredStat(null)}
                className="group relative cursor-pointer"
              >
                {/* Card Background with Gradient */}
                <div className={`relative bg-gradient-to-br ${stat.color} p-8 rounded-3xl shadow-xl overflow-hidden min-h-[280px] flex flex-col justify-between`}>
                  {/* Animated Background Pattern */}
                  <motion.div
                    className="absolute inset-0 opacity-10"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    style={{
                      backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                      backgroundSize: '50% 50%'
                    }}
                  />

                  {/* Icon with Animation */}
                  <motion.div
                    className="relative z-10 mb-6"
                    animate={isHovered ? {
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <stat.icon className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Main Stat Display */}
                  <div className="relative z-10 mb-4">
                    <motion.div
                      className="text-5xl md:text-6xl font-black text-white mb-2"
                      animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {stat.value}{stat.suffix}
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 rounded-full h-2 mb-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progressPercentage}%` }}
                        viewport={{ once: true }}
                        transition={{
                          delay: index * 0.2 + 0.5,
                          duration: 2,
                          ease: "easeOut"
                        }}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{stat.label}</h3>
                  </div>

                  {/* Trend Indicator */}
                  <motion.div
                    className="relative z-10 flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 1 }}
                  >
                    <div className="flex items-center space-x-2">
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="h-4 w-4 text-white/80" />
                      </motion.div>
                      <span className="text-white/80 text-sm">+{stat.trend}% this month</span>
                    </div>
                  </motion.div>

                  {/* Hover Overlay with Description */}
                  <motion.div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center p-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-center"
                    >
                      <stat.icon className="h-12 w-12 text-white mx-auto mb-4" />
                      <p className="text-white text-sm leading-relaxed">{stat.description}</p>
                      <motion.div
                        className="mt-4 text-xs text-white/80"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Click to explore more
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Floating Trend Badge */}
                <motion.div
                  className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg border-2 border-orange-200"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Summary Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-orange-200"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Award className="h-6 w-6 text-orange-600" />
            </motion.div>
            <span className="text-gray-800 font-semibold">
              Trusted by {stats.travelers.toLocaleString()}+ adventurers worldwide
            </span>
          </motion.div>

          <motion.p
            className="text-gray-600 mt-6 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
          >
            Every statistic represents a unique story of discovery, connection, and unforgettable experiences.
            Your adventure awaits.
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}