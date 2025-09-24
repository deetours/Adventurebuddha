import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  CreditCard, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories: FAQCategory[] = [
    {
      id: 'booking',
      title: 'Booking & Reservations',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Questions about trip bookings, modifications, and cancellations'
    },
    {
      id: 'payment',
      title: 'Payment & Pricing',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Payment methods, refunds, and pricing inquiries'
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: <User className="h-5 w-5" />,
      description: 'Managing your account, profile, and preferences'
    },
    {
      id: 'travel',
      title: 'Travel Information',
      icon: <MapPin className="h-5 w-5" />,
      description: 'Travel requirements, itineraries, and preparation'
    }
  ];

  const faqs: FAQItem[] = [
    {
      id: 1,
      question: "How do I book a trip?",
      answer: "You can book a trip by browsing our available trips, selecting your preferred dates, and completing the booking process through our secure checkout. You'll receive a confirmation email with all the details.",
      category: 'booking'
    },
    {
      id: 2,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), debit cards, UPI payments, and bank transfers. All payments are processed securely through our payment partners.",
      category: 'payment'
    },
    {
      id: 3,
      question: "How do I cancel my booking?",
      answer: "You can cancel your booking through your account dashboard. Please review our refund policy for information on cancellation fees and refund timelines.",
      category: 'booking'
    },
    {
      id: 4,
      question: "How do I update my account information?",
      answer: "Log in to your account and navigate to the profile section to update your personal information, contact details, and preferences.",
      category: 'account'
    },
    {
      id: 5,
      question: "What should I pack for my trip?",
      answer: "Each trip page includes a detailed packing list. Generally, we recommend comfortable clothing, sturdy footwear, personal medications, and a water bottle. Specific requirements will be shared in your booking confirmation.",
      category: 'travel'
    },
    {
      id: 6,
      question: "Do I need travel insurance?",
      answer: "While not mandatory, we highly recommend purchasing travel insurance for all trips. We offer comprehensive travel insurance options during the booking process.",
      category: 'travel'
    },
    {
      id: 7,
      question: "When will I receive my refund?",
      answer: "Refunds are typically processed within 10-15 business days after approval. The time it takes for funds to appear in your account depends on your payment method.",
      category: 'payment'
    },
    {
      id: 8,
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team via phone at +91 98765 43210, email at support@adventurebuddha.com, or through our live chat feature available on our website during business hours.",
      category: 'account'
    }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions and get help with your bookings
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {category.icon}
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
              <p className="font-medium">+91 98765 43210</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9:00 AM - 8:00 PM IST</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Send us a message</p>
              <p className="font-medium">support@adventurebuddha.com</p>
              <p className="text-sm text-gray-500">We respond within 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <User className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team</p>
              <Button variant="outline">Start Chat</Button>
              <p className="text-sm text-gray-500 mt-2">Mon-Fri, 9:00 AM - 8:00 PM IST</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          {searchQuery && (
            <p className="text-gray-600 mb-6">
              Showing {filteredFAQs.length} results for "{searchQuery}"
            </p>
          )}
          
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <details className="group">
                    <summary className="flex justify-between items-center p-4 md:p-6 cursor-pointer list-none">
                      <h3 className="font-medium text-gray-900">{faq.question}</h3>
                      <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  </details>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No FAQs found matching your search.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}