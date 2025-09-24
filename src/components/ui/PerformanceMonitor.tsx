import { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  onPerformanceIssue?: (fps: number) => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  children,
  onPerformanceIssue
}) => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);

  useEffect(() => {
    let animationFrameId: number;

    const measureFPS = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        fpsRef.current = Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current));
        frameCountRef.current = 0;
        lastTimeRef.current = now;

        // Alert if FPS drops below 50
        if (fpsRef.current < 50 && onPerformanceIssue) {
          onPerformanceIssue(fpsRef.current);
        }
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onPerformanceIssue]);

  return <>{children}</>;
};

export default PerformanceMonitor;