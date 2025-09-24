import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  avatar: string;
  trip: string;
}

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: "Sarah Johnson",
      location: "Mumbai",
      text: "The Ladakh trip was absolutely incredible! Every detail was perfectly planned. The guides were knowledgeable and the accommodations were amazing.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      trip: "Ladakh Adventure"
    },
    {
      id: '2',
      name: "Raj Patel",
      location: "Delhi",
      text: "Professional guides, amazing experiences, and great value for money. This was my third trip with Adventure Buddha and it won't be my last!",
      rating: 5,
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      trip: "Goa Beach Retreat"
    },
    {
      id: '3',
      name: "Emily Chen",
      location: "Bangalore",
      text: "Solo female traveler here - felt completely safe and had the time of my life! The group was welcoming and the itinerary was perfect.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg",
      trip: "Kerala Backwaters"
    },
    {
      id: '4',
      name: "Michael Torres",
      location: "Hyderabad",
      text: "The best travel experience I've ever had. Will definitely book with Adventure Buddha again! The attention to detail was impressive.",
      rating: 5,
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg",
      trip: "Himachal Trekking"
    }
  ];

  const nextTestimonial = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevTestimonial = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 6000);
    return () => clearInterval(interval);
  }, [nextTestimonial]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Traveler Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from our community of adventurers who've experienced the magic
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonials Carousel */}
          <div className="relative h-80 overflow-hidden rounded-2xl">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={{
                  enter: (direction: number) => ({
                    x: direction > 0 ? 1000 : -1000,
                    opacity: 0
                  }),
                  center: {
                    zIndex: 1,
                    x: 0,
                    opacity: 1
                  },
                  exit: (direction: number) => ({
                    zIndex: 0,
                    x: direction < 0 ? 1000 : -1000,
                    opacity: 0
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0 bg-white shadow-lg rounded-2xl p-8 flex flex-col"
              >
                <Quote className="h-12 w-12 text-primary mb-6" />
                
                <p className="text-xl text-gray-700 mb-8 flex-grow italic">
                  "{testimonials[currentIndex].text}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img 
                      src={testimonials[currentIndex].avatar} 
                      alt={testimonials[currentIndex].name}
                      className="h-16 w-16 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-bold text-lg">{testimonials[currentIndex].name}</div>
                      <div className="text-gray-600">{testimonials[currentIndex].location}</div>
                      <div className="text-sm text-gray-500">{testimonials[currentIndex].trip}</div>
                    </div>
                  </div>
                  
                  <div className="flex">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 rounded-full h-12 w-12 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 rounded-full h-12 w-12 shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-primary w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { value: '4.9', label: 'Average Rating', icon: <Star className="h-6 w-6 text-yellow-400 fill-current" /> },
            { value: '10K+', label: 'Happy Travelers', icon: <div className="h-6 w-6 bg-primary rounded-full"></div> },
            { value: '98%', label: 'Recommendation', icon: <div className="h-6 w-6 bg-accent rounded-full"></div> },
            { value: '15+', label: 'Years Experience', icon: <div className="h-6 w-6 bg-orange-500 rounded-full"></div> }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 bg-white rounded-xl shadow-sm"
            >
              <div className="flex justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}