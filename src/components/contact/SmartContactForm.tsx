import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SmartContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface ValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function SmartContactForm({ onSubmit }: SmartContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);

  const subjectSuggestions = [
    'General Inquiry',
    'Trip Booking',
    'Trip Modification',
    'Cancellation Request',
    'Payment Issue',
    'Technical Support',
    'Feedback',
    'Partnership',
    'Media Inquiry',
    'Other'
  ];

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email': {
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      }
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        break;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.trim().length < 10) return 'Message must be at least 10 characters';
        break;
    }
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Auto-suggestions for subject
    if (name === 'subject' && value.length > 0) {
      const suggestions = subjectSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setAutoSuggestions(suggestions);
    } else {
      setAutoSuggestions([]);
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof ContactFormData] as string);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, subject: suggestion }));
    setAutoSuggestions([]);
    setErrors(prev => ({ ...prev, subject: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: ValidationErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'priority') {
        const error = validateField(key, formData[key as keyof ContactFormData] as string);
        if (error) newErrors[key as keyof ValidationErrors] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true
    });

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success('Message sent successfully! We\'ll get back to you soon.');

        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          priority: 'medium'
        });
        setTouched({});
        setAutoSuggestions([]);

        onSubmit?.(formData);
      } catch {
        toast.error('Failed to send message. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center">
            Full Name *
            {touched.name && !errors.name && formData.name && (
              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
            )}
          </Label>
          <div className="relative">
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={() => handleBlur('name')}
              placeholder="Enter your full name"
              className={errors.name ? 'border-red-500' : touched.name && !errors.name && formData.name ? 'border-green-500' : ''}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-6 left-0 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.name}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            Email Address *
            {touched.email && !errors.email && formData.email && (
              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
            )}
          </Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email address"
              className={errors.email ? 'border-red-500' : touched.email && !errors.email && formData.email ? 'border-green-500' : ''}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -bottom-6 left-0 text-sm text-red-600 flex items-center"
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.email}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="flex items-center">
          Subject *
          {touched.subject && !errors.subject && formData.subject && (
            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
          )}
        </Label>
        <div className="relative">
          <Input
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            onBlur={() => handleBlur('subject')}
            placeholder="What is this regarding?"
            className={errors.subject ? 'border-red-500' : touched.subject && !errors.subject && formData.subject ? 'border-green-500' : ''}
          />

          {/* Auto-suggestions */}
          <AnimatePresence>
            {autoSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1 max-h-40 overflow-y-auto"
              >
                {autoSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {errors.subject && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -bottom-6 left-0 text-sm text-red-600 flex items-center"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.subject}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Priority Selection */}
      <div className="space-y-2">
        <Label>Priority Level</Label>
        <div className="flex space-x-2">
          {(['low', 'medium', 'high'] as const).map((priority) => (
            <button
              key={priority}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, priority }))}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors capitalize ${
                formData.priority === priority
                  ? getPriorityColor(priority)
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="flex items-center">
          Message *
          <span className="text-sm text-gray-500 ml-2">
            ({formData.message.length}/500 characters)
          </span>
          {touched.message && !errors.message && formData.message && (
            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
          )}
        </Label>
        <div className="relative">
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onBlur={() => handleBlur('message')}
            placeholder="How can we help you?"
            rows={6}
            maxLength={500}
            className={errors.message ? 'border-red-500' : touched.message && !errors.message && formData.message ? 'border-green-500' : ''}
          />
          <AnimatePresence>
            {errors.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -bottom-6 left-0 text-sm text-red-600 flex items-center"
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}