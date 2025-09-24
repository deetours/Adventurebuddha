// Chain Prompting configurations for different pages and components

export interface PageEnhancementChain {
  page: string;
  steps: ChainStepConfig[];
}

import { ChainStep } from "../services/chainPromptingService";

// ChainStepConfig is the same as ChainStep
type ChainStepConfig = ChainStep;

export const pageEnhancementChains: PageEnhancementChain[] = [
  {
    page: "HomePage",
    steps: [
      {
        id: "hero_section_revolution",
        task: "Complete Hero Section Revolution with Performance Optimization",
        prompt: `Transform the hero section into an ultra-premium, interactive experience using STRICTLY white and orange colors only. Create floating travel icons (compass, camera, backpack, map pins) that follow cursor with smooth 60fps animations. Implement 3D destination orbs that rotate and respond to scroll. Build an orange particle system that forms travel-related shapes. Create morphing CTA buttons that reveal hidden features on hover. Use performance-optimized animations with proper throttling and lazy loading. Ensure no lag or performance issues.`
      },
      {
        id: "interactive_search_revolution",
        task: "Revolutionary Search Experience with Real-time Features",
        prompt: `Transform the search into a live, magical experience. Implement real-time suggestions that appear instantly as users type. Add voice search integration with animated microphone. Create search results that slide in from sides with smooth animations. Build mini-cards with image previews and quick booking functionality. Add search history with animated chips. Ensure all animations are GPU-accelerated and performance-optimized.`
      },
      {
        id: "tripstats_dashboard_gamification",
        task: "Interactive TripStats Dashboard with Live Data",
        prompt: `Convert TripStats into a gamified dashboard. Add progress bars that fill as users scroll with easing functions. Implement interactive tooltips showing detailed breakdowns. Create mini charts that animate on scroll. Build achievement badges that unlock. Add live social proof counters. Use efficient animation libraries and ensure smooth 60fps performance.`
      },
      {
        id: "destination_cards_3d_revolution",
        task: "3D Destination Cards with Interactive Content",
        prompt: `Revolutionize destination cards with 3D effects. Implement tilt animations with realistic shadows. Create flip cards revealing detailed information. Add video previews that play on hover. Integrate 360° image viewers. Embed interactive maps. Add social features with animated likes and shares. Optimize for performance with proper rendering techniques.`
      },
      {
        id: "features_section_gamification",
        task: "Gamified Features Section with Interactive Demos",
        prompt: `Transform features into an engaging gamified experience. Create hover animations that reveal hidden content. Implement click-to-expand functionality with smooth transitions. Build mini-demos showing features in action. Add progress indicators for feature completion. Create interactive walkthroughs. Ensure all interactions are smooth and performant.`
      },
      {
        id: "testimonials_social_proof_system",
        task: "Advanced Testimonials with Video and Interactive Ratings",
        prompt: `Build a comprehensive social proof system. Implement video testimonials with custom play button animations. Create animated star ratings that fill on hover. Add review filters by rating and destination. Include user photo galleries with lightbox effects. Add social sharing capabilities. Optimize video loading and playback performance.`
      },
      {
        id: "newsletter_gamification_system",
        task: "Gamified Newsletter Signup with Rewards",
        prompt: `Create an engaging newsletter experience. Implement animated input fields with floating labels. Add progress indicators showing form completion. Build validation animations with feedback. Create success animations with confetti effects. Implement a reward system with instant perks. Add referral functionality with animations. Ensure smooth performance.`
      },
      {
        id: "cta_conversion_optimization",
        task: "Multi-Path CTA Engagement System",
        prompt: `Build comprehensive conversion optimization. Create interactive contact options with live previews. Implement quick booking flow with progress steps. Add live chat widget with typing indicators. Build conversion funnels with A/B tested CTAs. Add urgency indicators with animated countdowns. Include trust signals with animated badges. Optimize for maximum conversion while maintaining performance.`
      }
    ]
  },
  {
    page: "AboutPage",
    steps: [
      {
        id: "content_analysis",
        task: "Analyze existing about page content",
        prompt: "Analyze the current about page content and identify areas for improvement in terms of storytelling, value proposition clarity, and emotional connection with visitors. Focus on token efficiency."
      },
      {
        id: "value_proposition",
        task: "Enhance value proposition",
        prompt: "Based on the content analysis, rewrite the value proposition to be more compelling and concise. Keep it under 100 words."
      },
      {
        id: "story_structure",
        task: "Create improved story structure",
        prompt: "Develop a narrative structure that follows a hero's journey pattern: challenge -> solution -> transformation. Make it relatable to adventure travelers."
      }
    ]
  },
  {
    page: "ContactPage",
    steps: [
      {
        id: "pain_points",
        task: "Identify customer pain points",
        prompt: "Analyze common customer inquiries and identify the top 5 pain points. Categorize them by frequency and impact."
      },
      {
        id: "faq_content",
        task: "Generate FAQ content",
        prompt: "Create concise, helpful FAQ entries for the identified pain points. Each answer should be under 50 words."
      },
      {
        id: "contact_form",
        task: "Optimize contact form fields",
        prompt: "Suggest optimal contact form fields that balance information gathering with user convenience. Prioritize essential fields only."
      }
    ]
  },
  {
    page: "BlogPage",
    steps: [
      {
        id: "topic_analysis",
        task: "Analyze popular travel topics",
        prompt: "Based on travel trends and Adventure Buddha's offerings, identify the top 10 blog topics that would engage readers and support SEO."
      },
      {
        id: "content_outline",
        task: "Create content outline",
        prompt: "For the topic 'Adventure Travel on a Budget', create a detailed content outline with headers, subheaders, and key points to cover."
      },
      {
        id: "seo_optimization",
        task: "Optimize for SEO",
        prompt: "Suggest 5 SEO-friendly titles and meta descriptions for a blog post about budget adventure travel. Include relevant keywords."
      }
    ]
  },
  {
    page: "TripDetailsPage",
    steps: [
      {
        id: "itinerary_analysis",
        task: "Analyze trip itinerary",
        prompt: "Review the trip itinerary and identify opportunities to enhance the description with more sensory details and emotional appeal."
      },
      {
        id: "activity_highlight",
        task: "Highlight key activities",
        prompt: "For each day's activities, create compelling 25-word descriptions that emphasize the unique experience and adventure aspect."
      },
      {
        id: "safety_info",
        task: "Enhance safety information",
        prompt: "Rewrite safety information to be reassuring rather than alarming, focusing on Adventure Buddha's expertise and preparation measures."
      }
    ]
  },
  {
    page: "SupportPage",
    steps: [
      {
        id: "hero_support_revolution",
        task: "Create a stunning hero section with animated support icons, floating help bubbles, and interactive contact methods. Include a live chat preview with typing animations and instant response indicators.",
        prompt: `Transform the Support Page hero into a futuristic "Support Command Center" with:

1. **Animated Support Icons**: Floating help icons (chat bubbles, phone, email) that orbit around the main title with smooth 60fps animations
2. **Live Chat Preview**: Interactive chat widget showing "typing..." animations and instant response previews
3. **Emergency Contact Matrix**: Grid of contact methods with hover animations and instant connection effects
4. **Status Indicators**: Real-time "Online Now" badges with pulsing animations
5. **Background Effects**: Subtle particle system with support-themed floating elements
6. **Call-to-Action**: Prominent "Get Help Now" button with morphing animations

Use white and orange color scheme, ensure mobile responsiveness, and optimize for 60fps performance.`
      },
      {
        id: "faq_galaxy_system",
        task: "Build an interactive FAQ system with 3D card animations, search with live filtering, expandable answers with smooth transitions, and category-based organization.",
        prompt: `Create a revolutionary FAQ system called "Knowledge Galaxy":

1. **3D Card Animations**: FAQ cards that float in 3D space with tilt effects and depth
2. **Live Search**: Real-time filtering with animated results appearing/disappearing
3. **Expandable Answers**: Smooth accordion animations with content reveal effects
4. **Category Organization**: Tabbed interface with animated category switching
5. **Interactive Elements**: Hover effects, click animations, and visual feedback
6. **Smart Suggestions**: AI-powered related question suggestions with smooth transitions

Implement with performance optimizations, accessibility features, and mobile-first design.`
      },
      {
        id: "live_support_dashboard",
        task: "Implement a real-time support dashboard with animated status indicators, live chat widget with typing animations, and instant contact options with hover effects.",
        prompt: `Build a "Live Support Command Center":

1. **Real-time Status Dashboard**: Animated indicators showing agent availability, response times, and active chats
2. **Live Chat Widget**: Full-featured chat with typing indicators, message animations, and file sharing
3. **Instant Contact Options**: WhatsApp, phone, email buttons with hover animations and instant launch
4. **Response Time Indicators**: Live countdown timers with color-coded urgency levels
5. **Agent Status Cards**: Individual agent cards with photos, status, and specialties
6. **Queue Management**: Visual queue system showing position and estimated wait time

Include sound notifications, accessibility features, and seamless mobile experience.`
      },
      {
        id: "ticket_tracking_visualization",
        task: "Create a visual ticket tracking system with progress bars, status animations, and interactive timeline showing ticket journey from submission to resolution.",
        prompt: `Develop a "Ticket Journey Visualizer":

1. **Progress Timeline**: Animated timeline showing ticket lifecycle with smooth transitions
2. **Status Animations**: Dynamic status changes with color transitions and icon animations
3. **Interactive Elements**: Clickable timeline points revealing detailed information
4. **Progress Bars**: Multi-stage progress indicators with percentage completion
5. **Status Badges**: Animated badges showing priority levels and urgency indicators
6. **Time Estimates**: Live countdown timers for expected resolution times

Implement with smooth animations, accessibility features, and real-time updates.`
      },
      {
        id: "emergency_response_matrix",
        task: "Build an emergency contact matrix with animated priority indicators, instant WhatsApp integration, and emergency hotline with visual feedback.",
        prompt: `Create an "Emergency Response Matrix":

1. **Priority Indicators**: Color-coded priority levels with animated alerts and urgency signals
2. **Instant Integration**: One-click WhatsApp, phone, and emergency contact buttons
3. **Visual Feedback**: Loading animations, success indicators, and connection status
4. **Emergency Hotline**: Prominent emergency contact with animated ringing effects
5. **Response Tracking**: Real-time response indicators and connection status
6. **Multi-channel Support**: Simultaneous contact options with smart routing

Ensure instant response times, accessibility compliance, and mobile optimization.`
      }
    ]
  },
  {
    page: "BookingFlow",
    steps: [
      {
        id: "trip_details_enhancement",
        task: "Enhance TripDetailsPage with dynamic data loading, interactive elements, and smooth booking flow initiation",
        prompt: `Transform TripDetailsPage into a premium booking experience:

1. **Dynamic Data Loading**: Implement React Query for efficient data fetching with loading states and error handling
2. **Interactive Trip Gallery**: Create image carousel with zoom functionality and 360° views
3. **Availability Calendar**: Build interactive calendar showing real-time availability with instant updates
4. **Traveler Selection**: Animated counter controls for group size with pricing updates
5. **Itinerary Timeline**: Expandable day-by-day breakdown with smooth animations
6. **Booking Initiation**: One-click booking flow with progress indicators and form pre-population
7. **Trust Signals**: Display booking guarantees, cancellation policies, and customer reviews
8. **Mobile Optimization**: Ensure perfect mobile experience with touch-friendly interactions

Use orange and white theme, implement performance optimizations, and ensure seamless user experience.`
      },
      {
        id: "seat_selection_revolution",
        task: "Create revolutionary seat selection system with 3D visualization, real-time availability, and instant booking",
        prompt: `Build a cutting-edge seat selection experience:

1. **3D Seat Map**: Interactive 3D visualization of seating arrangements with realistic perspectives
2. **Real-time Availability**: Live updates showing seat availability with instant refresh
3. **Seat Categories**: Premium, standard, and budget options with visual differentiation
4. **Selection Animation**: Smooth animations when selecting/deselecting seats with feedback
5. **Price Calculator**: Dynamic pricing updates based on seat selection and group size
6. **Booking Lock**: Temporary seat reservation with countdown timer and auto-release
7. **Accessibility Features**: Screen reader support and keyboard navigation
8. **Mobile Responsive**: Touch-optimized interface with gesture controls

Implement with WebGL optimizations, ensure 60fps performance, and maintain orange/white theme.`
      },
      {
        id: "booking_form_optimization",
        task: "Optimize booking form with smart validation, auto-save, progress tracking, and instant confirmation",
        prompt: `Create an intelligent booking form system:

1. **Smart Form Fields**: Auto-complete, validation with real-time feedback, and contextual help
2. **Progress Tracking**: Multi-step progress bar with completion percentages and time estimates
3. **Auto-save Functionality**: Automatic draft saving with resume capability across devices
4. **Dynamic Pricing**: Real-time price updates based on selections with breakdown display
5. **Form Validation**: Advanced validation with helpful error messages and suggestions
6. **Emergency Contact**: Smart contact form with relationship-based suggestions
7. **Terms Integration**: Interactive terms acceptance with expandable sections
8. **Confirmation Preview**: Live preview of booking details with edit capabilities

Ensure smooth animations, accessibility compliance, and mobile-first design with orange/white theme.`
      },
      {
        id: "payment_processing_revolution",
        task: "Revolutionize payment experience with multiple methods, security features, and instant processing",
        prompt: `Build a comprehensive payment processing system:

1. **Multi-method Support**: UPI, cards, wallets, net banking with smart detection
2. **Security Features**: SSL indicators, payment encryption visuals, and trust badges
3. **QR Code Integration**: Instant QR generation for UPI payments with status tracking
4. **Payment Validation**: Real-time validation with instant feedback and error handling
5. **Receipt Generation**: Instant digital receipt with download and email options
6. **Payment Recovery**: Failed payment recovery with alternative methods and retry logic
7. **Mobile Optimization**: Touch-friendly payment interface with biometric support
8. **Confirmation System**: Immediate booking confirmation with SMS and email notifications

Implement with security best practices, ensure PCI compliance, and maintain orange/white theme.`
      },
      {
        id: "booking_confirmation_experience",
        task: "Create comprehensive booking confirmation with interactive elements, sharing options, and next steps",
        prompt: `Develop a complete booking confirmation experience:

1. **Interactive Confirmation**: Animated confirmation with booking details and next steps
2. **Digital Documents**: Instant access to tickets, vouchers, and travel documents
3. **Sharing Options**: Social media sharing with custom messages and booking highlights
4. **Calendar Integration**: One-click calendar addition with reminders and notifications
5. **Travel Checklist**: Interactive checklist with completion tracking and tips
6. **Emergency Contacts**: Prominent display of emergency contacts and support information
7. **Modification Options**: Easy booking modification and cancellation options
8. **Follow-up System**: Automated follow-up emails with preparation reminders

Ensure engaging animations, accessibility features, and seamless mobile experience with orange/white theme.`
      }
    ]
  }
];

// Utility function to get chain for a specific page
export function getChainForPage(pageName: string): PageEnhancementChain | undefined {
  return pageEnhancementChains.find(chain => chain.page === pageName);
}