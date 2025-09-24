import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  HelpCircle,
  Zap,
  Users,
  CheckCircle,
  Send
} from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
  lastUpdate: string;
  priority: 'low' | 'medium' | 'high';
}

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hi! How can I help you today?", sender: 'agent', time: '10:30 AM' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Mock FAQs with categories
  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "How do I change my booking date?",
      answer: "You can modify your booking date by contacting our support team at least 48 hours before your scheduled departure. A nominal fee may apply for date changes.",
      category: "booking"
    },
    {
      id: 2,
      question: "What is your cancellation policy?",
      answer: "Cancellations made more than 7 days before departure are eligible for a full refund. Cancellations within 7 days are subject to a 25% cancellation fee.",
      category: "booking"
    },
    {
      id: 3,
      question: "Can I add more travelers to my booking?",
      answer: "Yes, you can add additional travelers to your booking up to 24 hours before departure, subject to seat availability.",
      category: "booking"
    },
    {
      id: 4,
      question: "What should I carry for the trip?",
      answer: "We recommend carrying comfortable clothing, sturdy footwear, personal medications, and a water bottle. A detailed packing list will be shared in your booking confirmation.",
      category: "preparation"
    },
    {
      id: 5,
      question: "How do I contact my guide during the trip?",
      answer: "Your guide's contact information will be shared 24 hours before departure. You can also use the emergency hotline provided in your booking confirmation.",
      category: "during-trip"
    },
    {
      id: 6,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, UPI, net banking, and cash payments at our office. International payments are processed securely through our payment gateway.",
      category: "payment"
    }
  ];

  // Mock support tickets with priority
  const supportTickets: SupportTicket[] = [
    {
      id: 'TKT-789456',
      subject: 'Seat selection issue',
      status: 'resolved',
      createdAt: 'May 15, 2024',
      lastUpdate: 'May 16, 2024',
      priority: 'medium'
    },
    {
      id: 'TKT-789457',
      subject: 'Payment confirmation delay',
      status: 'in-progress',
      createdAt: 'May 20, 2024',
      lastUpdate: 'May 21, 2024',
      priority: 'high'
    },
    {
      id: 'TKT-789458',
      subject: 'Itinerary clarification',
      status: 'open',
      createdAt: 'May 22, 2024',
      lastUpdate: 'May 22, 2024',
      priority: 'low'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Topics', icon: HelpCircle },
    { id: 'booking', label: 'Booking', icon: CheckCircle },
    { id: 'payment', label: 'Payment', icon: Zap },
    { id: 'preparation', label: 'Preparation', icon: Users },
    { id: 'during-trip', label: 'During Trip', icon: MessageCircle }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock submission - in a real app, this would call an API
    await new Promise(resolve => setTimeout(resolve, 1500));

    alert('Your support request has been submitted. We will get back to you within 24 hours.');
    setSubject('');
    setMessage('');
    setIsSubmitting(false);
  };

  const sendChatMessage = (text: string) => {
    const newMessage = {
      id: chatMessages.length + 1,
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      const agentResponse = {
        id: chatMessages.length + 2,
        text: "Thanks for your message! Our support team will get back to you shortly. Is there anything else I can help you with right now?",
        sender: 'agent',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, agentResponse]);
    }, 2000);
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-orange-900 bg-orange-100';
      case 'medium':
        return 'text-orange-800 bg-orange-50';
      case 'low':
        return 'text-orange-700 bg-orange-25';
      default:
        return 'text-orange-800 bg-orange-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"
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
        {/* Floating Support Icons */}
        <motion.div
          className="absolute top-1/4 left-1/4 text-6xl opacity-10"
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
          💬
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 text-5xl opacity-10"
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
          📞
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/3 text-4xl opacity-10"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          ⚡
        </motion.div>
      </div>

      {/* Hero Section - Support Command Center */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-6xl mx-auto relative z-10">
          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <motion.div
              className="inline-flex items-center bg-orange-500/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-orange-400/30"
              whileHover={{ scale: 1.05 }}
            >
              <Zap className="w-5 h-5 text-orange-400 mr-2" />
              <span className="text-orange-300 font-medium">Support Command Center</span>
              <motion.div
                className="w-2 h-2 bg-orange-400 rounded-full ml-3"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-orange-400 text-sm ml-2">Online</span>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-orange-200 to-orange-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Get Help
              <br />
              <span className="text-orange-400">Instantly</span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-orange-900 mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              24/7 support from our expert team. Live chat, instant responses, and comprehensive help for all your adventure needs.
            </motion.p>
          </motion.div>

          {/* Emergency Contact Matrix */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* WhatsApp */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border border-orange-400/30"
              >
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  💬
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">WhatsApp</h3>
                <p className="text-orange-100 text-sm">Instant replies • 24/7</p>
                <motion.div
                  className="mt-3 text-xs text-orange-200 font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ⚡ Usually replies in 2 min
                </motion.div>
              </a>
            </motion.div>

            {/* Phone */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <a
                href="tel:+919876543210"
                className="block bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border border-orange-400/30"
              >
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                >
                  📞
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Phone Call</h3>
                <p className="text-orange-100 text-sm">Direct expert support</p>
                <motion.div
                  className="mt-3 text-xs text-orange-200 font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                >
                  🎯 Connect instantly
                </motion.div>
              </a>
            </motion.div>

            {/* Live Chat */}
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="group"
            >
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border border-orange-400/30"
              >
                <motion.div
                  className="text-4xl mb-3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  💬
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Live Chat</h3>
                <p className="text-orange-100 text-sm">Chat with our experts</p>
                <motion.div
                  className="mt-3 text-xs text-orange-200 font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                >
                  🚀 Start conversation
                </motion.div>
              </button>
            </motion.div>
          </motion.div>

          {/* Status Dashboard */}
          <motion.div
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-orange-400/20 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <motion.div
                  className="text-2xl font-bold text-orange-400 mb-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  24/7
                </motion.div>
                <div className="text-sm text-orange-700">Available</div>
              </div>
              <div>
                <motion.div
                  className="text-2xl font-bold text-orange-400 mb-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  &lt;2min
                </motion.div>
                <div className="text-sm text-orange-700">Response Time</div>
              </div>
              <div>
                <motion.div
                  className="text-2xl font-bold text-orange-400 mb-1"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  98%
                </motion.div>
                <div className="text-sm text-orange-700">Satisfaction</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsChatOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">Support Chat</h3>
                      <p className="text-sm opacity-90">Usually replies instantly</p>
                    </div>
                  </div>
                  <motion.div
                    className="w-3 h-3 bg-orange-300 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">{message.time}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendChatMessage((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ Galaxy Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-white relative">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-black text-orange-900 mb-6"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundImage: 'linear-gradient(45deg, #EA580C, #FB923C, #FED7AA)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Knowledge Galaxy
            </motion.h2>
            <p className="text-xl text-orange-800 max-w-2xl mx-auto">
              Explore our comprehensive FAQ database with interactive search and smart categorization.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-white/10 text-orange-700 hover:bg-orange-100 hover:text-orange-900'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.label}
              </motion.button>
            ))}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="max-w-md mx-auto mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/10 border border-orange-400/20 text-orange-900 placeholder-orange-400 rounded-full focus:bg-white/20"
              />
              <HelpCircle className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-400" />
            </div>
          </motion.div>

          {/* FAQ Cards Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 }}
          >
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 30, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  z: 50
                }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-orange-400/20 hover:border-orange-400/50 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: index * 0.2,
                  }}
                />

                {/* Floating Particles */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-orange-400 rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />

                <div className="relative z-10">
                  <motion.div
                    className="text-3xl mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    ❓
                  </motion.div>

                  <motion.h3
                    className="text-lg font-bold text-orange-900 mb-3 group-hover:text-orange-600 transition-colors duration-300"
                    animate={index === 0 ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {faq.question}
                  </motion.h3>

                  <motion.p
                    className="text-orange-700 text-sm leading-relaxed"
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: "auto", opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 * index }}
                  >
                    {faq.answer}
                  </motion.p>

                  <motion.div
                    className="mt-4 flex items-center text-xs text-orange-600"
                    whileHover={{ x: 5 }}
                  >
                    <span className="capitalize">{faq.category.replace('-', ' ')}</span>
                    <motion.div
                      className="ml-2 w-1 h-1 bg-orange-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ticket Tracking Visualization */}
      <section className="py-24 bg-gradient-to-br from-white to-orange-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-black text-orange-900 mb-6"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundImage: 'linear-gradient(45deg, #EA580C, #FB923C, #FED7AA)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Ticket Journey
            </motion.h2>
            <p className="text-xl text-orange-800 max-w-2xl mx-auto">
              Track your support tickets with visual progress indicators and real-time updates.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {supportTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 * index }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-orange-400/20 hover:border-orange-400/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-orange-900">#{ticket.id}</h3>
                    <p className="text-orange-700 mt-1">{ticket.subject}</p>
                  </div>
                  <motion.div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ticket.status === 'resolved'
                        ? 'bg-orange-500/20 text-orange-700 border border-orange-400/30'
                        : ticket.status === 'in-progress'
                        ? 'bg-orange-400/20 text-orange-800 border border-orange-400/30'
                        : 'bg-orange-300/20 text-orange-900 border border-orange-400/30'
                    }`}
                    animate={ticket.status === 'in-progress' ? {
                      scale: [1, 1.05, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {ticket.status.replace('-', ' ').toUpperCase()}
                  </motion.div>
                </div>

                {/* Progress Timeline */}
                <div className="space-y-3">
                  {[
                    { step: 'Submitted', date: ticket.createdAt, completed: true },
                    { step: 'In Review', date: ticket.lastUpdate, completed: ticket.status !== 'open' },
                    { step: 'Resolved', date: ticket.status === 'resolved' ? ticket.lastUpdate : null, completed: ticket.status === 'resolved' }
                  ].map((step, stepIndex) => (
                    <motion.div
                      key={stepIndex}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 * stepIndex }}
                    >
                      <motion.div
                        className={`w-4 h-4 rounded-full border-2 ${
                          step.completed
                            ? 'bg-orange-400 border-orange-400'
                            : 'border-orange-300'
                        }`}
                        animate={step.completed ? {
                          scale: [1, 1.2, 1],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, delay: stepIndex * 0.5 }}
                      >
                        {step.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-full h-full bg-orange-400 rounded-full flex items-center justify-center"
                          >
                            <CheckCircle className="w-2 h-2 text-white" />
                          </motion.div>
                        )}
                      </motion.div>

                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          step.completed ? 'text-orange-900' : 'text-orange-600'
                        }`}>
                          {step.step}
                        </div>
                        {step.date && (
                          <div className="text-xs text-orange-500">{step.date}</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Priority Badge */}
                <motion.div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-4 ${getPriorityColor(ticket.priority)}`}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-current mr-2"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  {ticket.priority.toUpperCase()} PRIORITY
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.h2
              className="text-4xl md:text-5xl font-black text-orange-900 mb-6"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundImage: 'linear-gradient(45deg, #EA580C, #FB923C, #FED7AA)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Need More Help?
            </motion.h2>
            <p className="text-xl text-orange-800">
              Send us a detailed message and our experts will get back to you within 2 hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 backdrop-blur-md border border-orange-400/20">
              <CardHeader>
                <CardTitle className="text-orange-900">Contact Support</CardTitle>
                <CardDescription className="text-orange-700">
                  Send us a message and we'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-orange-900">Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Briefly describe your issue"
                      required
                      className="bg-white/10 border border-orange-400/20 text-orange-900 placeholder-orange-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-orange-900">Message</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide as much detail as possible about your issue"
                      rows={5}
                      required
                      className="bg-white/10 border border-orange-400/20 text-orange-900 placeholder-orange-400"
                    />
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          ⟳
                        </motion.div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}