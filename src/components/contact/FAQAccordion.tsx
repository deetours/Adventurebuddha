import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface FAQAccordionProps {
  faqs?: FAQItem[];
}

export function FAQAccordion({ faqs = defaultFAQs }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or category filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          {faq.category}
                        </span>
                        <div className="flex space-x-1">
                          {faq.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs text-gray-500">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: openItems.has(faq.id) ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openItems.has(faq.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t"
                      >
                        <div className="p-6 bg-gray-50">
                          <p className="text-gray-700 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Contact CTA */}
      {filteredFAQs.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6 text-center">
            <HelpCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Still need help?
            </h3>
            <p className="text-gray-700 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const defaultFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I book a trip?',
    answer: 'Booking a trip is easy! Browse our available trips, select your preferred dates, and follow the secure checkout process. You can book online 24/7 or contact our team for assistance.',
    category: 'booking',
    tags: ['booking', 'reservation', 'online']
  },
  {
    id: '2',
    question: 'What is your cancellation policy?',
    answer: 'Our cancellation policy varies by trip. Generally, cancellations made 30+ days before departure receive a full refund minus processing fees. Cancellations 15-30 days before receive 50% refund, and cancellations within 15 days are non-refundable. Some special trips may have different policies.',
    category: 'booking',
    tags: ['cancellation', 'refund', 'policy']
  },
  {
    id: '3',
    question: 'What should I pack for my trip?',
    answer: 'Packing depends on your specific trip, but essentials include comfortable hiking shoes, weather-appropriate clothing, personal medications, toiletries, and any required permits. We provide detailed packing lists for each trip in your booking confirmation.',
    category: 'preparation',
    tags: ['packing', 'gear', 'preparation']
  },
  {
    id: '4',
    question: 'Are meals included in the trip price?',
    answer: 'Meal inclusions vary by trip. Most trekking and adventure trips include all meals (breakfast, lunch, dinner) during the active portion. Cultural and city tours typically include some meals. Check your specific trip itinerary for details.',
    category: 'inclusions',
    tags: ['meals', 'food', 'inclusions']
  },
  {
    id: '5',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI payments, net banking, and bank transfers. International payments are also supported. All transactions are secured with SSL encryption.',
    category: 'payment',
    tags: ['payment', 'cards', 'upi']
  },
  {
    id: '6',
    question: 'Do you provide travel insurance?',
    answer: 'We recommend purchasing comprehensive travel insurance that covers trip cancellations, medical emergencies, and adventure activities. We can help arrange insurance through our trusted partners or you can purchase it separately.',
    category: 'insurance',
    tags: ['insurance', 'safety', 'coverage']
  },
  {
    id: '7',
    question: 'What is the minimum group size for trips?',
    answer: 'Most of our trips require a minimum of 4-6 participants to operate. Private and custom trips can operate with fewer participants for an additional cost. Some special expeditions may have higher minimums.',
    category: 'groups',
    tags: ['group', 'minimum', 'private']
  },
  {
    id: '8',
    question: 'Can I customize my trip itinerary?',
    answer: 'Yes! We offer customized trips tailored to your preferences. Whether you want to extend your stay, add special activities, or modify the route, our team can help create your perfect adventure.',
    category: 'customization',
    tags: ['custom', 'personalized', 'itinerary']
  }
];