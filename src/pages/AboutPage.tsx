import { MapPin, Users, Award, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { VideoBackground } from '../components/about/VideoBackground';
import { InteractiveTimeline } from '../components/about/InteractiveTimeline';
import { EnhancedTeamSection } from '../components/about/EnhancedTeamSection';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';

export default function AboutPage() {
  const [currentStat, setCurrentStat] = useState(0);
  const [showInteractiveDemo, setShowInteractiveDemo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  const stats = [
    { label: 'Years of Experience', value: '15+', icon: Award, color: 'from-orange-400 to-orange-600', emoji: '🏆' },
    { label: 'Destinations', value: '50+', icon: MapPin, color: 'from-orange-500 to-orange-700', emoji: '🗺️' },
    { label: 'Happy Travelers', value: '10,000+', icon: Users, color: 'from-orange-600 to-orange-800', emoji: '😊' },
    { label: 'Team Members', value: '50+', icon: Heart, color: 'from-orange-300 to-orange-500', emoji: '❤️' },
  ];

  const values = [
    {
      title: 'Adventure',
      description: 'We believe in pushing boundaries and discovering new horizons.',
      icon: MapPin,
    },
    {
      title: 'Sustainability',
      description: 'Committed to responsible travel that preserves our planet.',
      icon: Heart,
    },
    {
      title: 'Community',
      description: 'Building connections between travelers and local communities.',
      icon: Users,
    },
    {
      title: 'Excellence',
      description: 'Delivering exceptional experiences with attention to detail.',
      icon: Award,
    },
  ];

  // Chain prompting enhanced content - temporarily disabled until real API integration
  const enhancedStory = `Founded in 2019 by a group of passionate travelers, Adventure Buddha began with a simple mission: to create meaningful travel experiences that connect people with the world around them.

What started as a small team organizing trekking expeditions in the Himalayas has grown into a leading adventure travel company, curating transformative journeys across India and beyond.

Today, we're proud to have served over 10,000 travelers, creating memories that last a lifetime and fostering a community of adventure seekers who share our passion for exploration and discovery.`;

  return (
    <div ref={containerRef} className="min-h-screen bg-white overflow-hidden">
      {/* Enhanced Video Background Hero */}
      <VideoBackground
        videoSrcs={[
          "https://cdn.pixabay.com/video/2023/02/25/152203-802335648_large.mp4",
          "https://cdn.pixabay.com/video/2024/05/31/214618_large.mp4",
          "https://cdn.pixabay.com/video/2023/08/06/174860-852215326_large.mp4",
          "https://cdn.pixabay.com/video/2023/04/10/158229-816359520_large.mp4"
        ]}
        posterSrc="/images/about-hero-poster.jpg"
        title="About Adventure Buddha"
        subtitle="Founded in 2018 by a group of passionate travelers, Adventure Buddha began with a simple mission"
        ctaText="Explore Our Story"
        onCtaClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Interactive Story Section with Parallax */}
      <motion.div
        id="story"
        className="relative py-24 bg-gradient-to-br from-white via-orange-50/30 to-white"
        style={{ y }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-64 h-64 bg-orange-200/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/5 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Enhanced Story Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <motion.div
                  className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Our Story
                </motion.div>

                <motion.h2
                  className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  From Dream to{' '}
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
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    Reality
                  </motion.span>
                </motion.h2>

                <motion.p
                  className="text-xl text-gray-700 leading-relaxed mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  {enhancedStory as string}
                </motion.p>

                {/* Interactive Story Highlights */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  {[
                    { icon: '🌟', text: '15+ Years', subtext: 'of Excellence' },
                    { icon: '🎯', text: '10K+', subtext: 'Happy Travelers' },
                    { icon: '🏔️', text: '50+', subtext: 'Destinations' },
                    { icon: '👥', text: '50+', subtext: 'Team Members' }
                  ].map((highlight, index) => (
                    <motion.div
                      key={index}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-orange-100 hover:border-orange-200 transition-all duration-300 cursor-pointer group"
                      whileHover={{ scale: 1.05, y: -2 }}
                      onClick={() => setShowInteractiveDemo(!showInteractiveDemo)}
                    >
                      <div className="text-2xl mb-2 group-hover:animate-bounce">{highlight.icon}</div>
                      <div className="font-bold text-gray-900">{highlight.text}</div>
                      <div className="text-sm text-gray-600">{highlight.subtext}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Interactive Visual Element */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="relative bg-gradient-to-br from-orange-100 to-orange-200 rounded-3xl p-8 shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <motion.div
                    className="absolute top-4 right-4 w-16 h-16 bg-orange-400 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute bottom-4 left-4 w-12 h-12 bg-orange-500 rounded-full"
                    animate={{
                      scale: [1.2, 1, 1.2],
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                </div>

                {/* Interactive Journey Map */}
                <div className="relative z-10">
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-6 text-center"
                    animate={{
                      color: ['#1f2937', '#ea580c', '#1f2937'],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Our Journey Map
                  </motion.h3>

                  <div className="space-y-4">
                    {[
                      { year: '2018', event: 'Founded', status: 'completed' },
                      { year: '2020', event: '100 Trips', status: 'completed' },
                      { year: '2021', event: 'Team Growth', status: 'completed' },
                      { year: '2023', event: 'Recognition', status: 'completed' },
                      { year: '2024', event: 'Digital Era', status: 'completed' },
                      { year: '2025', event: 'Global Reach', status: 'active' }
                    ].map((milestone, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                          milestone.status === 'active'
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                        whileHover={{ scale: 1.02, x: 5 }}
                        onClick={() => setCurrentStat(index)}
                      >
                        <motion.div
                          className={`w-3 h-3 rounded-full ${
                            milestone.status === 'active' ? 'bg-white' : 'bg-orange-500'
                          }`}
                          animate={milestone.status === 'active' ? {
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.7, 1],
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <div className="flex-1">
                          <div className={`font-semibold ${milestone.status === 'active' ? 'text-white' : 'text-gray-900'}`}>
                            {milestone.year}
                          </div>
                          <div className={`text-sm ${milestone.status === 'active' ? 'text-orange-100' : 'text-gray-600'}`}>
                            {milestone.event}
                          </div>
                        </div>
                        {milestone.status === 'active' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            ✨
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Interactive Timeline */}
      <InteractiveTimeline />

      {/* Gamified Stats Section */}
      <motion.section
        className="py-24 bg-gradient-to-r from-orange-50 to-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
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
              By The Numbers
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our journey told through the experiences we've created and the lives we've touched.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden">
                  {/* Animated Background */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />

                  {/* Floating Emoji */}
                  <motion.div
                    className="text-4xl mb-4 text-center"
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    {stat.emoji}
                  </motion.div>

                  {/* Icon */}
                  <motion.div
                    className="flex justify-center mb-4"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="p-3 bg-orange-100 rounded-2xl group-hover:bg-orange-200 transition-colors duration-300">
                      <stat.icon className="h-8 w-8 text-orange-600" />
                    </div>
                  </motion.div>

                  {/* Value */}
                  <motion.div
                    className="text-3xl font-black text-gray-900 text-center mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 300 }}
                  >
                    {stat.value}
                  </motion.div>

                  <div className="text-gray-600 text-center font-medium">{stat.label}</div>

                  {/* Progress Indicator */}
                  <motion.div
                    className="mt-4 h-2 bg-orange-100 rounded-full overflow-hidden"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 1.5 }}
                  >
                    <motion.div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 + index * 0.1, duration: 2 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Values Section */}
      <motion.section
        className="py-24 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6"
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
              Our Core Values
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide every decision we make and every adventure we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-8 shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden h-full">
                  {/* Animated Background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />

                  {/* Icon with Enhanced Animation */}
                  <motion.div
                    className="relative mb-6"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg mx-auto"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <value.icon className="h-10 w-10 text-white" />
                    </motion.div>

                    {/* Floating Particles */}
                    <motion.div
                      className="absolute -top-2 -right-2 w-4 h-4 bg-orange-400 rounded-full"
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    />
                    <motion.div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-orange-500 rounded-full"
                      animate={{
                        y: [0, 6, 0],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.4,
                      }}
                    />
                  </motion.div>

                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-orange-600 transition-colors duration-300"
                    animate={index === currentStat ? { scale: 1.05 } : { scale: 1 }}
                  >
                    {value.title}
                  </motion.h3>

                  <motion.p
                    className="text-gray-600 leading-relaxed text-center"
                    animate={index === currentStat ? { opacity: 1 } : { opacity: 0.8 }}
                  >
                    {value.description}
                  </motion.p>

                  {/* Interactive Element */}
                  <motion.div
                    className="mt-6 flex justify-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center cursor-pointer group-hover:bg-orange-200 transition-colors duration-300"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStat(index)}
                    >
                      <motion.div
                        animate={index === currentStat ? { rotate: 180 } : { rotate: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        →
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Team Section */}
      <EnhancedTeamSection />

      {/* Interactive CTA Section */}
      <motion.section
        className="relative py-24 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {/* Animated Background Elements */}
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
          {/* Floating Adventure Icons */}
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
            🏔️
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
            ✈️
          </motion.div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-orange-100 to-white bg-clip-text text-transparent"
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
              Ready for Your Adventure?
            </motion.h2>

            <motion.p
              className="text-xl md:text-2xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Join <strong className="text-white">10,000+ adventurers</strong> who have discovered the world with us.
              Your next unforgettable journey awaits.
            </motion.p>

            {/* Interactive CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-orange-50 font-bold text-lg py-4 px-8 rounded-2xl shadow-2xl hover:shadow-white/25 transition-all duration-300 group"
                >
                  <span>🚀 Start Your Journey</span>
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-2xl px-6 py-4 font-medium transition-all duration-300"
                >
                  📞 Speak to an Expert
                </Button>
              </motion.div>
            </motion.div>

            {/* Interactive Trust Indicators */}
            <motion.div
              className="mt-12 flex flex-wrap justify-center gap-6 opacity-75"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {[
                '🔒 Secure Booking',
                '🛡️ Expert Guides',
                '⭐ 4.9/5 Rating',
                '🌍 Global Reach',
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
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}