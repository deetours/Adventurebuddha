import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentType?: string;
}

interface AdventureChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  context?: {
    page: string;
    tripId?: string;
    bookingId?: string;
    userId?: string;
  };
}

export function AdventureChatbot({ isOpen, onToggle, context }: AdventureChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'agent',
      content: `Hello! I'm your Adventure Buddha assistant. I can help you with:

🧭 **Trip Planning** - Get personalized recommendations
❓ **FAQs** - Quick answers to common questions
💰 **Payments** - Payment policies and options
🎫 **Bookings** - Check status and get help
🆘 **Support** - 24/7 customer care

What can I help you with today?`,
      timestamp: new Date(),
      agentType: 'general'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Use chain prompting to determine agent type and get response
      const response = await apiClient.chatWithAgent({
        query: inputValue,
        context: {
          page: context?.page || 'general',
          tripId: context?.tripId,
          bookingId: context?.bookingId,
          userId: context?.userId,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }
      });

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.content,
        timestamp: new Date(),
        agentType: response.agentType
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Sorry, I'm having trouble connecting. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment, or contact our support team directly.",
        timestamp: new Date(),
        agentType: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAgentBadgeColor = (agentType?: string) => {
    switch (agentType) {
      case 'trip_guidance': return 'bg-blue-100 text-blue-800';
      case 'faq': return 'bg-green-100 text-green-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      case 'customer_care': return 'bg-orange-100 text-orange-800';
      case 'booking': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAgentIcon = (agentType?: string) => {
    switch (agentType) {
      case 'trip_guidance': return '🧭';
      case 'faq': return '❓';
      case 'payment': return '💰';
      case 'customer_care': return '🆘';
      case 'booking': return '🎫';
      default: return '🤖';
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onToggle}
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] z-50"
          >
            <Card className="h-full flex flex-col shadow-2xl border-2 border-orange-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Adventure Assistant</h3>
                      <p className="text-sm text-orange-100">Your AI travel companion</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                          {/* Agent Badge */}
                          {message.type === 'agent' && message.agentType && message.agentType !== 'general' && (
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={`text-xs ${getAgentBadgeColor(message.agentType)}`}>
                                {getAgentIcon(message.agentType)} {message.agentType.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`p-3 rounded-2xl ${
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {message.type === 'agent' && (
                                <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              )}
                              {message.type === 'user' && (
                                <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              )}
                              <div className="flex-1 whitespace-pre-wrap text-sm">
                                {message.content}
                              </div>
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
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
                        <div className="bg-gray-100 p-3 rounded-2xl max-w-[80%]">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your trip..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}