# Adventure Buddha - Travel Booking Frontend

A modern, production-ready travel booking web application built with React, TypeScript, and Tailwind CSS. Features real-time seat selection, multiple payment options, WebGL animations, and comprehensive accessibility support.

## 🚀 Features

- **Dynamic Seat Selection**: Real-time seat map with WebSocket updates and collision handling
- **Multi-Payment Support**: Razorpay, UPI QR, and manual screenshot upload
- **WebGL Animations**: Floating objects with accessible fallbacks
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Real-time Updates**: WebSocket integration for live seat status
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **Performance**: Lazy loading, code splitting, and optimized bundle size
- **Testing**: Comprehensive unit, integration, and E2E tests
- **Storybook**: Component documentation and design system
- **Chain Prompting**: AI-powered content enhancement with optimized token usage
- **CI/CD**: Automated deployment with rollback capabilities

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Django, PostgreSQL, Redis, Docker
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: Zustand, TanStack Query
- **Animations**: Framer Motion, react-three-fiber
- **Forms**: React Hook Form, Zod validation
- **Testing**: Vitest, React Testing Library, Cypress
- **Documentation**: Storybook
- **Deployment**: Docker, Nginx, GitHub Actions
- **CI/CD**: Automated testing and deployment

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd adventure-buddha-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:5173 in your browser

### Docker Setup

```bash
# Development with docker-compose
docker-compose up -d

# Production build
docker build -t adventure-buddha-frontend .
docker run -p 3000:80 adventure-buddha-frontend
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn)
│   ├── layout/          # Layout components
│   ├── home/            # Homepage components
│   ├── trips/           # Trip-related components
│   └── booking/         # Booking flow components
├── pages/               # Page components
├── stores/              # Zustand state management
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and API client
├── test/                # Test utilities
├── contexts/            # React contexts
├── services/            # Business logic services
├── config/              # Configuration files
└── utils/               # Utility functions
```

## 🎨 Design System

### Color Palette
- **Primary**: #FF6A00 (Orange)
- **Accent**: #FF964C (Light Orange)
- **Background**: #FFFFFF (White)
- **Surface**: #F8FAFC (Light Gray)

### Typography
- **Font**: Inter Variable with system fallbacks
- **Weights**: 300, 400, 500, 600, 700

### Spacing
- **System**: 8px base unit
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)

## 🧪 Testing

### Unit Tests
```bash
npm run test           # Run tests
npm run test:ui        # Run with UI
```

### E2E Tests
```bash
npm run cypress:open   # Interactive mode
npm run e2e           # Headless mode
```

### Storybook
```bash
npm run storybook      # Start Storybook
npm run build-storybook # Build static version
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run preview        # Preview production build
```

### Environment Configuration

Create `.env` file with:

```env
# API Configuration
VITE_API_BASE_URL=https://api.adventurebuddhha.com
VITE_WS_BASE_URL=wss://api.adventurebuddhha.com/ws

# Payment Configuration
VITE_RAZORPAY_KEY=rzp_live_your_key_here

# Feature Flags
VITE_USE_MOCK_API=false
```

## 📊 API Integration

The application integrates with backend APIs for:

- **Trips**: CRUD operations, filtering, search
- **Bookings**: Seat selection, locking, payment processing
- **Payments**: Razorpay, UPI QR, manual uploads
- **WebSocket**: Real-time seat updates

### Mock API

For development, the app includes comprehensive mock APIs that simulate:
- Trip data with realistic content
- Seat locking with TTL
- Payment processing flows
- WebSocket events

## 🎯 Key Components

### SeatMapRenderer
- Dynamic seat layout from JSON configuration
- Real-time status updates via WebSocket
- Keyboard navigation and ARIA support
- Touch-friendly mobile interactions

### Payment System
- **Razorpay Integration**: Secure payment processing
- **UPI QR Codes**: Generate and display QR codes
- **Manual Upload**: Screenshot-based payment verification

### WebGL Animations
- Three.js floating objects in hero section
- Graceful fallback to SVG animations
- Respects `prefers-reduced-motion`

## 🔧 Configuration

### Feature Flags
```typescript
// config.ts
export const config = {
  USE_MOCK_API: boolean,
  RAZORPAY_KEY: string,
  API_BASE_URL: string,
  WS_BASE_URL: string,
}
```

### Accessibility
- WCAG AA compliant
- Keyboard navigation
- Screen reader support
- High contrast ratios
- Touch targets ≥44px

## 🤖 Chain Prompting System

Adventure Buddha implements a sophisticated chain prompting system to enhance content with AI while optimizing token usage:

### Benefits
- **Reduced API Costs**: Smaller, focused prompts use fewer tokens
- **Better Quality**: Specialized prompts often produce better results
- **Caching Opportunities**: Intermediate results can be cached
- **Error Handling**: Easier to identify and fix issues in specific steps
- **Scalability**: Can parallelize independent chain steps

### Implementation
The chain prompting system consists of:
1. **ChainPromptingService**: Handles execution of prompt chains
2. **Configuration System**: Defines prompt chains for different pages
3. **Context Provider**: Provides chain prompting capabilities to React components
4. **React Hook**: Simple interface for using chain prompting in components

For detailed implementation information, see [Chain Prompting Implementation Guide](README_CHAIN_PROMPTING.md)

## � CI/CD Pipeline

Adventure Buddha features a comprehensive CI/CD pipeline using GitHub Actions for automated testing and deployment.

### Features
- **Automated Testing**: Frontend and backend tests on every push
- **Zero-Downtime Deployment**: Rolling updates with health checks
- **Automatic Rollback**: Failed deployments automatically rollback
- **Health Monitoring**: Continuous health checks post-deployment
- **Multi-Environment**: Support for staging and production

### Setup
1. **VM Preparation**: Run the setup script on your Ubuntu server:
   ```bash
   curl -fsSL https://raw.githubusercontent.com/deetours/Adventurebuddha/main/setup-ci-cd.sh | bash
   ```

2. **GitHub Secrets**: Add the following to your repository secrets:
   - `VM_HOST`: Your server IP/domain
   - `VM_USER`: SSH username (usually 'ubuntu')
   - `VM_SSH_PRIVATE_KEY`: Private SSH key for deployment

3. **Environment Files**: Configure `.env` files on your server

### Deployment Flow
```
Push to main → Tests → Build → Deploy → Health Check → Success
                    ↓ (if fail)
               Automatic Rollback + Issue Creation
```

### Monitoring
- **Health Checks**: Database, Redis, API endpoints
- **Logs**: Automatic log rotation and archival
- **Notifications**: Slack/Discord webhook support
- **Metrics**: Deployment success/failure tracking

For detailed CI/CD setup instructions, see [CI/CD Setup Guide](CI_CD_README.md)

## �🐛 Known Issues & Limitations

1. **WebSocket Reconnection**: Basic exponential backoff implemented
2. **Offline Support**: Not implemented (future enhancement)
3. **Push Notifications**: Not implemented (future enhancement)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- ESLint configuration provided
- Prettier for formatting
- TypeScript strict mode
- Component documentation in Storybook

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- **Documentation**: Check Storybook for component usage
- **Issues**: Create GitHub issues for bugs
- **Email**: developers@adventurebuddhha.com

---

Built with ❤️ by the Adventure Buddha team