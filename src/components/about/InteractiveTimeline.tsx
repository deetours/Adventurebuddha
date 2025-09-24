import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, Award } from 'lucide-react';

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details?: string;
  image?: string;
}

export function InteractiveTimeline() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const events: TimelineEvent[] = [
    {
      year: '2009',
      title: 'Founded',
      description: 'Adventure Buddha was born from a passion for authentic travel experiences.',
      icon: Calendar,
      details: 'Started with a small team of 3 passionate travelers organizing trekking expeditions in the Himalayas.',
      image: '/images/founding.jpg'
    },
    {
      year: '2012',
      title: 'First 100 Trips',
      description: 'Reached our first major milestone with 100 successful adventures.',
      icon: MapPin,
      details: 'Expanded our operations to include beach destinations and cultural tours across India.',
      image: '/images/milestone-100.jpg'
    },
    {
      year: '2015',
      title: 'Team Expansion',
      description: 'Grew our team to 20 dedicated adventure specialists.',
      icon: Users,
      details: 'Hired experienced guides and travel experts, establishing our reputation for quality service.',
      image: '/images/team-growth.jpg'
    },
    {
      year: '2018',
      title: 'International Recognition',
      description: 'Received awards for sustainable tourism practices.',
      icon: Award,
      details: 'Recognized by international travel organizations for our commitment to responsible tourism.',
      image: '/images/awards.jpg'
    },
    {
      year: '2021',
      title: 'Digital Transformation',
      description: 'Launched our online booking platform and mobile app.',
      icon: Calendar,
      details: 'Made adventure travel accessible to everyone through technology and user-friendly interfaces.',
      image: '/images/digital-launch.jpg'
    },
    {
      year: '2024',
      title: 'Global Expansion',
      description: 'Expanded to 25+ countries with 50+ unique destinations.',
      icon: MapPin,
      details: 'Now serving over 10,000 happy travelers annually with unforgettable experiences worldwide.',
      image: '/images/global-expansion.jpg'
    }
  ];

  return (
    <section className="py-20 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white opacity-50" />
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From humble beginnings to a global adventure travel leader
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-orange-400 via-orange-500 to-red-500 rounded-full" />

          {events.map((event, index) => (
            <motion.div
              key={event.year}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`flex items-center mb-12 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Content */}
              <div className="w-5/12">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedEvent(selectedEvent === index ? null : index)}
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 cursor-pointer transition-all duration-300 ${
                    selectedEvent === index
                      ? 'border-orange-400 shadow-xl'
                      : 'border-gray-100 hover:border-orange-200 hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <event.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{event.year}</div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-3">{event.description}</p>

                  <AnimatePresence>
                    {selectedEvent === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t pt-3 mt-3"
                      >
                        <p className="text-gray-700 text-sm">{event.details}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-3 text-sm text-orange-600 font-medium">
                    {selectedEvent === index ? 'Click to collapse' : 'Click for details'}
                  </div>
                </motion.div>
              </div>

              {/* Timeline Node */}
              <div className="w-2/12 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="w-4 h-4 bg-orange-500 rounded-full border-4 border-white shadow-lg cursor-pointer"
                  onClick={() => setSelectedEvent(selectedEvent === index ? null : index)}
                />
              </div>

              {/* Spacer */}
              <div className="w-5/12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}