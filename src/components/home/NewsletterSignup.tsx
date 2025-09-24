import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from '../ui/use-toast';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubscribed(true);
    
    toast({
      title: "Subscribed!",
      description: "You've been added to our newsletter. Check your email for confirmation.",
    });
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated on Adventures
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get exclusive deals, travel tips, and inspiration delivered to your inbox
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto"
          >
            {isSubscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-white/90">
                  You've been successfully subscribed to our newsletter.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 py-3 text-lg rounded-full bg-white/90"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full rounded-full py-3 text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Subscribe Now
                    </>
                  )}
                </Button>
                
                <p className="text-white/80 text-sm">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates.
                </p>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap justify-center gap-4"
          >
            {[
              { count: '10K+', label: 'Subscribers' },
              { count: '50+', label: 'Destinations' },
              { count: '98%', label: 'Satisfaction' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.count}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}