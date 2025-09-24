import React, { Suspense, lazy, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Compass, Camera } from 'lucide-react';

// Lazy load the WebGL component
const WebGLFloatingObjects = lazy(() => import('./WebGLFloatingObjects'));

interface FloatingObjectsProps {
  className?: string;
}

// Fallback SVG floating objects
function SVGFloatingObjects({ className }: FloatingObjectsProps) {
  const objects = useMemo(() => [
    { id: 1, Icon: MapPin, x: '10%', y: '20%', delay: 0, color: 'text-primary' },
    { id: 2, Icon: Compass, x: '80%', y: '30%', delay: 0.5, color: 'text-accent' },
    { id: 3, Icon: Camera, x: '20%', y: '70%', delay: 1, color: 'text-primary' },
  ], []);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {objects.map(({ id, Icon, x, y, delay, color }) => (
        <motion.div
          key={id}
          className={`absolute ${color} opacity-20`}
          style={{ left: x, top: y }}
          initial={{ y: 0, rotate: 0, scale: 0.8 }}
          animate={{
            y: [-10, 10, -10],
            rotate: [-5, 5, -5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 6,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Icon className="w-8 h-8 md:w-12 md:h-12" />
        </motion.div>
      ))}
    </div>
  );
}

// WebGL capability detection
function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function HeroFloatingObjects({ className }: FloatingObjectsProps) {
  const [webGLSupported, setWebGLSupported] = useState<boolean | null>(null);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    // Check WebGL support
    setWebGLSupported(isWebGLSupported());
  }, []);

  const shouldUseWebGL = webGLSupported && 
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches && 
    !webGLError;

  // Handle WebGL errors
  const handleWebGLError = () => {
    setWebGLError(true);
  };

  // If we haven't determined WebGL support yet or there was an error, show SVG fallback
  if (webGLSupported === null || webGLError || !shouldUseWebGL) {
    return <SVGFloatingObjects className={className} />;
  }

  return (
    <Suspense fallback={<SVGFloatingObjects className={className} />}>
      <ErrorBoundary onError={handleWebGLError}>
        <WebGLFloatingObjects className={className} />
      </ErrorBoundary>
    </Suspense>
  );
}

// Simple error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WebGL Error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}