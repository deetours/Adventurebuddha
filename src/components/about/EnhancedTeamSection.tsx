import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Twitter, Award, Users } from 'lucide-react';
import { Button } from '../ui/button';

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  expertise: string[];
  experience: string;
  social: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  achievements: string[];
}

export function EnhancedTeamSection() {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Akshay TR',
      position: 'Founder & CEO',
      bio: 'Passionate mountaineer with 20+ years of adventure travel experience. Led expeditions across 7 continents.',
      image: '/akshay.jpeg',
      expertise: ['Mountain Trekking', 'Expedition Leadership', 'Risk Management'],
      experience: '20+ years',
      social: {
        linkedin: 'https://linkedin.com/in/rajesh-kumar',
        email: 'rajesh@adventurebuddhha.com'
      },
      achievements: ['Led 500+ expeditions', 'National Geographic Explorer', 'Adventure Travel Hall of Fame']
    },
    {
      id: 2,
      name: 'Priya Sharma',
      position: 'Head of Operations',
      bio: 'Expert in sustainable tourism and cultural immersion experiences. Ensures every trip is perfectly orchestrated.',
      image: '/images/team/priya.jpg',
      expertise: ['Cultural Tourism', 'Sustainable Travel', 'Operations Management'],
      experience: '15+ years',
      social: {
        linkedin: 'https://linkedin.com/in/priya-sharma',
        twitter: 'https://twitter.com/priya_travels',
        email: 'priya@adventurebuddhha.com'
      },
      achievements: ['Green Tourism Award', 'Operations Excellence', '100% Client Satisfaction']
    },
    {
      id: 3,
      name: 'Arjun Patel',
      position: 'Lead Guide',
      bio: 'Master trekker and wilderness expert. Guides our most challenging Himalayan expeditions.',
      image: '/images/team/arjun.jpg',
      expertise: ['High Altitude Trekking', 'Wilderness Survival', 'Local Culture'],
      experience: '18+ years',
      social: {
        linkedin: 'https://linkedin.com/in/arjun-patel',
        email: 'arjun@adventurebuddhha.com'
      },
      achievements: ['Everest Base Camp 50+ times', 'Search & Rescue Certified', 'Mountain Guide Certification']
    },
    {
      id: 4,
      name: 'Maya Singh',
      position: 'Customer Experience Manager',
      bio: 'Dedicated to creating magical experiences for every traveler. Expert in personalized journey planning.',
      image: '/images/team/maya.jpg',
      expertise: ['Customer Service', 'Personalized Travel', 'Experience Design'],
      experience: '12+ years',
      social: {
        linkedin: 'https://linkedin.com/in/maya-singh',
        twitter: 'https://twitter.com/maya_adventures',
        email: 'maya@adventurebuddhha.com'
      },
      achievements: ['TripAdvisor Excellence Award', 'Customer Service Champion', '5-Star Reviews']
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Passionate adventurers dedicated to creating unforgettable experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
              onHoverStart={() => setHoveredMember(member.id)}
              onHoverEnd={() => setHoveredMember(null)}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=256&background=orange&color=white`;
                    }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Social Links */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: hoveredMember === member.id ? 1 : 0,
                      y: hoveredMember === member.id ? 0 : 20
                    }}
                    className="absolute bottom-4 left-4 flex space-x-2"
                  >
                    {member.social.linkedin && (
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                        <Linkedin className="w-4 h-4" />
                      </Button>
                    )}
                    {member.social.twitter && (
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                        <Twitter className="w-4 h-4" />
                      </Button>
                    )}
                    {member.social.email && (
                      <Button size="sm" variant="secondary" className="w-8 h-8 p-0 bg-white/90 hover:bg-white">
                        <Mail className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-orange-600 font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{member.bio}</p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.expertise.slice(0, 2).map((skill) => (
                      <span
                        key={skill}
                        className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      {member.experience}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {member.achievements.length} awards
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details Modal */}
              {hoveredMember === member.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-0 left-0 right-0 z-10 bg-white rounded-2xl shadow-2xl p-6 border-2 border-orange-200"
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        {member.expertise.map((skill) => (
                          <span
                            key={skill}
                            className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Achievements</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {member.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-center">
                            <Award className="w-3 h-3 mr-2 text-orange-500" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}