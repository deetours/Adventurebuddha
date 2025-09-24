import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface CounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function Counter({ 
  end, 
  duration = 2000, 
  prefix = '', 
  suffix = '',
  className = ''
}: CounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible] = useScrollAnimation(0.5);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Ease-out function for smooth animation
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      const currentCount = Math.floor(easeOut * end);
      
      setCount(currentCount);
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animateCount);
      }
    };

    if (isVisible && count === 0) {
      animationFrame = requestAnimationFrame(animateCount);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration, count]);

  return (
    <span className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}